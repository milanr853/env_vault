import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import path from 'node:path'
import type { SymbolEntry, SymbolKind } from '@shared/types'

/* -----------------------------
   Helpers
----------------------------- */

function lineAt(code: string, index: number) {
    return code.slice(0, index).split('\n').length
}

/**
 * Compute block end line using indentation or braces
 */
function findBlockEnd(
    code: string,
    startLine: number,
    lang: 'indent' | 'brace'
): number {
    const lines = code.split('\n')
    const startIdx = startLine - 1

    if (lang === 'indent') {
        const baseIndent =
            lines[startIdx].match(/^\s*/)?.[0].length ?? 0

        for (let i = startIdx + 1; i < lines.length; i++) {
            const indent = lines[i].match(/^\s*/)?.[0].length ?? 0
            if (lines[i].trim() && indent <= baseIndent) {
                return i
            }
        }
        return lines.length
    }

    // brace-based
    let depth = 0
    for (let i = startIdx; i < lines.length; i++) {
        depth += (lines[i].match(/{/g) || []).length
        depth -= (lines[i].match(/}/g) || []).length
        if (depth === 0 && i > startIdx) {
            return i + 1
        }
    }

    return lines.length
}

/* -----------------------------
   Regex extractor (non-JS)
----------------------------- */

function extractByRegex(
    code: string,
    fileId: number,
    ext: string
): SymbolEntry[] {
    const symbols: SymbolEntry[] = []
    let m: RegExpExecArray | null

    const push = (
        name: string,
        index: number,
        kind: SymbolKind,
        lang: 'indent' | 'brace'
    ) => {
        const start = lineAt(code, index)
        const end = findBlockEnd(code, start, lang)

        symbols.push({
            name,
            fileId,
            startLine: start,
            endLine: end,
            kind,
        })
    }

    if (ext === '.py') {
        const rx = /^(def|class)\s+([A-Za-z_][A-Za-z0-9_]*)/gm
        while ((m = rx.exec(code)))
            push(m[2], m.index, m[1] === 'class' ? 'class' : 'function', 'indent')
    }

    else if (ext === '.rb') {
        const rx = /^(class|def)\s+([A-Za-z_][A-Za-z0-9_:]*)/gm
        while ((m = rx.exec(code)))
            push(m[2], m.index, m[1] === 'class' ? 'class' : 'function', 'indent')
    }

    else if (ext === '.rs') {
        const rx = /^(fn|struct|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/gm
        while ((m = rx.exec(code)))
            push(m[2], m.index, m[1] === 'fn' ? 'function' : 'class', 'brace')
    }

    else if (ext === '.go') {
        const rx = /^func\s+([A-Za-z_][A-Za-z0-9_]*)/gm
        while ((m = rx.exec(code)))
            push(m[1], m.index, 'function', 'brace')
    }

    else if (ext === '.php') {
        const rx = /(function|class)\s+([A-Za-z_][A-Za-z0-9_]*)/gm
        while ((m = rx.exec(code)))
            push(m[2], m.index, m[1] === 'class' ? 'class' : 'function', 'brace')
    }

    return symbols
}

/* -----------------------------
   MAIN EXPORT
----------------------------- */

export function extractSymbols(
    code: string,
    fileId: number,
    filePath: string
): SymbolEntry[] {
    const ext = path.extname(filePath).toLowerCase()

    // ❌ ignore non-dev files
    if (
        ['.png', '.jpg', '.jpeg', '.gif', '.svg',
            '.pdf', '.doc', '.docx', '.csv', '.txt']
            .includes(ext)
    ) return []

    /* ✅ JS / TS / Angular → AST */
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
        const symbols: SymbolEntry[] = []

        try {
            const ast = parse(code, {
                sourceType: 'unambiguous',
                plugins: [
                    'typescript',
                    'jsx',
                    'decorators-legacy',
                    'classProperties',
                ],
                errorRecovery: true,
            })

            traverse(ast, {
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
            })

            return symbols
        } catch {
            return []
        }
    }

    /* ✅ Everything else → REGEX */
    return extractByRegex(code, fileId, ext)
}
