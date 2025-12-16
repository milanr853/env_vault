declare module "*.css";

export { }

declare global {
    interface Window {
        envVault: {
            createVault(
                vaultPath: string,
                password: string
            ): Promise<void>

            unlockVault(
                vaultPath: string,
                password: string
            ): Promise<{ projects: Record<string, any> }>

            lockVault(): Promise<void>

            importEnvFile(
                projectName: string,
                envFilePath: string
            ): Promise<void>

            runProject(
                projectName: string,
                command: string
            ): Promise<void>

            copyToClipboard(value: string): Promise<void>
        }
    }
}
