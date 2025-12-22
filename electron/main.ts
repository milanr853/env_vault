import { app, BrowserWindow } from 'electron'
import * as path from 'node:path'

let win: BrowserWindow | null = null

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    const isDev = !app.isPackaged

    if (isDev) {
        const devURL = 'http://localhost:5173'

        win.loadURL(devURL)

        // 🔑 THIS LINE FIXES THE BLANK SCREEN
        win.webContents.on('did-fail-load', () => {
            setTimeout(() => {
                win?.loadURL(devURL)
            }, 300)
        })

        win.webContents.openDevTools()
    } else {
        win.loadFile(
            path.join(__dirname, '../index.html')
        )
    }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
