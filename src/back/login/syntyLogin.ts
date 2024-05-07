import { BrowserWindow, BrowserView, WebContents, ipcMain } from "electron";
import { ConfigModel } from "../config";
import { windowMain } from "../window/windowMain";

export const syntyLogin = (windowMain: windowMain) => {
  const getWindowSize = () => ({
    width: windowMain.getWindow().getSize()[0],
    height: windowMain.getWindow().getSize()[1]
  })

  const loginView = new BrowserView();

  loginView.setBounds({ x: 100, y: 100, width: getWindowSize().width - 200, height: getWindowSize().height - 200 });
  loginView.setAutoResize({ horizontal: true, vertical: true });
  loginView.webContents.addListener('did-finish-load', handleLoginAutomation);
  loginView.webContents.addListener('did-navigate', handleNavigation);
  loginView.webContents.loadURL(windowMain.getConfig().syntyPageLogin.url);
  windowMain.getWindow().addBrowserView(loginView);

  async function handleLoginAutomation() {
      loginView.webContents.removeListener('did-finish-load', handleLoginAutomation);
      
      loginView.webContents.executeJavaScript(`document.querySelector('${windowMain.getConfig().syntyPageLogin.idEmailField}').value = '${windowMain.getConfig().syntyLogin}'`);

      // Exit overlay
      ipcMain.emit('viewsClose');
  };

  // Handle page navigation
  async function handleNavigation (event: unknown, url: string) {
    //this.mainWindow.setTopBrowserView(this.viewOverlay);
    
    // keep login overlayed
    if (url.startsWith(windowMain.getConfig().syntyPageLogin?.url)) return;
    // after login redirect to orders
    if (url.startsWith(windowMain.getConfig().syntyPageAccount?.url))
      return loginView.webContents.loadURL(windowMain.getConfig().syntyPageOrders?.url);
    // on orders page scrap all orders data
    //if (url.startsWith(windowMain.getConfig().syntyPageOrders?.url))
    //  return this.fetchOrders(this.viewLogin.webContents);
    
      windowMain.getWindow().setTopBrowserView(loginView);
  }

  loginView.webContents.loadURL(windowMain.getConfig().syntyPageCollections.url);
}

export class SyntyLogin {
  config: ConfigModel;
  mainWindow: BrowserWindow;
  viewLogin = new BrowserView();
  viewOverlay = new BrowserView();

  constructor(mainWindow: BrowserWindow, cfg: ConfigModel) {
    this.mainWindow = mainWindow;
    this.config = cfg;

    this.createViewOverlay();
    this.createViewLogin();
  }

  getWindowSize = () => ({
    width: this.mainWindow.getSize()[0],
    height: this.mainWindow.getSize()[1]
  })

  createViewLogin = () => {
    this.viewLogin.setBounds({ x: 100, y: 100, width: this.getWindowSize().width - 200, height: this.getWindowSize().height - 200 });
    this.viewLogin.setAutoResize({ horizontal: true, vertical: true });
    this.viewLogin.webContents.addListener('did-finish-load', this.handleLoginAutomation);
    this.viewLogin.webContents.addListener('did-navigate', this.handleNavigation);
    this.viewLogin.webContents.loadURL(this.config.syntyPageLogin.url);
    this.mainWindow.addBrowserView(this.viewLogin);
  }

  createViewOverlay = () => {
    this.viewOverlay.setBounds({ x: 0, y: 0, ...this.getWindowSize() });
    this.viewOverlay.setBackgroundColor("#00000000");
    this.viewOverlay.setAutoResize({ width: true, height: true });

    this.mainWindow.webContents.loadFile("../public/overlay.html");
    this.mainWindow.addBrowserView(this.viewOverlay);
  }

  // Automate login process on start
  handleLoginAutomation = () => {
    this.viewLogin.webContents.removeListener('did-finish-load', this.handleLoginAutomation);
    this.viewLogin.webContents.executeJavaScript(`document.querySelector('${this.config.syntyPageLogin.idEmailField}').value = '${this.config.syntyLogin}'`);

    if (this.config.syntyPassword) {
      this.viewLogin.webContents.executeJavaScript(`document.querySelector('${this.config.syntyPageLogin.idPasswordField}').value = '${this.config.syntyPassword}'`);
      this.viewLogin.webContents.executeJavaScript(`document.querySelector('${this.config.syntyPageLogin.idForm}').submit()`);
    }
    else {
      this.mainWindow.setTopBrowserView(this.viewLogin);
    }
  }

  // Handle page navigation
  handleNavigation = (event: unknown, url: string) => {
    this.mainWindow.setTopBrowserView(this.viewOverlay);
    
    // keep login overlayed
    if (url.startsWith(this.config?.syntyPageLogin?.url)) return;
    // after login redirect to orders
    if (url.startsWith(this.config?.syntyPageAccount?.url)) return this.viewLogin.webContents.loadURL(this.config?.syntyPageOrders?.url);
    // on orders page scrap all orders data
    if (url.startsWith(this.config?.syntyPageOrders?.url)) return this.fetchOrders(this.viewLogin.webContents);
    
    this.mainWindow.setTopBrowserView(this.viewLogin);
  }

  fetchOrders = async (contents: WebContents) => {
    contents
      .executeJavaScript(`document.querySelectorAll('.sky-pilot-list-item')`)
      .then((nodes: NodeList) => nodes.forEach(node => this.fetchOrder(node as HTMLAnchorElement)))
  }

  fetchOrder = async (node: HTMLAnchorElement) => {
    const name = node.querySelector(".sky-pilot-file-heading")?.textContent ?? "???";
    const url = node.href;
    this.fetchOrderData(name, url);
  }

  fetchOrderData = async (name: string, url: string) => {
    console.log(`fetching data for: ${name} [${url}]`)
  }
}
