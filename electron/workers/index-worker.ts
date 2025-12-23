import { parentPort } from 'worker_threads'
import { indexManager } from '../indexer/index-manager'
import { searchIndex } from '../indexer/search-engine'

// 🔑 restore cache ON WORKER START
const loaded = indexManager.loadFromDisk()
if (loaded) {
    console.log('[WORKER] Index cache restored from disk')
}

parentPort?.on('message', (msg) => {
    try {
        if (msg.type === 'get-projects') {
            parentPort!.postMessage({
                type: 'projects',
                projects: indexManager.getProjects(),
            })
        }

        if (msg.type === 'build') {
            indexManager.build(msg.paths)
            indexManager.persist()

            parentPort!.postMessage({
                type: 'build:done',
                projects: indexManager.getProjects(),
                files: indexManager.store.files.size,
            })
        }

        if (msg.type === 'search') {
            const results = searchIndex(indexManager.store, msg.query)
            parentPort!.postMessage({ type: 'search:result', results })
        }

        if (msg.type === 'code:extract') {
            const file = indexManager.store.files.get(msg.fileId)
            parentPort!.postMessage({
                type: 'code:extract:result',
                code: file
                    ? file.lines.slice(msg.start - 1, msg.end).join('\n')
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
