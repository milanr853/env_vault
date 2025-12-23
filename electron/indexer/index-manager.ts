import * as fs from 'node:fs'
import { scanFiles } from './file-scanner'
import { extractSymbols } from './ast-extractor'
import { trigrams } from './trigram'
import type { IndexStore } from '@shared/types'

const CACHE_PATH = 'index-cache.json'
const PROJECTS_PATH = 'projects.json'

class IndexManager {
    store: IndexStore = {
        files: new Map(),
        tokenIndex: new Map(),
        symbolIndex: new Map(),
        trigramIndex: new Map(),
    }

    private nextFileId = 1

    build(
        projectPaths: string[],
        onProgress?: (done: number, total: number) => void
    ) {
        const existing = new Set(this.getProjects())
        const newProjects = projectPaths.filter(p => !existing.has(p))

        if (newProjects.length === 0) {
            console.log('[INDEX] No new projects to index')
            return
        }

        let allFiles: string[] = []
        for (const root of newProjects) {
            allFiles.push(...scanFiles(root))
        }

        const total = allFiles.length
        let done = 0

        for (const filePath of allFiles) {
            let code: string
            let stat: fs.Stats

            try {
                code = fs.readFileSync(filePath, 'utf-8')
                stat = fs.statSync(filePath)
            } catch {
                done++
                onProgress?.(done, total)
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

            let symbols: any = []
            try {
                symbols = extractSymbols(code, fileId, filePath)
            } catch { }

            for (const sym of symbols) {
                const name = sym.name.toLowerCase()

                if (!this.store.symbolIndex.has(name)) {
                    this.store.symbolIndex.set(name, [])
                }

                this.store.symbolIndex.get(name)!.push(sym)
                this._addToken(name, fileId)
            }

            done++
            onProgress?.(done, total)
        }

        this.saveProjects([...existing, ...newProjects])
        this.persist()

        console.log('[INDEX] files:', this.store.files.size)
        console.log('[INDEX] symbols:', this.store.symbolIndex.size)
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
        fs.writeFileSync(
            CACHE_PATH,
            JSON.stringify({
                files: [...this.store.files],
                tokenIndex: [...this.store.tokenIndex].map(([k, v]) => [k, [...v]]),
                symbolIndex: [...this.store.symbolIndex],
                trigramIndex: [...this.store.trigramIndex].map(([k, v]) => [k, [...v]]),
            })
        )
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

    getProjects(): string[] {
        if (!fs.existsSync(PROJECTS_PATH)) return []
        return JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf-8'))
    }

    saveProjects(projects: string[]) {
        fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2))
    }
}

export const indexManager = new IndexManager()
