declare module "*.css";

export { }

declare global {
    interface Window {
        api: {
            selectFolders: () => Promise<string[]>
        }
    }
}

