import type { SearchMatch } from '@shared/types'

export function SearchResults({
    results,
    onSelect,
    disabled = false,
}: {
    results: SearchMatch[]
    onSelect: (item: SearchMatch) => void
    disabled?: boolean
}) {
    return (
        <div className="space-y-1">
            {results.map((r) => (
                <div
                    key={`${r.fileId}-${r.startLine}`}
                    onClick={() => {
                        if (disabled) return
                        onSelect(r)
                    }}
                    className={`
                        p-2 border rounded transition
                        ${disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-100 cursor-pointer'}
                    `}
                >
                    <div className="font-mono text-sm">{r.name}</div>
                    <div className="text-xs text-gray-500">
                        {r.filePath}:{r.startLine}
                    </div>
                </div>
            ))}

            {results.length === 0 && !disabled && (
                <div className="text-xs text-gray-400">
                    No results
                </div>
            )}

            {disabled && (
                <div className="text-xs text-gray-400 italic">
                    Searching…
                </div>
            )}
        </div>
    )
}
