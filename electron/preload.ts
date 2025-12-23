import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    selectFolders: () =>
        ipcRenderer.invoke('fs:select-folders') as Promise<string[]>,

    search: (query: string) =>
        ipcRenderer.invoke('search:query', query),

    getProjects: () => ipcRenderer.invoke('fs:get-projects'),

    onScanStart: (cb: () => void) =>
        ipcRenderer.on('scan:start', cb),

    onScanEnd: (cb: () => void) =>
        ipcRenderer.on('scan:end', cb),

    extractCode: (
        fileId: number,
        start: number,
        end: number
    ) => ipcRenderer.invoke('code:extract', fileId, start, end),

    injectCode: (targetPath: string, code: string) =>
        ipcRenderer.invoke('code:inject', { targetPath, code }),
})
