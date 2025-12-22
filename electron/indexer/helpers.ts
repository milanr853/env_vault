function intersectSets(sets: Set<number>[]): Set<number> {
    if (sets.length === 0) return new Set()
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
    const q = query.toLowerCase()

    if (s === q) return 100

    if (s.startsWith(q)) return 90

    // camelCase / snake_case boundary boost
    const boundaryRegex = new RegExp(`(^|_|-)${q}`)
    if (boundaryRegex.test(s)) return 80

    if (s.includes(q)) return 60

    return 0
}

