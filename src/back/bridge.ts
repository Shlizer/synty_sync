import { contextBridge, ipcRenderer } from 'electron'
import { PackEx } from '@types/packs.types'
import { getConfig } from './config'
import { APIKeys } from './bridge.keys'

export const api = {
  keys: APIKeys,
  window: {
    minimize: () => ipcRenderer.send(APIKeys.window.minimize),
    maximize: () => ipcRenderer.send(APIKeys.window.maximize),
    pin: () => ipcRenderer.send(APIKeys.window.pin),
    close: () => ipcRenderer.send(APIKeys.window.close),
    focus: () => ipcRenderer.send(APIKeys.window.focus),
    blur: () => ipcRenderer.send(APIKeys.window.blur),
    //
    isPinned: () => getConfig().window.pinned ?? false,
  },
  generate: {
    collection: () => ipcRenderer.send(APIKeys.generate.collection), // all collection lists [not logged]
    packages: () => ipcRenderer.send(APIKeys.generate.packages), // packages that are downloadable [logged]
    list: () => ipcRenderer.send(APIKeys.generate.list), // unitypackage list [fs]
  },
  fetch: {
    list: () => ipcRenderer.invoke(APIKeys.fetch.list) as Promise<PackEx[]>,
  },
  sendMessage: (message: string) => {
    ipcRenderer.send('message', message)
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
  onFocus: (callback: () => void) => api.on(APIKeys.window.focus, callback),
  onBlur: (callback: () => void) => api.on(APIKeys.window.blur, callback),
  onPin: (callback: (pinned: boolean) => void) => api.on(APIKeys.window.pin, callback),
  onMinimize: (callback: () => void) => api.on(APIKeys.window.minimize, callback),
  onMaximize: (callback: (maximized: boolean) => void) => api.on(APIKeys.window.maximize, callback),
}

contextBridge.exposeInMainWorld('Api', api)
