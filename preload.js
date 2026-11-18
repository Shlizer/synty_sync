const { contextBridge, ipcRenderer } = require('electron');

const call = (ch) => (...args) => ipcRenderer.invoke(ch, ...args);
contextBridge.exposeInMainWorld('api', {
  state: call('state'),
  loggedIn: call('loggedIn'),
  login: call('login'),
  setLanguage: call('setLanguage'),
  refreshCatalog: call('catalog'),
  check: call('check'),
  download: call('download'),
  cancel: call('cancel'),
  importScan: call('importScan'),
  importApply: call('importApply'),
  showItem: call('showItem'),
  openUrl: call('openUrl'),
  openRoot: call('openRoot'),
  chooseRoot: call('chooseRoot'),
  addImportDir: call('addImportDir'),
  removeImportDir: call('removeImportDir'),
  on: (ch, fn) => ipcRenderer.on(ch, (_e, d) => fn(d)),
});
