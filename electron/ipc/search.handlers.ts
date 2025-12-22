import { ipcMain } from 'electron'
import { indexWorker } from './worker-instance'

ipcMain.handle('search:query', (_, query: string) => {
    console.log('[SEARCH] query received:', query)

    return new Promise((resolve, reject) => {
        const onMessage = (msg: any) => {
            if (msg.type === 'searchResult') {
                indexWorker.off('message', onMessage)
                resolve(msg.results)
            }

            if (msg.type === 'error') {
                indexWorker.off('message', onMessage)
                reject(new Error(msg.error))
            }
        }

        indexWorker.on('message', onMessage)

        indexWorker.postMessage({
            type: 'search',
            query,
        })
    })
})
