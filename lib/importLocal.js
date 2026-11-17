// Recognizes existing .unitypackage files (from settings.importDirs and the library folder) and attaches them to owned packs.
const fs = require('fs');
const path = require('path');
const { parseFileName, parseVersion, parseEditor, cmp, statusOf, norm } = require('./pick');

function walk(dir, out = []) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '_app') walk(p, out); }
    else if (/\.unitypackage$/i.test(e.name)) out.push(p);
  }
  return out;
}

// Old file names ("City_Unity_2020_3_v1_10_1", "POLYGON Horror Carnival - ... v1.02"):
// every word of the name must appear in the title; among several candidates the closest one wins (Jaccard).
const STOP = new Set(['polygon', 'pack', 'the', 'and', 'of', 'synty', 'low', 'poly', '3d', 'art', 'by']);
const words = (s) => new Set(String(s).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  .replace(/sci[\s_-]?fi/g, 'scifi').split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)));
function matchOwnedLoose(base, owned) {
  const fw = words(base);
  if (!fw.size) return null;
  let best = null, bestScore = 0;
  for (const o of owned) {
    if (/\bmini\b/i.test(o.title) !== fw.has('mini')) continue;
    const tw = words(o.title);
    if (![...fw].every((w) => tw.has(w))) continue;
    const score = fw.size / new Set([...fw, ...tw]).size;
    if (score > bestScore) { bestScore = score; best = o; }
  }
  return best;
}

function better(a, b) { // is a newer than b
  return cmp(parseVersion(a.version), parseVersion(b.version)) > 0 ||
    (cmp(parseVersion(a.version), parseVersion(b.version)) === 0 && cmp(parseEditor(a.variant) || [], parseEditor(b.variant) || []) > 0);
}

function scan(store, dirs) {
  const owned = Object.values(store.data.owned);
  const byBase = new Map(owned.filter((o) => o.latest).map((o) => [norm(o.latest.name), o]));
  const best = new Map();
  for (const file of dirs.flatMap((d) => walk(d))) {
    const parsed = parseFileName(path.basename(file));
    if (!parsed) continue;
    let o = byBase.get(norm(parsed.base));
    let fuzzy = false;
    if (!o) {
      o = matchOwnedLoose(parsed.base, owned);
      fuzzy = !!o;
    }
    if (!o) continue;
    const cand = { file, key: o.key, title: o.title, variant: parsed.variant, version: parsed.version, fuzzy,
      inLibrary: path.resolve(file).toLowerCase().startsWith(path.resolve(store.root).toLowerCase() + path.sep) };
    const cur = best.get(o.key);
    if (!cur || better(cand, cur)) best.set(o.key, cand);
  }
  const result = [];
  for (const c of best.values()) {
    const o = store.data.owned[c.key];
    if (o.local && !better(c, o.local) && path.resolve(o.local.path) !== path.resolve(c.file)) continue; // we already have one that is not worse
    if (o.local && path.resolve(o.local.path) === path.resolve(c.file)) continue;
    const preview = statusOf({ latest: o.latest, local: { variant: c.variant, version: c.version } });
    result.push({ ...c, latest: o.latest ? `${o.latest.variant} ${o.latest.version}` : null, statusAfter: preview });
  }
  return result.sort((a, b) => a.title.localeCompare(b.title));
}

function apply(store, picks) {
  const moved = [];
  for (const p of picks) {
    const o = store.data.owned[p.key];
    if (!o || !fs.existsSync(p.file)) continue;
    let target = p.file;
    if (!p.inLibrary) {
      target = path.join(store.categoryDir(o.category), path.basename(p.file));
      if (path.resolve(target) !== path.resolve(p.file)) {
        fs.rmSync(target, { force: true });
        try { fs.renameSync(p.file, target); }
        catch { fs.copyFileSync(p.file, target); fs.rmSync(p.file); } // different drive
      }
    }
    if (o.local?.path && path.resolve(o.local.path) !== path.resolve(target)) fs.rmSync(o.local.path, { force: true });
    o.local = { path: target, variant: p.variant, version: p.version, size: fs.statSync(target).size, at: new Date().toISOString(), imported: true };
    o.status = statusOf(o);
    moved.push(target);
  }
  store.save();
  return moved;
}

module.exports = { scan, apply };
