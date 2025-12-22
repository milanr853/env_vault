import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import type { SymbolEntry } from '@shared/types'

export function extractSymbols(
    code: string,
    fileId: number
): SymbolEntry[] {
    let ast

    try {
        ast = parse(code, {
            sourceType: 'module',
            plugins: [
                'typescript',
                'jsx',
                'classProperties',
                'classPrivateProperties',
                'classPrivateMethods',
                'decorators-legacy',
                'dynamicImport',
                'topLevelAwait',
                'exportDefaultFrom',
                'exportNamespaceFrom',
            ],
            errorRecovery: true,
            allowAwaitOutsideFunction: true,
            allowReturnOutsideFunction: true,
        })
    } catch {
        // 🚨 CRITICAL: skip unparsable file
        return []
    }

    const symbols: SymbolEntry[] = []

    traverse(ast, {
        FunctionDeclaration(path) {
            if (path.node.id?.name) {
                symbols.push({
                    name: path.node.id.name,
                    fileId,
                    startLine: path.node.loc?.start.line ?? 0,
                    endLine: path.node.loc?.end.line ?? 0,
                    kind: 'function',
                })
            }
        },

        ClassDeclaration(path) {
            if (path.node.id?.name) {
                symbols.push({
                    name: path.node.id.name,
                    fileId,
                    startLine: path.node.loc?.start.line ?? 0,
                    endLine: path.node.loc?.end.line ?? 0,
                    kind: 'class',
                })
            }
        },
    })

    return symbols
}
