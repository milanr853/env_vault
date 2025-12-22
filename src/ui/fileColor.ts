export function getFileBorderColor(path: string): string {
    const p = path.toLowerCase()

    if (p.endsWith('.tsx') || p.endsWith('.jsx')) return 'border-sky-400'
    if (p.endsWith('.ts')) return 'border-blue-500'
    if (p.endsWith('.js')) return 'border-yellow-400'
    if (p.endsWith('.py')) return 'border-yellow-500'
    if (p.endsWith('.php')) return 'border-indigo-500'
    if (p.endsWith('.rs')) return 'border-orange-600'
    if (p.endsWith('.go')) return 'border-cyan-500'
    if (p.endsWith('.rb')) return 'border-red-500'
    if (p.endsWith('.css')) return 'border-indigo-400'
    if (p.endsWith('.md')) return 'border-slate-400'

    return 'border-gray-300'
}
