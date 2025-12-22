import { parentPort } from 'worker_threads'
import { indexManager } from '../indexer/index-manager'
import { searchIndex } from '../indexer/search-engine'

parentPort?.on('message', (msg) => {
    try {
        // 🔹 BUILD INDEX
        if (msg.type === 'build') {
            console.log('[WORKER] build:', msg.paths)
            indexManager.build(msg.paths)
            indexManager.persist()

            parentPort!.postMessage({
                type: 'build:done',
                files: indexManager.store.files.size,
                symbols: indexManager.store.symbolIndex.size,
            })
        }

        // 🔹 SEARCH
        if (msg.type === 'search') {
            console.log('[WORKER] search:', msg.query)

            const results = searchIndex(
                indexManager.store,
                msg.query
            )

            parentPort!.postMessage({
                type: 'search:result',
                results,
            })
        }

        // 🔹 CODE EXTRACT
        if (msg.type === 'code:extract') {
            const { fileId, start, end } = msg
            const file = indexManager.store.files.get(fileId)

            parentPort!.postMessage({
                type: 'code:extract:result',
                code: file
                    ? file.lines.slice(start - 1, end).join('\n')
                    : '',
            })
        }
    } catch (err) {
        parentPort!.postMessage({
            type: 'error',
            error: String(err),
        })
    }
})
