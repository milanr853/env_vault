import fs from 'node:fs'
import path from 'node:path'

export function detectProjectTech(root: string): string[] {
    const tech = new Set<string>()

    if (fs.existsSync(path.join(root, 'package.json'))) tech.add('node')
    if (fs.existsSync(path.join(root, 'requirements.txt'))) tech.add('python')
    if (fs.existsSync(path.join(root, 'composer.json'))) tech.add('php')
    if (fs.existsSync(path.join(root, 'Cargo.toml'))) tech.add('rust')
    if (fs.existsSync(path.join(root, 'go.mod'))) tech.add('go')

    return [...tech]
}
