import { app, BrowserView, ipcMain } from "electron";
import fs from 'fs';
import { windowMain } from "../window/windowMain";
import { fetchStatus } from "../window/viewOverlay";
import * as Code from './syntyPacks.code';
/*
export class FetchPacks {
  windowMain: windowMain;

  fetchStatus: fetchStatus;
  views: BrowserView[] = []

  constructor(windowMain: windowMain) {
    this.windowMain = windowMain;
    this.checkCollectionPage();
    this.fetchStatus = {
      collection: {},
      page: {},
      pack: {},
    };
  }

  setFetchStatus = (status: Partial<fetchStatus>) => {
    this.fetchStatus = {
      collection: {
        ...this.fetchStatus.collection,
        ...status.collection,
      },
      page: {
        ...this.fetchStatus.page,
        ...status.page,
      },
      pack: {
        ...this.fetchStatus.pack,
        ...status.pack,
      },
    }
    this.windowMain.getOverlay().fetchStatus(this.fetchStatus);
  }

  checkCollectionPage = () => {
    try {
      const collectionsView = new BrowserView();

      this.windowMain.getOverlay().message("Searching for collections");

      collectionsView.webContents.addListener('did-finish-load', async () => {
        // Search all possible collections
        const collections: Collection[] = await collectionsView.webContents.executeJavaScript(Code.GetCollections);
        this.windowMain.getOverlay().message(``);
        this.setFetchStatus({ collection: { current: 0, count: collections.length }, page: { count: 0 }, pack: { count: 0 }});

        // Fetch each collection
        for (var i = 0; i < collections.length; ++i) {
          await this.fetchCollection(collections[i], i)
        }
       // this.savePacks(result);

        // Exit overlay
        ipcMain.emit('viewsClose');
      });
      collectionsView.webContents.loadURL(this.windowMain.getConfig().syntyPageCollections.url);
    } catch (e) {
      console.log("ERROR::: ", e)
    }
  }

  fetchCollection = async (collection: Collection, index: number) => new Promise((resolve, reject) => {
    this.setFetchStatus({ collection: { current: index + 1, name: collection.name }, page: { count: 0 }, pack: { count: 0 }});

    // Find all pages for collection
    const collectionView = new BrowserView();

    collectionView.webContents.addListener('did-finish-load', async () => {
      const pages: string[] = [
        collection.url,
        ...(await collectionView.webContents.executeJavaScript(Code.GetCollectionPages))
      ];
      this.setFetchStatus({ page: { current: 0, count: pages.length }});
      
      // Fetch each page
      for (var i = 0; i < pages.length; ++i) {
        await this.fetchPage(pages[i], i);
      }
      resolve(true);
    });
    collectionView.webContents.loadURL(collection.url);
  })

  fetchPage = async (page: string, index: number) => new Promise((resolve, reject) => {
    console.log("fetch page", page)
    this.setFetchStatus({ page: { current: index + 1, name: `Page ${index + 1}` }, pack: { count: 0 }});

    // Find all packs for page
    const pageView = new BrowserView();
    pageView.webContents.addListener('did-finish-load', async () => {
      //pageView.webContents.toggleDevTools();
      const packs: Pack[] = await pageView.webContents.executeJavaScript(Code.GetPacks);
      this.setFetchStatus({ pack: { current: 0, count: packs.length }});
      
      // Fetch each page
      for (var i = 0; i < packs.length; ++i) {
        await this.fetchPack(packs[i], i);
      }
      resolve(true);
    });
    pageView.webContents.loadURL(page);
  })

  fetchPack = async (pack: Pack, index: number) => new Promise(async (resolve, reject) => {
    this.setFetchStatus({ pack: { current: index + 1, name: pack.name }});
    const dir = pack.url.split("?")[0].split("/").pop();
    const fullDir = `${app.getAppPath()}/resources/packs/${dir}`;

    if (fs.existsSync(fullDir)) {

    } else {
      fs.mkdirSync(fullDir);
    }





    //let image = await axios.get(pack.img, {responseType: 'arraybuffer'});
    //pack.img = Buffer.from(image.data).toString('base64');





    // Find all packs for page
    /*
    const packView = new BrowserView();
    packView.webContents.addListener('did-finish-load', async () => {
      const packs: Pack[] = await packView.webContents.executeJavaScript(codeGetPacks);
      this.setFetchStatus({ pack: { current: 0, count: packs.length }});
      
      // Fetch each page
      for (var i = 0; i < pages.length; ++i) {
        await this.fetchPage(pages[i], i);
      }
    });
    packView.webContents.loadURL(page);* /
    setTimeout(() => resolve([]), 200);
  })//* /
}
*/