export function trigrams(word: string): string[] {
    const s = `__${word.toLowerCase()}__`
    const out: string[] = []

    for (let i = 0; i < s.length - 2; i++) {
        out.push(s.slice(i, i + 3))
    }
    return out
}
