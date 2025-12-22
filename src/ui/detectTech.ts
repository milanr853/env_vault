export type Tech =
    | 'react'
    | 'node'
    | 'python'
    | 'php'
    | 'rust'
    | 'go'
    | 'ruby'
    | 'css'
    | 'other'

export function detectTech(path: string): Tech {
    const p = path.toLowerCase()

    if (p.endsWith('.tsx') || p.endsWith('.jsx')) return 'react'
    if (p.endsWith('.js') || p.includes('node')) return 'node'
    if (p.endsWith('.py')) return 'python'
    if (p.endsWith('.php')) return 'php'
    if (p.endsWith('.rs')) return 'rust'
    if (p.endsWith('.go')) return 'go'
    if (p.endsWith('.rb')) return 'ruby'
    if (p.endsWith('.css')) return 'css'

    return 'other'
}
