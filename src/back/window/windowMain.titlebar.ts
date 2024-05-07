import { BrowserWindow, ipcMain } from 'electron'
import { APIKeys } from '../bridge.keys';

/**
 * Set all listeners on window
 */
export const registerListenersTitlebar = async (windowHnd: BrowserWindow) => {
  const windowMinimize = () => windowHnd?.minimize();
  const windowMaximize = () => windowHnd?.isMaximized() ? windowHnd?.unmaximize() : windowHnd?.maximize();
  const windowClose = () => windowHnd?.close();
  const windowPin = () => {
    windowHnd?.setAlwaysOnTop(!windowHnd?.isAlwaysOnTop(), "normal", 10000);
    windowHnd?.moveTop();
  }
  
  // window handle
  ipcMain.on(APIKeys.window.minimize, () => windowMinimize()),
  ipcMain.on(APIKeys.window.maximize, () => windowMaximize()),
  ipcMain.on(APIKeys.window.pin, () => windowPin()),
  ipcMain.on(APIKeys.window.close, () => windowClose()),
  //ipcMain.on(APIKeys.window.focus, () => void(0)),
  //ipcMain.on(APIKeys.window.blur, () => void(0)),

  windowHnd?.on("focus", () => windowHnd?.webContents.send(APIKeys.window.focus));
  windowHnd?.on("blur", () => windowHnd?.webContents.send(APIKeys.window.blur));
  windowHnd?.on("always-on-top-changed", (e, value) => windowHnd?.webContents.send(APIKeys.window.pin, value));

  windowHnd?.on("maximize", () => windowHnd?.webContents.send(APIKeys.window.maximize, true));
  windowHnd?.on("unmaximize", () => windowHnd?.webContents.send(APIKeys.window.maximize, false));
}