import { Menu, BrowserWindow, ipcMain } from 'electron'
import debug from 'electron-debug'
import { ConfigModel, getConfig, setConfig } from '../config'
import { syntyLogin } from "../login/syntyLogin"
import { fetch, getList } from '../packs/syntyPacks';
import { viewOverlay } from './viewOverlay';
import { APIKeys } from '../bridge.keys';
import { registerListenersTitlebar } from './windowMain.titlebar';

debug();

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

export class windowMain {
  windowHnd: BrowserWindow;
  config: ConfigModel;
  title = "Synty Sync";

  viewOverlay: viewOverlay;

  /**
   * Create app window
   */
  constructor() {
    this.config = getConfig();

    this.windowHnd = new BrowserWindow({
      title: this.title,
      width: this.config.window.size.width,
      height: this.config.window.size.height,
      minWidth: 300,
      minHeight: 40,
      backgroundColor: '#00000000',
      alwaysOnTop: this.config.window.pinned,
      frame: false,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
      }
    });
    this.windowHnd.setPosition(this.config.window.position.top, this.config.window.position.left);
    this.windowHnd.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    this.windowHnd.moveTop();
    this.viewOverlay = new viewOverlay(this);
  }

  fetchCollection = () => fetch(this);

  fetchPackages = () => {
  }

  fetchList = () => getList();

  /**
   * Set all listeners on window
   */
  registerListeners = async () => {
    if (!this.windowHnd) return null;

    registerListenersTitlebar(this.windowHnd);

    // fetch data
    ipcMain.on(APIKeys.generate.collection, this.fetchCollection),
    ipcMain.on(APIKeys.generate.packages, this.fetchPackages),
    ipcMain.on(APIKeys.generate.list, this.fetchList),

    ipcMain.handle(APIKeys.fetch.list, getList);










    // login and fetch owned packages
    //ipcMain.on('showSyntyLogin', () => {
    //  syntyLogin(this);
    //});
    //ipcMain.on('viewsFetchPacks', () => {
    //  this.viewOverlay.show();
    //  fetch(this)
    //});
    //ipcMain.on('viewsOpen', () => this.viewOverlay.show());
    //ipcMain.on('viewsClose', () => this.viewOverlay.hide());

    // Show window after it's ready
    this.windowHnd.once("ready-to-show", () => {
        if (!this.windowHnd) return null;
        this.windowHnd.setMenu(Menu.buildFromTemplate([]));
        this.windowHnd.setTitle(this.title);
        this.windowHnd.show();
        console.log("SHOW!!!!")
        this.windowHnd.webContents.toggleDevTools();
    });

    // Handle option save on closing
    this.windowHnd.on("close", () => {
        setConfig({
            ...this.config!,
            window: {
                position: {
                    top: this.windowHnd.getPosition()[0],
                    left: this.windowHnd.getPosition()[1],
                },
                size: {
                    width: this.windowHnd.getSize()[0],
                    height: this.windowHnd.getSize()[1],
                },
                pinned: this.windowHnd.isAlwaysOnTop(),
                maximized: this.windowHnd.isMaximized(),
            }
        });
    });
  }

  /**
   * Get handlers
   */
  getWindow = () => {
    return this.windowHnd;
  }
  getOverlay = () => {
    return this.viewOverlay;
  }
  getConfig = () => {
    return this.config;
  }
}
