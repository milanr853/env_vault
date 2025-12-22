function intersectSets(sets: Set<number>[]): Set<number> {
    if (sets.length === 1) return sets[0]

    sets.sort((a, b) => a.size - b.size)

    const result = new Set<number>()
    for (const v of sets[0]) {
        if (sets.every(s => s.has(v))) {
            result.add(v)
        }
    }
    return result
}

function scoreMatch(symbol: string, query: string): number {
    if (symbol === query) return 100
    if (symbol.startsWith(query)) return 80
    if (symbol.includes(query)) return 60
    return 0
}
