const $ = (s) => document.querySelector(s);
const { t } = i18n;
const CATS = ['Animation', 'Interface', 'Polygon', 'Sidekick', 'Maps', 'Other'];
const NEEDS = new Set(['outdated', 'missing', 'editor-upgrade']);

let S = null;
let tab = 'owned';
const ui = { q: '', cats: new Set(), status: null, importRows: [] };
// Log entries are kept as messages so they can be re-translated on a language switch.
const logEntries = [];

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iconFor = (handle, own) => S.catalog[handle]?.icon ? `synty://lib/${S.catalog[handle].icon}` : own ? `synty://lib/${own}` : null;
const fmtDate = (d) => d ? new Date(d).toLocaleString(i18n.locale(), { dateStyle: 'short', timeStyle: 'short' }) : '-';
const ver = (v) => v ? `${v.variant ? v.variant.replace('Unity_', 'U') + ' ' : ''}${v.version}` : '-';
const statusLabel = (s) => (s ? t(`status.${s}`) : '');
const catLabel = (c) => t(`cat.${c}`);

// ---------- Language ----------

function applyStaticTexts() {
  document.documentElement.lang = i18n.getLanguage();
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('#lang button').forEach((b) => b.classList.toggle('on', b.dataset.lang === i18n.getLanguage()));
}

function renderLanguagePicker() {
  const box = $('#lang');
  for (const [code, { name, flag }] of Object.entries(i18n.LANGUAGES)) {
    const b = document.createElement('button');
    b.dataset.lang = code;
    b.title = name;
    b.innerHTML = `<img src="flags/${flag}.svg" alt="">${code.toUpperCase()}`;
    b.onclick = () => api.setLanguage(code);
    box.append(b);
  }
}

let appliedLang = null;
function setLanguage(lang) {
  if (lang === appliedLang) return false;
  appliedLang = i18n.setLanguage(lang);
  applyStaticTexts();
  renderLog();
  if (S && S.loggedIn !== null) showLogin(S.loggedIn);
  return true;
}

// ---------- Log ----------

function log(key, params) {
  logEntries.push({ time: new Date(), msg: { key, params } });
  renderLog();
}

function renderLog() {
  const el = $('#log');
  el.textContent = logEntries.map((e) => `${e.time.toLocaleTimeString(i18n.locale())}  ${i18n.format(e.msg)}\n`).join('');
  el.scrollTop = el.scrollHeight;
}

// ---------- Views ----------

function matches(title, category) {
  if (ui.q && !title.toLowerCase().includes(ui.q)) return false;
  if (ui.cats.size && !ui.cats.has(category)) return false;
  return true;
}

function card({ icon, title, category, badge, badgeClass, body, buttons, dim, onImg }) {
  const el = document.createElement('div');
  el.className = 'card' + (dim ? ' dim' : '');
  el.innerHTML = `
    <div class="img" style="${icon ? `background-image:url('${icon}')` : ''}">
      ${badge ? `<span class="badge ${badgeClass}">${esc(badge)}</span>` : ''}
      <span class="cat">${esc(catLabel(category))}</span>
    </div>
    <div class="body"><div class="title">${esc(title)}</div>${body || ''}<div class="row"></div></div>`;
  for (const b of buttons || []) {
    const btn = document.createElement('button');
    btn.textContent = b.label;
    if (b.cls) btn.className = b.cls;
    btn.disabled = !!b.disabled;
    btn.onclick = b.onclick;
    el.querySelector('.row').append(btn);
  }
  if (onImg) el.querySelector('.img').onclick = onImg;
  return el;
}

function renderOwned() {
  const view = $('#view-owned');
  view.innerHTML = '';
  const list = Object.values(S.owned)
    .filter((o) => matches(o.title, o.category))
    .filter((o) => !ui.status || (ui.status === 'needs' ? NEEDS.has(o.status) : o.status === ui.status))
    .sort((a, b) => (NEEDS.has(b.status) - NEEDS.has(a.status)) || a.title.localeCompare(b.title));
  if (!list.length) {
    view.innerHTML = `<div class="empty">${esc(t(Object.keys(S.owned).length ? 'empty.noResults' : 'empty.owned'))}</div>`;
    return;
  }
  for (const o of list) {
    const needs = NEEDS.has(o.status);
    view.append(card({
      icon: iconFor(o.handle, o.icon), title: o.title, category: o.category,
      badge: statusLabel(o.status), badgeClass: o.status,
      body: `<div class="ver">${esc(t('card.onDisk'))} <b>${esc(ver(o.local))}</b></div>` +
        `<div class="ver">${esc(t('card.latest'))} <b>${esc(ver(o.latest))}</b>${o.latest?.size ? ` | ${esc(o.latest.size)}` : ''}</div>`,
      onImg: () => o.handle && api.openUrl(S.catalog[o.handle].url),
      buttons: [
        { label: t(o.local ? (needs ? 'btn.update' : 'btn.redownload') : 'btn.download'), cls: needs ? 'accent' : '',
          disabled: !!S.busy || !o.latest, onclick: () => download([o.key]) },
        ...(o.local ? [{ label: t('btn.showFile'), onclick: () => api.showItem(o.local.path) }] : []),
      ],
    }));
  }
}

function renderCatalog() {
  const view = $('#view-catalog');
  view.innerHTML = '';
  const ownedHandles = new Set(Object.values(S.owned).map((o) => o.handle).filter(Boolean));
  const list = Object.values(S.catalog)
    .filter((c) => matches(c.title, c.category))
    .filter((c) => !ui.status || (ui.status === 'owned' ? ownedHandles.has(c.handle) : !ownedHandles.has(c.handle)))
    .sort((a, b) => a.title.localeCompare(b.title));
  if (!list.length) {
    view.innerHTML = `<div class="empty">${esc(t(Object.keys(S.catalog).length ? 'empty.noResults' : 'empty.catalog'))}</div>`;
    return;
  }
  for (const c of list) {
    const owned = ownedHandles.has(c.handle);
    view.append(card({
      icon: iconFor(c.handle), title: c.title, category: c.category,
      badge: owned ? t('badge.owned') : null, badgeClass: 'owned', dim: !owned && Object.keys(S.owned).length > 0,
      body: `<div class="ver">${esc(t('card.released', { year: new Date(c.published_at || c.updated_at).getFullYear() || '-' }))}</div>`,
      onImg: () => api.openUrl(c.url),
      buttons: [{ label: t('btn.store'), onclick: () => api.openUrl(c.url) }],
    }));
  }
}

function renderImport() {
  const table = $('#importTable');
  const rows = ui.importRows;
  if (!rows.length) {
    table.innerHTML = `<tr><td class="empty">${esc(t('empty.import'))}</td></tr>`;
    $('#btnApply').disabled = true;
    return;
  }
  // Keep the user's checkbox choices across re-renders (e.g. a language switch).
  const unchecked = new Set([...table.querySelectorAll('input[data-i]:not(:checked)')].map((c) => +c.dataset.i));
  const cols = ['import.col.pack', 'import.col.file', 'import.col.fileVersion', 'import.col.latest', 'import.col.after'];
  table.innerHTML = `<tr><th><input type="checkbox" id="chkAll" ${unchecked.size ? '' : 'checked'}></th>${cols.map((k) => `<th>${esc(t(k))}</th>`).join('')}</tr>` +
    rows.map((r, i) => `<tr><td><input type="checkbox" data-i="${i}" ${unchecked.has(i) ? '' : 'checked'}></td><td>${esc(r.title)}${r.fuzzy ? ` <span class="meta">${esc(t('import.fuzzy'))}</span>` : ''}</td>
      <td class="path">${esc(r.file)}</td><td>${esc(ver(r))}</td><td>${esc(r.latest || '-')}</td><td>${esc(statusLabel(r.statusAfter))}</td></tr>`).join('');
  $('#chkAll').onchange = (e) => table.querySelectorAll('input[data-i]').forEach((c) => { c.checked = e.target.checked; });
  $('#btnApply').disabled = !!S.busy;
}

function renderFilters() {
  $('#cats').innerHTML = '';
  for (const c of CATS) {
    const b = document.createElement('button');
    b.dataset.cat = c;
    b.textContent = catLabel(c); b.className = ui.cats.has(c) ? 'on' : '';
    b.onclick = () => { ui.cats.has(c) ? ui.cats.delete(c) : ui.cats.add(c); render(); };
    $('#cats').append(b);
  }
  const opts = tab === 'owned' ? ['needs', 'current'] : tab === 'catalog' ? ['owned', 'notowned'] : [];
  $('#statusFilter').innerHTML = '';
  for (const k of opts) {
    const b = document.createElement('button');
    b.textContent = t(`filter.${k}`); b.className = ui.status === k ? 'on' : '';
    b.onclick = () => { ui.status = ui.status === k ? null : k; render(); };
    $('#statusFilter').append(b);
  }
}

function render() {
  if (!S) return;
  const owned = Object.values(S.owned);
  const needs = owned.filter((o) => NEEDS.has(o.status));
  $('#ownedCount').textContent = owned.length || '';
  $('#catalogCount').textContent = Object.keys(S.catalog).length || '';
  $('#btnUpdateAll').textContent = t('btn.updateAll', { n: needs.length });
  $('#btnUpdateAll').disabled = !!S.busy || !needs.length;
  $('#btnCatalog').disabled = $('#btnCheck').disabled = $('#btnScan').disabled = !!S.busy;
  $('#btnCancel').hidden = S.busy !== 'download';
  $('#meta').textContent = t('meta', { catalog: fmtDate(S.catalog_at), checked: fmtDate(S.checked_at), root: S.root });
  $('#progress').hidden = !S.busy;
  if (S.busy) $('#progressText').textContent = $('#progressText').textContent || t(`op.${S.busy}`) + '...';
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  for (const v of ['owned', 'catalog', 'import']) $(`#view-${v}`).hidden = v !== tab;
  $('.filters').style.visibility = tab === 'import' ? 'hidden' : '';
  renderFilters();
  if (tab === 'owned') renderOwned();
  else if (tab === 'catalog') renderCatalog();
  else renderImport();
}

// ---------- Session ----------

function showLogin(ok) {
  const el = $('#login');
  el.textContent = t(ok ? 'login.ok' : 'login.bad');
  el.className = 'login' + (ok ? '' : ' bad');
  el.onclick = ok ? null : login;
}

async function refreshLogin() {
  const ok = await api.loggedIn();
  showLogin(ok);
  return ok;
}

async function login() {
  log('log.openingLogin');
  const ok = await api.login();
  log(ok ? 'log.loggedIn' : 'log.loginClosed');
  await refreshLogin();
  return ok;
}

async function guarded(fn) {
  let r = await fn();
  if (r && r.login && await login()) r = await fn();
  return r;
}

async function download(keys) {
  await guarded(() => api.download(keys));
}

// ---------- Events ----------

api.on('state', (s) => {
  S = s;
  setLanguage(s.lang);
  if (s.loggedIn !== null) showLogin(s.loggedIn);
  if (!s.busy) $('#progressText').textContent = '';
  render();
});
api.on('log', (m) => log(m.key, m.params));
api.on('progress', (p) => {
  let pct = 0, text = '';
  if (p.kind === 'check') {
    pct = p.done / p.total;
    text = t('progress.check', { done: p.done, total: p.total, title: p.title });
  } else {
    pct = p.total ? p.received / p.total : 0;
    const mb = (n) => (n / 1048576).toFixed(1);
    text = t('progress.download', { index: p.index, count: p.count, title: p.title, amount: mb(p.received) + (p.total ? ' / ' + mb(p.total) : '') });
  }
  $('#bar').style.width = `${Math.round(pct * 100)}%`;
  $('#progressText').textContent = text;
});

document.querySelectorAll('#tabs button').forEach((b) => b.onclick = () => { tab = b.dataset.tab; ui.status = null; render(); });
$('#search').oninput = (e) => { ui.q = e.target.value.trim().toLowerCase(); render(); };
$('#btnCatalog').onclick = () => api.refreshCatalog();
$('#btnCheck').onclick = () => guarded(() => api.check());
$('#btnUpdateAll').onclick = () => download(Object.values(S.owned).filter((o) => NEEDS.has(o.status)).map((o) => o.key));
$('#btnCancel').onclick = () => api.cancel();
$('#btnScan').onclick = async () => {
  if (!Object.keys(S.owned).length) { log('log.checkFirst'); return; }
  ui.importRows = await api.importScan();
  $('#importTable').innerHTML = '';
  log('log.scanDone', { n: ui.importRows.length });
  renderImport();
};
$('#btnApply').onclick = async () => {
  const picks = [...document.querySelectorAll('#importTable input[data-i]:checked')].map((c) => ui.importRows[+c.dataset.i]);
  if (!picks.length) return;
  await api.importApply(picks);
  ui.importRows = ui.importRows.filter((r) => !picks.includes(r));
  $('#importTable').innerHTML = '';
  render();
};

(async () => {
  renderLanguagePicker();
  S = await api.state();
  setLanguage(S.lang);
  render();
  refreshLogin();
})();
