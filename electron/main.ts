import { app, BrowserWindow } from 'electron'
import path from 'node:path'import './ipc'

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadURL('http://localhost:5173')
}

app.whenReady().then(createWindow)
