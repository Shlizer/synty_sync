import path from "path"
import fs from "fs"
import { app, BrowserView, ipcMain } from "electron";
import { windowMain } from "../window/windowMain";
import { fetchStatus } from "../window/viewOverlay";
import { Collection, Pack, PackEx } from "./syntyPacks.types";
import * as Code from './syntyPacks.code';
import axios from "axios";

const packInfoFile = "info.json";
const packageExtension = ".unitypackage";

const getPackDir = (dirName?: string) => {
    const packsDir = `${app?.getAppPath()}/resources/packs`;

    return dirName
        ? `${packsDir}/${dirName}`
        : packsDir;
}

const checkType = (pack: Pack, filter: string): Pack => {
    const parts = pack.name.split(' - ');
    const index = parts.indexOf(filter);
    if (index < 0) return pack;
    else {
        pack.collection = filter;
        pack.name = parts.slice(index + 1).join(' - ');
        return pack;
    }
}

const preparePackData = (pack: Pack, dir: string): PackEx => {
    // remove collection prefixes
    if (pack.collection == "POLYGON") {
        if (pack.name.startsWith("POLYGON MINI")) {
            pack.collection = "Polygon Mini"
            pack.name = pack.name.replace(/^POLYGON MINI - /g,'');
        } else {
            pack.collection = "Polygon"
            pack.name = pack.name.replace(/^POLYGON - /g,'');
        }
    }
    else if (pack.collection == "Simple") 
        pack.name = pack.name.replace(/^Simple /g,'');

    pack = checkType(pack, "ANIMATION");
    pack = checkType(pack, "INTERFACE");
    pack = checkType(pack, "POLYGON MINI");
    
    return {
        ...pack,
        type: '',
        tags: [],
        img: `data:image/jpg;base64,${pack.img}`,
        packagePath: fs.readdirSync(dir).find(file => path.extname(file) == packageExtension),
    }
}

const getList = (): PackEx[] => {
    const packs: PackEx[] = []

    if (!fs.existsSync(getPackDir())) {
        console.log("no dir ", getPackDir());
        return packs;
    }

    var dirs = fs.readdirSync(getPackDir(), { withFileTypes: true }).filter(element => element.isDirectory());

    for (var i = 0; i < dirs.length; ++i) {
        packs.push(
            preparePackData(
                JSON.parse(fs.readFileSync(`${getPackDir(dirs[i].name)}/${packInfoFile}`) as any) as Pack,
                getPackDir(dirs[i].name),
            )
        )
    }
    return packs
};

const fetch = (windowMain: windowMain) => {
    let fetchStatus: fetchStatus = {
        collection: {},
        page: {},
        pack: {},
    }

    checkCollectionPage();

    function setFetchStatus(status: Partial<fetchStatus>) {
        fetchStatus = {
        collection: {
            ...fetchStatus.collection,
            ...status.collection,
        },
        page: {
            ...fetchStatus.page,
            ...status.page,
        },
        pack: {
            ...fetchStatus.pack,
            ...status.pack,
        },
        }
        windowMain.getOverlay().fetchStatus(fetchStatus);
    }

    function checkCollectionPage() {
        try {
            const collectionsView = new BrowserView();
            windowMain.getOverlay().message("Searching for collections");

            collectionsView.webContents.addListener('did-finish-load', async () => {
                // Search all possible collections
                const collections: Collection[] = await collectionsView.webContents.executeJavaScript(Code.GetCollections);
                windowMain.getOverlay().message(``);
                setFetchStatus({ collection: { current: 0, count: collections.length }, page: { count: 0 }, pack: { count: 0 }});

                // Fetch each collection
                for (var i = 0; i < collections.length; ++i) {
                await fetchCollection(collections[i], i)
                }
                // this.savePacks(result);

                // Exit overlay
                ipcMain.emit('viewsClose');
            });
            collectionsView.webContents.loadURL(windowMain.getConfig().syntyPageCollections.url);
        } catch (e) {
        console.log("ERROR::: ", e)
        }
    }

    async function fetchCollection (collection: Collection, index: number) {
        return new Promise((resolve, reject) => {
            setFetchStatus({ collection: { current: index + 1, name: collection.name }, page: { count: 0 }, pack: { count: 0 }});

            // Find all pages for collection
            const collectionView = new BrowserView();

            collectionView.webContents.addListener('did-finish-load', async () => {
            const pages: string[] = [
                collection.url,
                ...(await collectionView.webContents.executeJavaScript(Code.GetCollectionPages))
            ];
            setFetchStatus({ page: { current: 0, count: pages.length }});
            
            // Fetch each page
            for (var i = 0; i < pages.length; ++i) {
                await fetchPage(collection.name, pages[i], i);
            }
            resolve(true);
            });
            collectionView.webContents.loadURL(collection.url);
        })
    }

    async function fetchPage(collectionName: string, page: string, index: number) {
        return new Promise((resolve, reject) => {
            console.log("fetch page", page)
            setFetchStatus({ page: { current: index + 1, name: `Page ${index + 1}` }, pack: { count: 0 }});

            // Find all packs for page
            const pageView = new BrowserView();
            pageView.webContents.addListener('did-finish-load', async () => {
            const packs: Pack[] = await pageView.webContents.executeJavaScript(Code.GetPacks);
            setFetchStatus({ pack: { current: 0, count: packs.length }});
            
            // Fetch each page
            for (var i = 0; i < packs.length; ++i) {
                await fetchPack(collectionName, packs[i], i);
            }
            resolve(true);
            });
            pageView.webContents.loadURL(page);
        })
    }

    async function fetchPack(collectionName: string, pack: Pack, index: number) {
        return new Promise(async (resolve, reject) => {
            setFetchStatus({ pack: { current: index + 1, name: pack.name }});
            const dir = pack.url.split("?")[0].split("/").pop();
            let image = await axios.get(pack.img, {responseType: 'arraybuffer'});
            pack.img = Buffer.from(image.data).toString('base64');
            pack.collection = collectionName;

            if (!fs.existsSync(getPackDir(dir))) {
                fs.mkdirSync(getPackDir(dir));
            }
            
            fs.writeFileSync(`${getPackDir(dir)}/${packInfoFile}`, JSON.stringify(pack));
            resolve(true);
            //setTimeout(() => resolve([]), 200);
        })
    }
}

export { getList, fetch }