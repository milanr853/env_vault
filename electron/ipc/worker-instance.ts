import { Worker } from 'worker_threads'
import path from 'node:path'

export const indexWorker = new Worker(
    path.join(__dirname, '../workers/index-worker.js')
)
