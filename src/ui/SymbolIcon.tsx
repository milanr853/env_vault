import { FunctionSquare, Box, Zap } from 'lucide-react'

export function SymbolIcon({ kind }: { kind: string }) {
    switch (kind) {
        case 'class':
            return <Box size={14} />
        case 'hook':
            return <Zap size={14} />
        default:
            return <FunctionSquare size={14} />
    }
}
