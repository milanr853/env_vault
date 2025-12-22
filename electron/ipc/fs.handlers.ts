import { ipcMain, dialog } from 'electron'
import { indexWorker } from './worker-instance'

ipcMain.handle('fs:select-folders', async () => {
    console.log('[FS] select-folders handler invoked')

    const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections'],
    })

    if (result.canceled || !result.filePaths.length) {
        return []
    }

    indexWorker.postMessage({
        type: 'build',
        paths: result.filePaths,
    })

    return result.filePaths
})
