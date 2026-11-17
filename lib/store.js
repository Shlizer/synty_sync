// Library state in library.json (atomic writes).
const fs = require('fs');
const path = require('path');

const CATEGORIES = ['Animation', 'Interface', 'Polygon', 'Sidekick', 'Maps', 'Other'];

class Store {
  constructor(root) {
    this.root = root;
    this.file = path.join(root, 'library.json');
    this.data = { catalog: {}, owned: {}, catalog_at: null, checked_at: null };
    try {
      Object.assign(this.data, JSON.parse(fs.readFileSync(this.file, 'utf8')));
    } catch { /* first run */ }
  }

  save() {
    fs.mkdirSync(this.root, { recursive: true });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.file);
  }

  categoryDir(category) {
    const dir = path.join(this.root, CATEGORIES.includes(category) ? category : 'Other');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  // Drops local entries whose files have disappeared from disk.
  validateLocal() {
    for (const o of Object.values(this.data.owned)) {
      if (o.local && !fs.existsSync(o.local.path)) o.local = null;
    }
  }
}

module.exports = { Store, CATEGORIES };
