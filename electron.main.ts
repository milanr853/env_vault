import { app, BrowserWindow, ipcMain, clipboard } from "electron"
import path from "path"

const VAULT_PATH = path.join(
    app.getPath("userData"),
    "env-vault.vault"
)


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
    async (_event, { password }) => {
        const emptyVault = { projects: {} }

        await createVault(emptyVault, password, VAULT_PATH)

        decryptedVault = emptyVault
        currentVaultPath = VAULT_PATH
    }
)

// Unlock existing vault
ipcMain.handle(
    "vault:unlock",
    async (_event, { password }) => {
        try {
            const data = await decryptVault(VAULT_PATH, password)

            decryptedVault = data
            currentVaultPath = VAULT_PATH

            return { ok: true, projects: data.projects }
        } catch (err) {
            return {
                ok: false,
                error: "Incorrect master password"
            }
        }
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

ipcMain.handle("vault:exists", async () => {
    try {
        return require("fs").existsSync(VAULT_PATH)
    } catch {
        return false
    }
})
