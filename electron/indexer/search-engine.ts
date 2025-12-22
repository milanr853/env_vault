import { IndexStore, SearchMatch } from '@shared/types'
import { trigrams } from './trigram'

export function searchIndex(
    store: IndexStore,
    query: string,
    limit = 50
): SearchMatch[] {
    if (!query.trim()) return []

    const q = query.trim()
    const exactFiles = store.tokenIndex.get(q)

    let candidateFileIds: Set<number> | undefined

    // 1️⃣ Exact match
    if (exactFiles) {
        candidateFileIds = exactFiles
    }
    // 2️⃣ Fuzzy fallback (trigram)
    else {
        const tris = trigrams(q)
        const sets = tris
            .map(t => store.trigramIndex.get(t))
            .filter(Boolean) as Set<number>[]

        if (!sets.length) return []

        candidateFileIds = intersectSets(sets)
    }

    if (!candidateFileIds) return []

    const results: SearchMatch[] = []

    for (const [name, symbols] of store.symbolIndex) {
        for (const sym of symbols) {
            if (!candidateFileIds.has(sym.fileId)) continue

            const score = scoreMatch(name, q)
            if (score === 0) continue

            results.push({
                name,
                fileId: sym.fileId,
                filePath: store.files.get(sym.fileId)!.path,
                kind: sym.kind,
                startLine: sym.startLine,
                endLine: sym.endLine,
                score
            })
        }
    }

    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
}
