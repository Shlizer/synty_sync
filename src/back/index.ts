import { app, BrowserWindow } from 'electron'
import fs from "fs"
import { windowMain } from "./window/windowMain";

(async () => {
  if (!fs.existsSync("resources/packs")) await fs.mkdirSync("resources/packs");
})()

let WindowMain: windowMain | null;

const createWindow = () => {
  WindowMain = new windowMain()
  WindowMain.getWindow()?.on('closed', () => WindowMain = null)
}

async function registerListeners() {
  WindowMain?.registerListeners();
}

app.on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})
