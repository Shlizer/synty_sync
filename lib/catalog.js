// Public Synty catalog (Shopify products.json) + icons.
const fs = require('fs');
const path = require('path');
const { fetchRetry, sleep } = require('./http');

const BASE = 'https://syntystore.com';
const TYPE_TO_CATEGORY = {
  'Animation': 'Animation',
  'Interface': 'Interface',
  'Polygon': 'Polygon',
  'Sidekick Pack': 'Sidekick',
};

async function fetchAll(listPath, log) {
  const out = [];
  for (let page = 1; ; page++) {
    const res = await fetchRetry(fetch, `${BASE}${listPath}?limit=250&page=${page}`);
    const json = await res.json();
    if (!json.products || !json.products.length) break;
    out.push(...json.products);
    await sleep(700);
  }
  log?.('log.fetchedList', { path: listPath, n: out.length });
  return out;
}

async function refreshCatalog(store, log) {
  // The map collection marks the Maps category; everything else goes by product_type.
  const maps = new Set((await fetchAll('/collections/synty-map-packs/products.json', log)).map((p) => p.handle));
  const all = await fetchAll('/products.json', log);

  const catalog = {};
  for (const p of all) {
    let category = TYPE_TO_CATEGORY[p.product_type];
    if (maps.has(p.handle)) category = 'Maps';
    if (!category) continue; // Mini, Simple, bundles, gift cards...
    catalog[p.handle] = {
      handle: p.handle,
      title: p.title.trim(),
      category,
      url: `${BASE}/products/${p.handle}`,
      image: p.images?.[0]?.src || null,
      updated_at: p.updated_at,
      published_at: p.published_at,
      price: p.variants?.[0]?.price,
    };
  }

  const iconDir = path.join(store.root, 'icons');
  fs.mkdirSync(iconDir, { recursive: true });
  const items = Object.values(catalog);
  let fetched = 0;
  for (const item of items) {
    const file = path.join(iconDir, `${item.handle}.png`);
    if (item.image && !fs.existsSync(file)) {
      try {
        const u = new URL(item.image.startsWith('//') ? 'https:' + item.image : item.image);
        u.searchParams.set('width', '320');
        const res = await fetchRetry(fetch, u.toString());
        if (res.ok) {
          fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
          fetched++;
        }
      } catch (e) {
        log?.('log.iconFailed', { handle: item.handle, error: e.message });
      }
    }
    item.icon = fs.existsSync(file) ? `icons/${item.handle}.png` : null;
  }
  log?.('log.catalogDone', { n: items.length, icons: fetched });

  store.data.catalog = catalog;
  store.data.catalog_at = new Date().toISOString();
  store.save();
  return catalog;
}

module.exports = { refreshCatalog };
