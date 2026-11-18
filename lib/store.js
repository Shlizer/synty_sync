// Library state in library.json (atomic writes).
const fs = require('fs');
const path = require('path');
const { statusOf } = require('./pick');

const CATEGORIES = ['Animation', 'Interface', 'Polygon', 'Sidekick', 'Maps', 'Other'];

// Windows paths are case-insensitive.
const normPath = (p) => (process.platform === 'win32' ? path.resolve(p).toLowerCase() : path.resolve(p));
const samePath = (a, b) => normPath(a) === normPath(b);
const isInside = (file, dir) => normPath(file).startsWith(normPath(dir) + path.sep);

class Store {
  constructor(root) {
    this.root = root;
    this.file = path.join(root, 'library.json');
    this.data = { catalog: {}, owned: {}, catalog_at: null, checked_at: null };
    this.loaded = false; // true when the folder already held a library
    try {
      Object.assign(this.data, JSON.parse(fs.readFileSync(this.file, 'utf8')));
      this.loaded = true;
    } catch { /* first run */ }
  }

  save() {
    fs.mkdirSync(this.root, { recursive: true });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.file);
  }

  dirFor(category) {
    return path.join(this.root, CATEGORIES.includes(category) ? category : 'Other');
  }

  categoryDir(category) {
    const dir = this.dirFor(category);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  // Re-checks local files. A file missing at its saved path is looked up by name in its category
  // folder (the library may have been moved); if it's not there either, the local entry is dropped.
  // strict: files outside this library folder are treated as missing too.
  // Returns true when anything changed.
  validateLocal({ strict = false } = {}) {
    let changed = false;
    for (const [key, o] of Object.entries(this.data.owned)) {
      if (!o.local) continue;
      if (fs.existsSync(o.local.path) && (!strict || isInside(o.local.path, this.root))) continue;
      const moved = path.join(this.dirFor(o.category), path.basename(o.local.path));
      o.local = fs.existsSync(moved) ? { ...o.local, path: moved } : null;
      changed = true;
      // 'unknown' entries are kept only for their local file.
      if (o.status === 'unknown') { if (!o.local) delete this.data.owned[key]; }
      else o.status = statusOf(o);
    }
    return changed;
  }

  // Takes over the pack list and icons of another library (when switching to an empty folder).
  // Pack files are not moved; entries keep only files already present in this folder.
  adopt(other) {
    this.data = JSON.parse(JSON.stringify(other.data));
    const icons = path.join(other.root, 'icons');
    if (fs.existsSync(icons)) fs.cpSync(icons, path.join(this.root, 'icons'), { recursive: true, force: false });
    this.validateLocal({ strict: true });
    this.save();
  }
}

module.exports = { Store, CATEGORIES, samePath };
