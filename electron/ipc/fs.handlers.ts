import { ipcMain, dialog } from 'electron'
import { worker } from './worker-bridge'

ipcMain.handle('fs:select-folders', async () => {
    console.log('[FS] select-folders handler invoked')

    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    })

    if (result.canceled || !result.filePaths.length) return []

    worker.postMessage({
        type: 'build',
        paths: result.filePaths,
    })

    return result.filePaths
})
