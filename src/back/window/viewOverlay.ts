import { BrowserView, ipcMain, ipcRenderer } from 'electron'
import { windowMain } from './windowMain';
//import { api } from '../bridge';

const titlebarSize = 40;
const footerSize = 30;

declare const OVERLAY_WINDOW_WEBPACK_ENTRY: string
declare const OVERLAY_WINDOW_PRELOAD_WEBPACK_ENTRY: string

type status = {
  count?: number;
  current?: number;
  name?: string;
}
export type fetchStatus = {
  collection: status;
  page: status;
  pack: status;
}

export class viewOverlay {
  windowMain: windowMain;
  viewOverlay = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      preload: OVERLAY_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });

  constructor(windowMain: windowMain) {
    this.windowMain = windowMain;
    
    this.viewOverlay.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    this.viewOverlay.setBackgroundColor("#00000000");
    this.viewOverlay.setAutoResize({ width: true, height: true });

    this.viewOverlay.webContents.loadURL(OVERLAY_WINDOW_WEBPACK_ENTRY);
    this.windowMain.getWindow()?.addBrowserView(this.viewOverlay);
  }

  show = () => {
    this.viewOverlay.setBounds({ x: 0, y: titlebarSize, ...this.getWindowSize() });
    this.windowMain.getWindow()?.setTopBrowserView(this.viewOverlay);
    this.viewOverlay.webContents.send('show');
  }

  hide = () => {
    this.viewOverlay.webContents.send('hide');
    setTimeout(
      () => this.viewOverlay.setBounds({ x: 0, y: 0, width: 0, height: 0 }),
      400
    )
  }

  message = (msg: string) => {
    this.viewOverlay.webContents.send('message', msg);
  }

  fetchStatus = (status: fetchStatus) => {
    this.viewOverlay.webContents.send('fetchStatus', status);
  }

  getWindowSize = () => ({
    width: this.windowMain.getWindow()?.getSize()[0] ?? 0,
    height: (this.windowMain.getWindow()?.getSize()[1] ?? 0) - titlebarSize - footerSize
  })
}