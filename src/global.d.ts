declare module "*.css";

import type { ElectronAPI } from '@shared'

export { }

declare global {
    interface Window {
        api: ElectronAPI
    }
}

