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
        return []
    }

    const symbols: SymbolEntry[] = []

    traverse(ast, {
        FunctionDeclaration(path) {
            const name = path.node.id?.name
            if (!name) return

            symbols.push({
                name,
                fileId,
                startLine: path.node.loc?.start.line ?? 0,
                endLine: path.node.loc?.end.line ?? 0,
                kind: 'function',
            })
        },

        TSDeclareFunction(path) {
            const name = path.node.id?.name
            if (!name) return

            symbols.push({
                name,
                fileId,
                startLine: path.node.loc?.start.line ?? 0,
                endLine: path.node.loc?.end.line ?? 0,
                kind: 'function',
            })
        },

        VariableDeclarator(path) {
            const id = path.node.id
            const init = path.node.init

            if (
                id.type === 'Identifier' &&
                (init?.type === 'ArrowFunctionExpression' ||
                    init?.type === 'FunctionExpression')
            ) {
                symbols.push({
                    name: id.name,
                    fileId,
                    startLine: path.node.loc?.start.line ?? 0,
                    endLine: path.node.loc?.end.line ?? 0,
                    kind: 'function',
                })
            }
        },
    })

    return symbols
}
