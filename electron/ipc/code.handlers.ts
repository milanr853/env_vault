import { ipcMain } from 'electron'
import type { FileID } from '@shared/types'
import { indexWorker } from './worker-instance'

ipcMain.handle(
    'code:extract',
    (_, fileId: FileID, start: number, end: number) => {
        return new Promise((resolve, reject) => {
            const onMessage = (msg: any) => {
                if (msg.type === 'code:extract:result') {
                    indexWorker.off('message', onMessage)
                    resolve(msg.code)
                }

                if (msg.type === 'error') {
                    indexWorker.off('message', onMessage)
                    reject(msg.error)
                }
            }

            indexWorker.on('message', onMessage)

            indexWorker.postMessage({
                type: 'code:extract',
                payload: { fileId, start, end },
            })
        })
    }
)
