const { app, BrowserWindow, ipcMain, session, shell, protocol, net, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const i18n = require('./lib/i18n');
const { Store, samePath } = require('./lib/store');
const { refreshCatalog } = require('./lib/catalog');
const { checkOwned } = require('./lib/owned');
const { downloadOwned } = require('./lib/download');
const importLocal = require('./lib/importLocal');

const APP_ICON = path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png');
const PARTITION = 'persist:synty';
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
let settings = null; // filled in loadSettings() - app.getPath() needs a ready app
let store, win, busy = null, abort = null, sessionOk = null;

protocol.registerSchemesAsPrivileged([{ scheme: 'synty', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

function loadSettings() {
  settings = { root: path.join(app.getPath('documents'), 'Synty'), importDirs: [] };
  try { Object.assign(settings, JSON.parse(fs.readFileSync(settingsFile(), 'utf8'))); } catch { /* defaults */ }
  // No saved language yet -> follow the system language.
  i18n.setLanguage(settings.lang || i18n.resolveLanguage(app.getLocale()));
  openLibrary();
}

function openLibrary() {
  store = new Store(settings.root);
  if (store.validateLocal()) store.save();
}

// Switches the library folder. An existing library there is opened as is; an empty folder takes over
// the current pack list and icons, and the old folder becomes an import folder so the Import tab can
// move the pack files over.
function changeRoot(next) {
  const prev = { root: settings.root, store };
  settings.root = next;
  try {
    openLibrary();
    const hasData = Object.keys(prev.store.data.owned).length || Object.keys(prev.store.data.catalog).length;
    if (store.loaded) {
      log('log.rootOpened', { root: next });
    } else if (hasData) {
      store.adopt(prev.store);
      if (!settings.importDirs.some((d) => samePath(d, prev.root))) settings.importDirs.push(prev.root);
      log('log.rootAdopted', { root: next, prev: prev.root });
    } else {
      log('log.rootChanged', { root: next });
    }
    saveSettings();
  } catch (e) {
    settings.root = prev.root;
    store = prev.store;
    log('log.error', { op: opMessage('changeRoot'), error: i18n.errorMessage(e) });
    console.error(e);
  }
}
const saveSettings = () => fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2));

const send = (ch, data) => win && !win.isDestroyed() && win.webContents.send(ch, data);
// Log entries travel as { key, params } so the renderer can re-translate them on a language switch.
const log = (key, params = {}) => { console.log(i18n.t(key, params, 'en')); send('log', { key, params }); };
const consoleLog = (key, params = {}) => console.log(i18n.t(key, params, 'en'));
const ses = () => session.fromPartition(PARTITION);
const opMessage = (op) => ({ key: `op.${op}` });

function snapshot() {
  return { ...store.data, root: settings.root, importDirs: settings.importDirs, busy, loggedIn: sessionOk, lang: i18n.getLanguage() };
}

// One operation at a time; login failures are returned as { login: true }.
// `op` is an id: 'catalog' | 'check' | 'download'.
async function run(op, fn) {
  if (busy) throw new i18n.LocalizedError('error.busy', { op: opMessage(busy) });
  busy = op;
  send('state', snapshot());
  try {
    return { ok: true, result: await fn() };
  } catch (e) {
    if (e.code === 'LOGIN') { log('log.sessionExpired'); return { ok: false, login: true }; }
    if (e.name === 'AbortError') { log('log.cancelled'); return { ok: false }; }
    log('log.error', { op: opMessage(op), error: i18n.errorMessage(e) });
    console.error(e);
    return { ok: false, error: e.message };
  } finally {
    busy = null; abort = null;
    send('state', snapshot());
  }
}

// The store (syntystore.com) picks up the account session (account.syntystore.com) only through SSO
// redirects during a real navigation - a plain fetch can't do that. That's why the library is opened in a window.
const LIBRARY_URL = 'https://syntystore.com/apps/downloads/orders';
const isLibraryUrl = (url) => /^https:\/\/syntystore\.com\/apps\/downloads\/orders\/\d+/.test(url);
const isAuthUrl = (url) => { try { const u = new URL(url); return u.hostname.endsWith('shopify.com') || /login/i.test(u.pathname); } catch { return false; } };

function navigateLibrary(w, timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; clearTimeout(t); resolve(v); } };
    const t = setTimeout(() => finish(false), timeoutMs);
    // Main frame only - the page's own frames (e.g. login_with_shop) redirect too.
    const onNav = (_e, url, _inPlace, isMainFrame = true) => {
      if (!isMainFrame) return;
      if (process.env.SYNTY_TRACE) console.log('nav', url.slice(0, 140));
      if (isLibraryUrl(url)) finish(true);
      else if (isAuthUrl(url) && !w.isVisible()) finish(false); // needs an interactive login
    };
    w.webContents.on('did-navigate', onNav);
    w.webContents.on('did-redirect-navigation', onNav);
    w.on('closed', () => finish(false));
    w.loadURL(LIBRARY_URL);
  });
}

// Silent store-session refresh in a hidden window.
async function ensureSession() {
  const w = new BrowserWindow({ icon: APP_ICON, show: false, webPreferences: { partition: PARTITION } });
  try { return await navigateLibrary(w, 30000); }
  finally { if (!w.isDestroyed()) w.destroy(); }
}

async function openLogin() {
  const w = new BrowserWindow({ icon: APP_ICON, width: 1000, height: 800, parent: win, title: i18n.t('window.loginTitle'),
    webPreferences: { partition: PARTITION } });
  w.setMenuBarVisibility(false);
  const ok = await navigateLibrary(w, 15 * 60 * 1000);
  if (!w.isDestroyed()) w.close();
  return ok;
}

async function isLoggedIn() {
  sessionOk = await ensureSession();
  return sessionOk;
}
async function requireSession() {
  sessionOk = await ensureSession();
  if (!sessionOk) { const e = new Error('login'); e.code = 'LOGIN'; throw e; }
}

function createWindow() {
  win = new BrowserWindow({ icon: APP_ICON,
    width: 1400, height: 900, title: 'Synty Library', backgroundColor: '#15171c',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

app.whenReady().then(() => {
  loadSettings();
  // synty://lib/<path relative to the library folder> - icons from disk
  protocol.handle('synty', (req) => {
    const rel = decodeURIComponent(new URL(req.url).pathname).replace(/^\/+/, '');
    const file = path.resolve(settings.root, rel);
    if (!file.startsWith(path.resolve(settings.root))) return new Response('forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });

  ipcMain.handle('state', () => snapshot());
  ipcMain.handle('loggedIn', () => isLoggedIn());
  ipcMain.handle('login', async () => { const ok = await openLogin(); sessionOk = ok; send('state', snapshot()); return ok; });
  ipcMain.handle('setLanguage', (_e, lang) => {
    settings.lang = i18n.setLanguage(lang);
    saveSettings();
    send('state', snapshot());
    return settings.lang;
  });
  ipcMain.handle('catalog', () => run('catalog', () => refreshCatalog(store, log)));
  ipcMain.handle('check', () => run('check', async () => {
    if (!Object.keys(store.data.catalog).length) await refreshCatalog(store, log);
    await requireSession();
    const owned = await checkOwned(ses(), store, log, (p) => send('progress', { kind: 'check', ...p }));
    const pending = Object.values(owned).filter((o) => o.status !== 'current').length;
    log('log.checkDone', { n: Object.keys(owned).length, pending });
  }));
  ipcMain.handle('download', (_e, keys) => run('download', async () => {
    abort = new AbortController();
    await requireSession();
    const list = keys.map((k) => store.data.owned[k]).filter((o) => o && o.latest);
    let i = 0;
    for (const entry of list) {
      i++;
      log('log.downloadItem', { i, count: list.length, title: entry.title, variant: entry.latest.variant, version: entry.latest.version, size: entry.latest.size || '?' });
      try {
        const file = await downloadOwned(ses(), store, entry, (p) => send('progress', { kind: 'download', key: entry.key, title: entry.title, index: i, count: list.length, ...p }), abort.signal);
        log('log.downloadOk', { file: path.basename(file) });
      } catch (e) {
        if (e.code === 'LOGIN' || e.name === 'AbortError') throw e;
        log('log.downloadFailed', { title: entry.title, error: i18n.errorMessage(e) });
      }
      send('state', snapshot());
    }
  }));
  ipcMain.handle('cancel', () => { abort?.abort(); });
  ipcMain.handle('importScan', () => importLocal.scan(store, [...settings.importDirs, settings.root]));
  ipcMain.handle('importApply', (_e, picks) => { const r = importLocal.apply(store, picks); send('state', snapshot()); log('log.imported', { n: r.length }); return r; });
  ipcMain.handle('showItem', (_e, p) => shell.showItemInFolder(p));
  ipcMain.handle('openUrl', (_e, u) => { if (/^https:\/\/([a-z0-9-]+\.)?syntystore\.com\//.test(u)) shell.openExternal(u); });
  ipcMain.handle('openRoot', () => shell.openPath(settings.root));
  ipcMain.handle('chooseRoot', async () => {
    if (busy) return snapshot();
    const r = await dialog.showOpenDialog(win, { title: i18n.t('dialog.chooseRoot'), properties: ['openDirectory', 'createDirectory'], defaultPath: settings.root });
    const next = r.filePaths?.[0];
    if (!r.canceled && next && !samePath(next, settings.root)) {
      changeRoot(next);
      send('state', snapshot());
    }
    return snapshot();
  });
  ipcMain.handle('addImportDir', async () => {
    const r = await dialog.showOpenDialog(win, { title: i18n.t('dialog.addImportDir'), properties: ['openDirectory'] });
    const dir = r.filePaths?.[0];
    if (!r.canceled && dir && !settings.importDirs.some((d) => samePath(d, dir))) {
      settings.importDirs.push(dir);
      saveSettings();
      send('state', snapshot());
    }
    return snapshot();
  });
  ipcMain.handle('removeImportDir', (_e, dir) => {
    settings.importDirs = settings.importDirs.filter((d) => !samePath(d, dir));
    saveSettings();
    send('state', snapshot());
    return snapshot();
  });

  // Headless test mode: SYNTY_CHECK=1 - check versions and print the result to the console.
  if (process.env.SYNTY_CHECK) {
    (async () => {
      console.log('session', await ensureSession());
      const owned = await checkOwned(ses(), store, consoleLog, null);
      for (const o of Object.values(owned)) console.log([o.key, o.status, o.category, o.title, o.latest && (o.latest.variant + ' ' + o.latest.version + ' ' + o.latest.size)].join('  '));
      if (process.env.SYNTY_DOWNLOAD) {
        const file = await downloadOwned(ses(), store, owned[process.env.SYNTY_DOWNLOAD], (p) => p.done && console.log('downloaded', p.received));
        console.log('file', file, owned[process.env.SYNTY_DOWNLOAD].status);
      }
      for (const r of importLocal.scan(store, [...settings.importDirs, settings.root])) console.log('import', r.title, r.variant, r.version, r.fuzzy ? '(fuzzy)' : '', '->', r.statusAfter, r.file);
    })().catch((e) => console.error(e)).finally(() => app.quit());
    return;
  }

  createWindow();
  // UI test: SYNTY_SHOT=<file prefix> [SYNTY_LANG=en|pl] - Catalog/Owned with the Interface filter, window screenshots.
  if (process.env.SYNTY_SHOT) {
    if (process.env.SYNTY_LANG) i18n.setLanguage(process.env.SYNTY_LANG);
    win.webContents.once('did-finish-load', async () => {
      const js = (c) => win.webContents.executeJavaScript(c);
      await new Promise((r) => setTimeout(r, 1500));
      await js("document.querySelector('[data-tab=catalog]').click(); document.querySelector('#cats button[data-cat=Interface]').click()");
      await new Promise((r) => setTimeout(r, 1000));
      fs.writeFileSync(process.env.SYNTY_SHOT + '-catalog.png', (await win.webContents.capturePage()).toPNG());
      await js("document.querySelector('[data-tab=owned]').click()");
      await new Promise((r) => setTimeout(r, 1000));
      fs.writeFileSync(process.env.SYNTY_SHOT + '-owned.png', (await win.webContents.capturePage()).toPNG());
      await js("document.querySelector('[data-tab=import]').click()");
      await new Promise((r) => setTimeout(r, 500));
      fs.writeFileSync(process.env.SYNTY_SHOT + '-import.png', (await win.webContents.capturePage()).toPNG());
      console.log(await js("JSON.stringify({lang: document.documentElement.lang, owned:[...document.querySelectorAll('#view-owned .card .cat')].map(e=>e.textContent), catalogVisible: getComputedStyle(document.querySelector('#view-catalog')).display})"));
      app.quit();
    });
  }
});

app.on('window-all-closed', () => { if (!process.env.SYNTY_CHECK) app.quit(); });
