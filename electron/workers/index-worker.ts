// electron/workers/index-worker.ts
import { parentPort } from 'worker_threads'
import { indexManager } from '../indexer/index-manager'

parentPort?.on('message', (projectPaths: string[]) => {
    try {
        indexManager.build(projectPaths)
        indexManager.persist()
        parentPort?.postMessage({ ok: true })
    } catch (err) {
        parentPort?.postMessage({ ok: false, error: String(err) })
    }
})
