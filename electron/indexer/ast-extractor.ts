import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import path from 'node:path'
import type { SymbolEntry, SymbolKind } from '@shared/types'

/* ---------- helpers ---------- */

function lineAt(code: string, index: number) {
    return code.slice(0, index).split('\n').length
}

function push(
    symbols: SymbolEntry[],
    name: string,
    fileId: number,
    index: number,
    kind: SymbolKind,
    code: string
) {
    const line = lineAt(code, index)
    symbols.push({
        name,
        fileId,
        startLine: line,
        endLine: line,
        kind,
    })
}

/* ---------- regex extractor ---------- */

function extractByRegex(
    code: string,
    fileId: number,
    ext: string
): SymbolEntry[] {
    const symbols: SymbolEntry[] = []
    let m: RegExpExecArray | null

    if (ext === '.py') {
        const rx = /^(def|class)\s+([A-Za-z_][A-Za-z0-9_]*)/gm
        while ((m = rx.exec(code)))
            push(symbols, m[2], fileId, m.index, m[1] === 'class' ? 'class' : 'function', code)
    }

    else if (ext === '.rb') {
        const rx = /^(class|def)\s+([A-Za-z_][A-Za-z0-9_:]*)/gm
        while ((m = rx.exec(code)))
            push(symbols, m[2], fileId, m.index, m[1] === 'class' ? 'class' : 'function', code)
    }

    else if (ext === '.rs') {
        const rx = /^(fn|struct|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/gm
        while ((m = rx.exec(code)))
            push(symbols, m[2], fileId, m.index, m[1] === 'fn' ? 'function' : 'class', code)
    }

    else if (ext === '.go') {
        const rx = /^func\s+([A-Za-z_][A-Za-z0-9_]*)/gm
        while ((m = rx.exec(code)))
            push(symbols, m[1], fileId, m.index, 'function', code)
    }

    else if (ext === '.php') {
        const rx = /(function|class)\s+([A-Za-z_][A-Za-z0-9_]*)/gm
        while ((m = rx.exec(code)))
            push(symbols, m[2], fileId, m.index, m[1] === 'class' ? 'class' : 'function', code)
    }

    return symbols
}

/* ---------- main ---------- */

export function extractSymbols(
    code: string,
    fileId: number,
    filePath: string
): SymbolEntry[] {
    const ext = path.extname(filePath).toLowerCase()

    // ❌ ignore non-dev files
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.doc', '.docx', '.csv', '.txt'].includes(ext))
        return []

    // ✅ JS / TS → AST
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
        const symbols: SymbolEntry[] = []

        try {
            const ast = parse(code, {
                sourceType: 'unambiguous',
                plugins: ['typescript', 'jsx'],
                errorRecovery: true,
            })

            traverse(ast, {
                FunctionDeclaration(p) {
                    const n = p.node.id?.name
                    if (!n) return
                    symbols.push({
                        name: n,
                        fileId,
                        startLine: p.node.loc?.start.line ?? 0,
                        endLine: p.node.loc?.end.line ?? 0,
                        kind: n.startsWith('use') ? 'hook' : 'function',
                    })
                },

                VariableDeclarator(p) {
                    if (
                        p.node.id.type === 'Identifier' &&
                        (p.node.init?.type === 'ArrowFunctionExpression' ||
                            p.node.init?.type === 'FunctionExpression')
                    ) {
                        const n = p.node.id.name
                        symbols.push({
                            name: n,
                            fileId,
                            startLine: p.node.loc?.start.line ?? 0,
                            endLine: p.node.loc?.end.line ?? 0,
                            kind: n.startsWith('use') ? 'hook' : 'function',
                        })
                    }
                },

                ClassDeclaration(p) {
                    const n = p.node.id?.name
                    if (!n) return
                    symbols.push({
                        name: n,
                        fileId,
                        startLine: p.node.loc?.start.line ?? 0,
                        endLine: p.node.loc?.end.line ?? 0,
                        kind: 'class',
                    })
                },
            })

            return symbols
        } catch {
            return []
        }
    }

    // ✅ everything else → REGEX
    return extractByRegex(code, fileId, ext)
}
