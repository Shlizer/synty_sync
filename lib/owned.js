// Library of purchased packs: syntystore.com/apps/downloads (HTML, requires a session).
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');
const { fetchRetry, sleep } = require('./http');
const { pickBestUnity, statusOf, norm } = require('./pick');
const { LocalizedError } = require('./i18n');

const BASE = 'https://syntystore.com';
const ITEM_SEL = 'a[href*="/order_items/"]';
const DL_SEL = 'a[href*="/apps/downloads/downloads/"]';

class LoginRequired extends LocalizedError {
  constructor() { super('error.loginRequired'); this.code = 'LOGIN'; }
}

function isLoginUrl(u) {
  const h = new URL(u).hostname;
  return h.startsWith('account.') || h.endsWith('shopify.com');
}

async function getHtml(ses, url) {
  const res = await fetchRetry(ses.fetch.bind(ses), url, { credentials: 'include', redirect: 'follow' });
  if (res.url && isLoginUrl(res.url)) throw new LoginRequired();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const html = await res.text();
  // Without a store session the app proxy returns 200 with an empty page (customerId: null).
  if (/customerId"?:\s*null/.test(html) && !html.includes('/apps/downloads/downloads/') && !html.includes('/order_items/')) throw new LoginRequired();
  return { html, url: res.url || url };
}

// The widest ancestor containing exactly one matching link - the item's "card".
function cardOf(a, sel) {
  let el = a;
  while (el.parentNode && el.parentNode.querySelectorAll && el.parentNode.querySelectorAll(sel).length === 1) el = el.parentNode;
  return el;
}

const lines = (el) => el.structuredText.split('\n').map((s) => s.trim()).filter(Boolean);

async function listItems(ses, log) {
  const items = new Map();
  let { html, url } = await getHtml(ses, `${BASE}/apps/downloads/orders`);
  for (let page = 1; page < 100; page++) {
    const root = parse(html);
    for (const a of root.querySelectorAll(`main ${ITEM_SEL}`)) {
      const href = a.getAttribute('href').split('?')[0];
      if (items.has(href)) continue;
      const title = lines(cardOf(a, ITEM_SEL)).find((l) => l.length > 2) || '';
      items.set(href, { href, title });
    }
    const next = root.querySelectorAll('main a').find((a) => /next/i.test(a.text));
    if (!next) break;
    await sleep(400);
    ({ html } = await getHtml(ses, new URL(next.getAttribute('href'), url).toString()));
    log?.('log.libraryPage', { page: page + 1, n: items.size });
  }
  return [...items.values()];
}

async function readItem(ses, item) {
  const { html } = await getHtml(ses, BASE + item.href);
  const root = parse(html);
  const main = root.querySelector('main') || root;
  const files = [];
  let icon = null;
  for (const a of main.querySelectorAll(DL_SEL)) {
    const ls = lines(cardOf(a, DL_SEL));
    const href = new URL(a.getAttribute('href'), BASE).toString();
    const vLine = ls.find((l) => /\|\s*v?[\d_.]+/.test(l));
    const size = (ls.join(' ').match(/\(([\d.,]+\s*[KMGT]?B)\)/i) || [])[1] || null;
    if (!vLine) {
      if (/_ICON\.png/i.test(ls[0] || '')) icon = href;
      continue;
    }
    const [variant, rest] = vLine.split('|').map((s) => s.trim());
    const version = (rest.match(/v?\d+(?:[_.]\d+)*/) || [rest])[0];
    const name = ls[ls.indexOf(vLine) - 1] || ls[0];
    files.push({ name, variant, version, size, href });
  }
  if (!item.title) {
    item.title = lines(main).find((l) => !/^(library|search)$/i.test(l)) || item.href;
  }
  return { files, icon };
}

const STOP = new Set(['polygon', 'animation', 'interface', 'sidekick', 'modular', 'characters', 'character', 'pack', 'the', 'and', 'of', 'synty']);
const words = (s) => new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)));

function matchCatalog(title, catalog) {
  const n = norm(title);
  const list = Object.values(catalog);
  const exact = list.find((c) => norm(c.title) === n);
  if (exact) return exact;
  const w = words(title);
  let best = null, bestScore = 0;
  for (const c of list) {
    const cw = words(c.title);
    const inter = [...w].filter((x) => cw.has(x)).length;
    const score = inter / Math.max(1, new Set([...w, ...cw]).size);
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return bestScore >= 0.75 ? best : null;
}

function guessCategory(fileBase, title = '') {
  if (/\bmini\b/i.test(title) || /^POLYGON_Mini/i.test(fileBase || '')) return 'Other';
  const p = (fileBase || '').split('_')[0].toUpperCase();
  return { ANIMATION: 'Animation', INTERFACE: 'Interface', POLYGON: 'Polygon', SIDEKICK: 'Sidekick' }[p] || 'Other';
}

// Icon from the library's *_ICON.png file - for packs outside the catalog (SIMPLE, Mini...).
async function saveIcon(ses, store, key, href) {
  const rel = `icons/${key}.png`;
  const file = path.join(store.root, rel);
  if (fs.existsSync(file)) return rel;
  try {
    const res = await fetchRetry(ses.fetch.bind(ses), href, { credentials: 'include', redirect: 'follow' });
    if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) return null;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    return rel;
  } catch { return null; }
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function checkOwned(ses, store, log, progress) {
  const items = await listItems(ses, log);
  log?.('log.libraryItems', { n: items.length });
  const prev = store.data.owned;
  const owned = {};
  let done = 0;
  const queue = [...items];
  const worker = async () => {
    while (queue.length) {
      const item = queue.shift();
      const { files, icon } = await readItem(ses, item);
      const best = pickBestUnity(files);
      const cat = matchCatalog(item.title, store.data.catalog);
      const key = cat ? cat.handle : slug(item.title);
      const entry = owned[key] || {
        key,
        title: cat ? cat.title : item.title,
        category: cat ? cat.category : guessCategory(best?.name, item.title),
        handle: cat?.handle || null,
        itemUrl: BASE + item.href,
        iconUrl: icon,
        local: prev[key]?.local || null,
      };
      // The same pack in several orders - take the newest version.
      if (best && (!entry.latest || pickBestUnity([entry.latest, best]).href === best.href)) {
        entry.latest = { name: best.name, variant: best.variant, version: best.version, size: best.size, href: best.href };
        entry.itemUrl = BASE + item.href;
      }
      if (!cat && icon) entry.icon = await saveIcon(ses, store, key, icon);
      entry.variants = files.map((f) => `${f.variant} ${f.version}`);
      entry.status = statusOf(entry);
      owned[key] = entry;
      progress?.({ done: ++done, total: items.length, title: entry.title });
      await sleep(250);
    }
  };
  await Promise.all([worker(), worker(), worker()]);

  // Keep downloaded files of packs that vanished from the list (e.g. a matching error).
  for (const [k, v] of Object.entries(prev)) if (!owned[k] && v.local) owned[k] = { ...v, status: 'unknown' };

  store.data.owned = owned;
  store.data.checked_at = new Date().toISOString();
  store.save();
  return owned;
}

module.exports = { checkOwned, LoginRequired, isLoginUrl, guessCategory, matchCatalog };
