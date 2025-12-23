import { ipcMain, dialog, BrowserWindow } from 'electron'
import { worker } from './worker-bridge'

// --------------------------------------------------
// FS: SELECT PROJECT FOLDERS
// --------------------------------------------------
ipcMain.handle('fs:select-folders', async () => {
    const win = BrowserWindow.getAllWindows()[0]

    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    })

    if (result.canceled || !result.filePaths.length) {
        return []
    }

    // 🔄 START SCANNING (UI SPINNER ON)
    win.webContents.send('scan:start')

    // 🧠 SEND BUILD REQUEST TO WORKER
    worker.postMessage({
        type: 'build',
        paths: result.filePaths,
    })

    return result.filePaths
})


// --------------------------------------------------
// WORKER → MAIN MESSAGE LISTENER
// (BUILD COMPLETION, SINGLE PLACE)
// --------------------------------------------------
worker.on('message', (msg: any) => {
    const win = BrowserWindow.getAllWindows()[0]
    if (!win) return

    // ✅ BUILD FINISHED → STOP SPINNER
    if (msg.type === 'build:done') {
        console.log('[MAIN] build finished')
        win.webContents.send('scan:end')
    }
})


// --------------------------------------------------
// FS: GET PROJECTS (FROM WORKER)
// --------------------------------------------------
ipcMain.handle('fs:get-projects', () => {
    return new Promise<string[]>((resolve) => {
        worker.postMessage({ type: 'get-projects' })

        const handler = (msg: any) => {
            if (msg.type === 'projects') {
                worker.off('message', handler)
                resolve(msg.projects)
            }
        }

        worker.on('message', handler)
    })
})
