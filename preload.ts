import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("envVault", {
    createVault: (vaultPath: string, password: string) =>
        ipcRenderer.invoke("vault:create", { vaultPath, password }),

    unlockVault: (vaultPath: string, password: string) =>
        ipcRenderer.invoke("vault:unlock", { vaultPath, password }),

    lockVault: () =>
        ipcRenderer.invoke("vault:lock"),

    importEnvFile: (projectName: string, envFilePath: string) =>
        ipcRenderer.invoke("vault:import-env", { projectName, envFilePath }),

    runProject: (projectName: string, command: string) =>
        ipcRenderer.invoke("runner:run", { projectName, command }),

    copyToClipboard: (value: string) =>
        ipcRenderer.invoke("clipboard:copy", value)
})
