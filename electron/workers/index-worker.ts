import { parentPort } from 'node:worker_threads'
import { IndexManager } from '../indexer/index-manager'

parentPort!.on('message', (paths: string[]) => {
    const manager = new IndexManager()

    if (!manager.loadFromDisk()) {
        manager.build(paths)
        manager.persist()
    }

    parentPort!.postMessage('READY')
})
