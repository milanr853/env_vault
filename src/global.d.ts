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

            pickProject(): Promise<
                | { ok: true; path: string }
                | { ok: false }
            >

            scanProject(
                projectPath: string
            ): Promise<
                | { ok: true; files: string[] }
                | { ok: false; error: string }
            >

            readEnvFile(
                projectPath: string,
                fileName: string
            ): Promise<
                | { ok: true; data: Record<string, string> }
                | { ok: false; error: string }
            >

            saveProjectEnv(
                projectName: string,
                envData: Record<string, string>
            ): Promise<
                | { ok: true }
                | { ok: false; error: string }
            >

        }
    }
}
