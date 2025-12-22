import { ipcMain, dialog } from 'electron'

ipcMain.handle('fs:select-folders', async () => {
    console.log('[FS] select-folders handler invoked')

    const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections'],
    })

    if (result.canceled || result.filePaths.length === 0) {
        return []
    }

    return result.filePaths
})
