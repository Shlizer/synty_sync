// Downloads files with the Synty session: stream to .part, then replace the old version.
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const { fetchRetry } = require('./http');
const { LocalizedError } = require('./i18n');
const { isLoginUrl, LoginRequired } = require('./owned');
const { statusOf } = require('./pick');

function fileNameFrom(res, fallback) {
  const cd = res.headers.get('content-disposition') || '';
  const m = /filename\*=UTF-8''([^;]+)/i.exec(cd) || /filename="?([^";]+)"?/i.exec(cd);
  if (m) return decodeURIComponent(m[1]).trim();
  const last = !res.url ? "" : decodeURIComponent(new URL(res.url).pathname.split('/').pop() || '');
  return /\.\w{2,12}$/.test(last) ? last : fallback;
}

async function downloadOwned(ses, store, entry, onProgress, signal) {
  const res = await fetchRetry(ses.fetch.bind(ses), entry.latest.href, { credentials: 'include', redirect: 'follow', signal });
  if (res.url && isLoginUrl(res.url)) throw new LoginRequired();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ctype = res.headers.get('content-type') || '';
  if (ctype.includes('text/html')) throw new LocalizedError('error.htmlInsteadOfFile');

  const name = fileNameFrom(res, `${entry.latest.name}_${entry.latest.variant}_${entry.latest.version}.unitypackage`)
    .replace(/[<>:"/\\|?*]/g, '_');
  const dir = store.categoryDir(entry.category);
  const target = path.join(dir, name);
  const part = target + '.part';
  const total = Number(res.headers.get('content-length')) || 0;

  let received = 0, lastEmit = 0;
  const counter = new (require('stream').Transform)({
    transform(chunk, _enc, cb) {
      received += chunk.length;
      const now = Date.now();
      if (now - lastEmit > 250) { lastEmit = now; onProgress?.({ received, total }); }
      cb(null, chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(res.body), counter, fs.createWriteStream(part), { signal });
  } catch (e) {
    fs.rmSync(part, { force: true });
    throw e;
  }
  if (total && received !== total) {
    fs.rmSync(part, { force: true });
    throw new LocalizedError('error.incompleteFile', { received, total });
  }

  const old = entry.local?.path;
  fs.rmSync(target, { force: true });
  fs.renameSync(part, target);
  if (old && path.resolve(old) !== path.resolve(target)) fs.rmSync(old, { force: true });

  entry.local = { path: target, variant: entry.latest.variant, version: entry.latest.version, size: received, at: new Date().toISOString() };
  entry.status = statusOf(entry);
  store.save();
  onProgress?.({ received, total: received, done: true });
  return target;
}

module.exports = { downloadOwned };
