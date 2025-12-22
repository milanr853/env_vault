import * as fs from 'node:fs'
import { scanFiles } from './file-scanner'
import { extractSymbols } from './ast-extractor'
import { trigrams } from './trigram'
import type { IndexStore } from '@shared/types'

const CACHE_PATH = 'index-cache.json'

class IndexManager {
    store: IndexStore = {
        files: new Map(),
        tokenIndex: new Map(),
        symbolIndex: new Map(),
        trigramIndex: new Map(),
    }

    private nextFileId = 1

    build(projectPaths: string[]) {
        for (const root of projectPaths) {
            const files = scanFiles(root)

            for (const filePath of files) {
                let code: string
                let stat: fs.Stats

                try {
                    code = fs.readFileSync(filePath, 'utf-8')
                    stat = fs.statSync(filePath)
                } catch {
                    continue
                }

                const lines = code.split('\n')
                const fileId = this.nextFileId++

                this.store.files.set(fileId, {
                    id: fileId,
                    path: filePath,
                    size: stat.size,
                    mtime: stat.mtimeMs,
                    lines,
                })

                let symbols = []

                try {
                    symbols = extractSymbols(code, fileId)
                } catch {
                    continue
                }

                for (const sym of symbols) {
                    const name = sym.name.toLowerCase()

                    if (!this.store.symbolIndex.has(name)) {
                        this.store.symbolIndex.set(name, [])
                    }

                    this.store.symbolIndex.get(name)!.push(sym)
                    this._addToken(name, fileId)
                }
            }
        }
        console.log(
            '[INDEX] Sample symbols:',
            [...this.store.symbolIndex.keys()].slice(0, 20)
        )

    }

    private _addToken(token: string, fileId: number) {
        if (!this.store.tokenIndex.has(token)) {
            this.store.tokenIndex.set(token, new Set())
        }
        this.store.tokenIndex.get(token)!.add(fileId)

        for (const tri of trigrams(token)) {
            if (!this.store.trigramIndex.has(tri)) {
                this.store.trigramIndex.set(tri, new Set())
            }
            this.store.trigramIndex.get(tri)!.add(fileId)
        }
    }

    persist() {
        const serialized = JSON.stringify({
            files: [...this.store.files],
            tokenIndex: [...this.store.tokenIndex].map(([k, v]) => [k, [...v]]),
            symbolIndex: [...this.store.symbolIndex],
            trigramIndex: [...this.store.trigramIndex].map(([k, v]) => [k, [...v]]),
        })

        fs.writeFileSync(CACHE_PATH, serialized)
    }

    loadFromDisk() {
        if (!fs.existsSync(CACHE_PATH)) return false

        const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'))

        this.store.files = new Map(raw.files)
        this.store.tokenIndex = new Map(
            raw.tokenIndex.map(([k, v]: any) => [k, new Set(v)])
        )
        this.store.symbolIndex = new Map(raw.symbolIndex)
        this.store.trigramIndex = new Map(
            raw.trigramIndex.map(([k, v]: any) => [k, new Set(v)])
        )

        return true
    }
}

export const indexManager = new IndexManager()
