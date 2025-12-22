import fs from 'node:fs'
import path from 'node:path'

const ALLOWED_EXT = new Set(['.js', '.ts', '.jsx', '.tsx'])

const IGNORED_DIRS = new Set([
    'node_modules',
    'dist',
    'build',
    '.git',
    '.next',
    '.turbo',
    'out',
    'coverage',
])

export function scanFiles(dir: string, out: string[] = []): string[] {
    const base = path.basename(dir)

    if (IGNORED_DIRS.has(base)) return out

    let entries: fs.Dirent[]
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
        return out
    }

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
