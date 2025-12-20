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
        ipcRenderer.invoke("project:run", { projectName, command }),

    copyToClipboard: (value: string) =>
        ipcRenderer.invoke("clipboard:copy", value),

    pickProject: () => ipcRenderer.invoke("env:pick-project"),

    scanProject: (projectPath: string) =>
        ipcRenderer.invoke("env:scan-project", projectPath),

    readEnvFile: (projectPath: string, fileName: string) =>
        ipcRenderer.invoke("env:read-file", projectPath, fileName),

    saveProjectEnv: (
        projectName: string,
        envData: Record<string, string>
    ) => ipcRenderer.invoke(
        "vault:save-project-env",
        projectName,
        envData
    ),

    deleteProject: (projectName: string) =>
        ipcRenderer.invoke("vault:delete-project", projectName),

    stopProject: (project: string) =>
        ipcRenderer.invoke("project:stop", project)
})
