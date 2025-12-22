import { parentPort } from 'worker_threads'
import { indexManager } from '../indexer/index-manager'
import { searchIndex } from '../indexer/search-engine'

if (!parentPort) {
    throw new Error('index-worker must be run as a worker')
}

parentPort.on('message', (msg) => {
    try {
        // 🔹 BUILD INDEX
        if (msg.type === 'build') {
            console.log('[WORKER] build request:', msg.paths)

            indexManager.build(msg.paths)
            indexManager.persist()

            console.log(
                '[WORKER] build done. files:',
                indexManager.store.files.size
            )
            console.log(
                '[WORKER] symbols:',
                indexManager.store.symbolIndex.size
            )

            parentPort!.postMessage({ type: 'built' })
        }

        // 🔹 SEARCH
        if (msg.type === 'search') {
            console.log('[WORKER] search:', msg.query)

            const results = searchIndex(
                indexManager.store,
                msg.query
            )

            parentPort!.postMessage({
                type: 'searchResult',
                results,
            })
        }
        // 🔹 CODE EXTRACT ✅
        if (msg.type === 'code:extract') {
            const { fileId, start, end } = msg.payload
            const file = indexManager.store.files.get(fileId)

            const code = file
                ? file.lines.slice(start - 1, end).join('\n')
                : ''

            parentPort!.postMessage({
                type: 'code:extract:result',
                code,
            })
        }
    } catch (err) {
        console.error('[WORKER] error:', err)
        parentPort!.postMessage({
            type: 'error',
            error: String(err),
        })
    }
})
