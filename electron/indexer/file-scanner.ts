import fs from 'node:fs'import path from 'node:path'
const ALLOWED_EXT = new Set(['.js', '.ts', '.jsx', '.tsx'])

export function scanFiles(dir: string, out: string[] = []): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const e of entries) {
        const full = path.join(dir, e.name)
        if (e.isDirectory()) {
            scanFiles(full, out)
        } else if (ALLOWED_EXT.has(path.extname(e.name))) {
            out.push(full)
        }
    }
    return out
}
