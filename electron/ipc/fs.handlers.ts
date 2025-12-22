import { ipcMain, dialog, BrowserWindow } from 'electron'
import { worker } from './worker-bridge'

ipcMain.handle('fs:select-folders', async () => {
    const win = BrowserWindow.getAllWindows()[0]

    win.webContents.send('scan:start')

    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    })

    if (result.canceled || !result.filePaths.length) {
        win.webContents.send('scan:end')
        return []
    }

    worker.postMessage({
        type: 'build',
        paths: result.filePaths,
    })

    win.webContents.send('scan:end')

    return result.filePaths
})
