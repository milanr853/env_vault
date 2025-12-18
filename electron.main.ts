import { app, BrowserWindow, ipcMain, clipboard } from "electron"
import path from "path"

const VAULT_PATH = path.join(
    app.getPath("userData"),
    "env-vault.vault"
)

let vaultKey: Buffer | null = null


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
    vaultKey = null
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

            decryptedVault = data?.data
            vaultKey = data?.key
            currentVaultPath = VAULT_PATH

            return { ok: true, projects: data?.data?.projects }
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
    vaultKey = null
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

import { dialog } from "electron"
import fs from "fs"

ipcMain.handle("env:pick-project", async () => {
    const result: any = await dialog.showOpenDialog({
        properties: ["openDirectory"]
    })

    if (result.canceled || result.filePaths.length === 0) {
        return { ok: false }
    }

    return {
        ok: true,
        path: result.filePaths[0]
    }
})

ipcMain.handle("env:scan-project", async (_event, projectPath: string) => {
    try {
        const files = fs.readdirSync(projectPath)

        const envFiles = files.filter((file) =>
            file.startsWith(".env")
        )

        return {
            ok: true,
            files: envFiles
        }
    } catch (err) {
        return {
            ok: false,
            error: "Unable to scan project folder"
        }
    }
})

ipcMain.handle(
    "env:read-file",
    async (_event, projectPath: string, fileName: string) => {
        try {
            const fullPath = path.join(projectPath, fileName)
            const content = fs.readFileSync(fullPath, "utf8")

            const lines = content.split("\n")
            const parsed: Record<string, string> = {}

            for (const line of lines) {
                const trimmed = line.trim()

                if (!trimmed || trimmed.startsWith("#")) continue

                const eqIndex = trimmed.indexOf("=")
                if (eqIndex === -1) continue

                const key = trimmed.slice(0, eqIndex).trim()
                const value = trimmed.slice(eqIndex + 1).trim()

                parsed[key] = value
            }

            return {
                ok: true,
                data: parsed
            }
        } catch (err) {
            return {
                ok: false,
                error: "Failed to read env file"
            }
        }
    }
)

ipcMain.handle(
    "vault:save-project-env",
    async (_event, projectName: string, envData: Record<string, string>) => {
        if (!decryptedVault || !currentVaultPath) {
            return { ok: false, error: "Vault is locked" }
        }

        if (!decryptedVault.projects) {
            decryptedVault.projects = {}
        }

        decryptedVault.projects[projectName] = envData

        await createVault(decryptedVault, vaultKey!, currentVaultPath)

        return { ok: true }
    }
)
