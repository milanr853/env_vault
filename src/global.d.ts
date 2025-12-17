declare module "*.css";

export { }

declare global {
    interface Window {
        envVault: {
            createVault(
                password: string
            ): Promise<void>

            unlockVault(
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

            exists(): Promise<boolean>
        }
    }
}
