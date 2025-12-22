import { Worker } from 'worker_threads'
import path from 'node:path'

export const worker = new Worker(
    path.join(__dirname, '../workers/index-worker.js')
)
