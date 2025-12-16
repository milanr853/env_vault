import { app, BrowserWindow, ipcMain, clipboard } from "electron"
import path from "path"

// vault crypto helpers
import { createVault, decryptVault } from "./src-main/vault"

// ==============================
// Linux sandbox workaround
// ==============================
app.commandLine.appendSwitch("no-sandbox")
app.commandLine.appendSwitch("disable-setuid-sandbox")

// ==============================
// App state
// ==============================
const isDev = !app.isPackaged
let mainWindow: BrowserWindow | null = null

// ==============================
// In-memory vault (CRITICAL)
// ==============================
let decryptedVault: Record<string, any> | null = null
let currentVaultPath: string | null = null

// ==============================
// Create Browser Window
// ==============================
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    if (isDev) {
        mainWindow.loadURL("http://localhost:5173")
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, "../dist/index.html"))
    }
}

// ==============================
// App lifecycle
// ==============================
app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})

// 🔒 Memory wipe on quit
app.on("before-quit", () => {
    decryptedVault = null
    currentVaultPath = null
})

// ==============================
// IPC HANDLERS
// ==============================

// Create new vault
ipcMain.handle(
    "vault:create",
    async (_event, { vaultPath, password }) => {
        const emptyVault = { projects: {} }

        await createVault(emptyVault, password, vaultPath)

        decryptedVault = emptyVault
        currentVaultPath = vaultPath
    }
)

// Unlock existing vault
ipcMain.handle(
    "vault:unlock",
    async (_event, { vaultPath, password }) => {
        const data = await decryptVault(vaultPath, password)

        decryptedVault = data
        currentVaultPath = vaultPath

        return { projects: data.projects }
    }
)

// Lock vault (wipe memory)
ipcMain.handle("vault:lock", async () => {
    decryptedVault = null
    currentVaultPath = null
})

// Clipboard copy (no UI exposure)
ipcMain.handle("clipboard:copy", (_event, value: string) => {
    clipboard.writeText(value)
})
