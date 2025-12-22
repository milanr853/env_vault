import { ipcMain } from 'electron'

ipcMain.handle(
    'code:extract',
    (_, fileId: number, start: number, end: number) => {
        return new Promise((resolve) => {
            const { worker } = require('./worker-bridge')

            worker.once('message', (msg: any) => {
                if (msg.type === 'code:extract:result') {
                    resolve(msg.code)
                }
            })

            worker.postMessage({
                type: 'code:extract',
                fileId,
                start,
                end,
            })
        })
    }
)
