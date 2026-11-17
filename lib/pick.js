// Versions: picking the best Unity file and comparisons.

// "v1_1_3" / "v1.01" / "1_7_0" -> [1,1,3]
function parseVersion(v) {
  if (!v) return [];
  return String(v).replace(/^v/i, '').split(/[_.]/).filter(Boolean).map((n) => parseInt(n, 10) || 0);
}

function cmp(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
}

// "Unity_2021_3" -> [2021,3]; "Unity_6" / "Unity_6_2" -> [6000,2]; null when it's not Unity.
// Variants without the "Unity_" prefix (e.g. "POLYGON_Werewolf_2022_3") are recognized by a trailing year/6000 number.
function parseEditor(variant) {
  const v = variant || '';
  const m = /^Unity(?:_Project)?_?(\d+)(?:_(\d+))?/i.exec(v) || (!/unreal|godot/i.test(v) && /_((?:20\d\d)|6000)_(\d+)$/.exec(v));
  if (!m) return null;
  let major = parseInt(m[1], 10);
  if (major < 100) major *= 1000; // Unity 6 = 6000.x
  return [major, parseInt(m[2] || '0', 10)];
}

// files: [{name, variant, version, size, href}] -> the best Unity file or null
function pickBestUnity(files) {
  const unity = files
    .map((f) => ({ ...f, editor: parseEditor(f.variant) }))
    .filter((f) => f.editor);
  unity.sort((a, b) => cmp(b.editor, a.editor) || cmp(parseVersion(b.version), parseVersion(a.version)));
  return unity[0] || null;
}

// Status of an owned pack relative to the local file.
function statusOf(owned) {
  if (!owned.latest) return 'no-unity';
  if (!owned.local) return 'missing';
  const dv = cmp(parseVersion(owned.latest.version), parseVersion(owned.local.version));
  if (dv > 0) return 'outdated';
  // File for an older Unity - even with a "higher" number (old version schemes like v1_30).
  const le = parseEditor(owned.latest.variant);
  const ce = parseEditor(owned.local.variant);
  if (le && ce && cmp(le, ce) > 0) return 'editor-upgrade';
  return 'current';
}

// File name like "ANIMATION_Idles_Unity_2021_3_v1_1_2.unitypackage"
function parseFileName(file) {
  const m = /^(.+?)_(Unity_\d+(?:_\d+)?)_(v\d+(?:_\d+)*)\.unitypackage$/i.exec(file);
  if (m) return { base: m[1], variant: m[2], version: m[3] };
  // Old style: "POLYGON - Dark Fantasy - Low Poly 3D Art by Synty v1.01.unitypackage"
  const o = /^(.+?)\s+v(\d+(?:[._]\d+)*)\.unitypackage$/i.exec(file);
  if (o) return { base: o[1], variant: null, version: 'v' + o[2] };
  return null;
}

const norm = (s) => String(s || '').toLowerCase()
  .replace(/low poly 3d art by synty/g, '')
  .replace(/[^a-z0-9]+/g, '');

module.exports = { parseVersion, cmp, parseEditor, pickBestUnity, statusOf, parseFileName, norm };
