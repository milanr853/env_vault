export function trigrams(word: string): string[] {
    const w = word.toLowerCase().trim()
    if (w.length < 3) return []

    const s = `__${w}__`
    const out: string[] = []

    for (let i = 0; i < s.length - 2; i++) {
        out.push(s.slice(i, i + 3))
    }
    return out
}
