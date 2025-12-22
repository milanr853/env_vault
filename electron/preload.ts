import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    selectFolders: () => ipcRenderer.invoke('fs:select-folders')
})
