import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import type { SymbolEntry } from '@shared/types'

export function extractSymbols(
    code: string,
    fileId: number
): SymbolEntry[] {
    const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
    })

    const symbols: SymbolEntry[] = []

    traverse(ast, {
        FunctionDeclaration(path) {
            if (!path.node.id) return
            symbols.push({
                name: path.node.id.name,
                fileId,
                startLine: path.node.loc!.start.line,
                endLine: path.node.loc!.end.line,
                kind: 'function'
            })
        },

        VariableDeclarator(path) {
            const id = path.node.id
            if (id.type !== 'Identifier') return

            symbols.push({
                name: id.name,
                fileId,
                startLine: path.node.loc!.start.line,
                endLine: path.node.loc!.end.line,
                kind: 'variable'
            })
        },

        ClassDeclaration(path) {
            if (!path.node.id) return
            symbols.push({
                name: path.node.id.name,
                fileId,
                startLine: path.node.loc!.start.line,
                endLine: path.node.loc!.end.line,
                kind: 'class'
            })
        }
    })

    return symbols
}
