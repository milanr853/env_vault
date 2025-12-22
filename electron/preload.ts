import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    selectFolders: () => ipcRenderer.invoke('fs:select-folders'),

    search: (query: string) =>
        ipcRenderer.invoke('search:query', query),

    extractCode: (
        fileId: number,
        start: number,
        end: number
    ) => ipcRenderer.invoke('code:extract', fileId, start, end)
})
