import { ipcMain, dialog } from 'electron'
import { Worker } from 'node:worker_threads'
import path from 'node:path'

ipcMain.handle('fs:select-folders', async (): Promise<string[]> => {
    const paths = dialog.showOpenDialogSync({
        properties: ['openDirectory', 'multiSelections'],
    })

    if (!paths?.length) return []

    const worker = new Worker(
        path.join(__dirname, '../workers/index-worker.js')
    )

    worker.postMessage(paths)

    return paths // return immediately → UI stays responsive
})
