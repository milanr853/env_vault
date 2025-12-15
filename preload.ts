import { contextBridge, ipcRenderer } from 'electron'


contextBridge.exposeInMainWorld('envVault', {
    createVault: (opts: { path: string, password: string }) => ipcRenderer.invoke('vault:create', opts),
    unlockVault: (opts: { path: string, password: string }) => ipcRenderer.invoke('vault:unlock', opts),
    lockVault: () => ipcRenderer.invoke('vault:lock'),
    importEnvFile: (filePath: string) => ipcRenderer.invoke('vault:importEnv', filePath),
    runProject: (projectName: string, cmd: string, args: string[]) => ipcRenderer.invoke('runner:run', { projectName, cmd, args }),
    copyToClipboard: (value: string) => ipcRenderer.invoke('clipboard:copy', value)
})