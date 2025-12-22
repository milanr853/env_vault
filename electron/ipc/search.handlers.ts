import { ipcMain } from 'electron'
import { worker } from './worker-bridge'

ipcMain.handle('search:query', (_, query: string) => {
    console.log('[SEARCH] query received:', query)

    return new Promise((resolve) => {
        worker.once('message', (msg) => {
            if (msg.type === 'search:result') {
                resolve(msg.results)
            }
        })

        worker.postMessage({
            type: 'search',
            query,
        })
    })
})
