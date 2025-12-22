import type { SearchMatch } from '@shared/types'
import { FileIcon } from '../ui/FileIcon'

export function SearchResults({
    results,
    onSelect,
    disabled,
}: {
    results: SearchMatch[]
    onSelect: (item: SearchMatch) => void
    disabled?: boolean
}) {
    return (
        <div className="space-y-2">
            {results.map((r, i) => (
                <div
                    key={`${r.fileId}-${r.startLine}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => !disabled && onSelect(r)}
                    className={`flex gap-2 p-2 border rounded
                    transition-all duration-200 ease-out
                    animate-in fade-in slide-in-from-bottom-1
                    ${disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100 cursor-pointer'}
`}
                >
                    {/* 🔹 File icon */}
                    <div className="shrink-0 pt-0.5">
                        <FileIcon path={r.filePath} />
                    </div>

                    {/* 🔹 Text container */}
                    <div className="min-w-0 flex-1">
                        {/* Function / symbol name */}
                        <div
                            className="font-mono text-sm font-semibold line-clamp-1"
                            title={r.name}
                        >
                            {r.name}
                        </div>

                        {/* File path */}
                        <div
                            className="text-xs text-gray-500 line-clamp-2"
                            title={`${r.filePath}:${r.startLine}`}
                        >
                            {r.filePath}:{r.startLine}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
