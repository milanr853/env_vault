import { IndexStore, SearchMatch } from '@shared/types'
import { trigrams } from './trigram'

export function searchIndex(
    store: IndexStore,
    query: string,
    limit = 50
): SearchMatch[] {
    const q = query.trim().toLowerCase()
    if (!q) return []

    // 🔥 STEP 1: candidate files
    let candidateFileIds: Set<number> | undefined =
        store.tokenIndex.get(q)

    if (!candidateFileIds) {
        const sets = trigrams(q)
            .map(t => store.trigramIndex.get(t))
            .filter(Boolean) as Set<number>[]

        if (!sets.length) return []
        candidateFileIds = intersectSets(sets)
    }

    if (!candidateFileIds || candidateFileIds.size === 0) return []

    const results: SearchMatch[] = []

    // 🔥 STEP 2: MATCH AGAINST REAL SYMBOL NAME
    for (const [, symbols] of store.symbolIndex) {
        for (const sym of symbols) {
            if (!candidateFileIds.has(sym.fileId)) continue

            const score = scoreMatch(sym.name, q)
            if (score === 0) continue

            results.push({
                name: sym.name,
                fileId: sym.fileId,
                filePath: store.files.get(sym.fileId)!.path,
                kind: sym.kind,
                startLine: sym.startLine,
                endLine: sym.endLine,
                score,
            })
        }
    }

    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
}

/* ---------------- helpers ---------------- */

function intersectSets(sets: Set<number>[]): Set<number> {
    if (sets.length === 1) return sets[0]

    sets.sort((a, b) => a.size - b.size)
    const result = new Set<number>()

    outer: for (const v of sets[0]) {
        for (let i = 1; i < sets.length; i++) {
            if (!sets[i].has(v)) continue outer
        }
        result.add(v)
    }

    return result
}

function scoreMatch(symbol: string, query: string): number {
    const s = symbol.toLowerCase()

    if (s === query) return 100
    if (s.startsWith(query)) return 90
    if (s.includes(query)) return 60
    return 0
}
