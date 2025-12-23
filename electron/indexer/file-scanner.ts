import fs from 'node:fs'
import path from 'node:path'

const ALLOWED_EXT = new Set([
    // JS / TS
    '.js', '.ts', '.jsx', '.tsx',

    // Backend languages
    '.py', '.rb', '.rs', '.go', '.php', '.java', '.kt',

    // C-family
    '.c', '.cpp', '.h',

    // Web
    '.html', '.css',

    // Config / infra
    '.yml', '.yaml', '.sql',

    // Swift
    '.swift',
])

const SPECIAL_FILES = new Set([
    'Dockerfile',
])

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

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const e of entries) {
        const full = path.join(dir, e.name)

        if (e.isDirectory()) {
            scanFiles(full, out)
            continue
        }

        const ext = path.extname(e.name).toLowerCase()

        if (ALLOWED_EXT.has(ext) || SPECIAL_FILES.has(e.name)) {
            out.push(full)
        }
    }

    return out
}
