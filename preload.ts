import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("envVault", {
    createVault: (password: string) =>
        ipcRenderer.invoke("vault:create", { password }),

    unlockVault: (password: string) =>
        ipcRenderer.invoke("vault:unlock", { password }),

    lockVault: () =>
        ipcRenderer.invoke("vault:lock"),

    exists: () => ipcRenderer.invoke("vault:exists"),

    importEnvFile: (projectName: string, envFilePath: string) =>
        ipcRenderer.invoke("vault:import-env", { projectName, envFilePath }),

    runProject: (projectName: string, command: string) =>
        ipcRenderer.invoke("runner:run", { projectName, command }),

    copyToClipboard: (value: string) =>
        ipcRenderer.invoke("clipboard:copy", value),
})
