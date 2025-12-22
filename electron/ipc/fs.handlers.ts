import { ipcMain, dialog } from 'electron'

ipcMain.handle('fs:select-folders', async () => {
    const result: any = await dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections']
    })
    return result?.filePaths
})
