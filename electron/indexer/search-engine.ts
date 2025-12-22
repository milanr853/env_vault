import type { IndexStore, SearchMatch } from '@shared/types'

export function searchIndex(
    store: IndexStore,
    query: string,
    limit = 50
): SearchMatch[] {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const results: SearchMatch[] = []

    for (const [name, symbols] of store.symbolIndex) {
        // ✅ PREFIX / CONTAINS MATCH (CRITICAL FIX)
        if (!name.includes(q)) continue

        for (const sym of symbols) {
            results.push({
                name: sym.name,
                fileId: sym.fileId,
                filePath: store.files.get(sym.fileId)?.path ?? '',
                kind: sym?.kind,
                startLine: sym.startLine,
                endLine: sym.endLine,
                score: score(name, q),
            })
        }
    }

    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
}

function score(symbol: string, query: string): number {
    if (symbol === query) return 100
    if (symbol.startsWith(query)) return 80
    if (symbol.includes(query)) return 60
    return 0
}
