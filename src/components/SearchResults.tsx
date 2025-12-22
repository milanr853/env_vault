import { SearchMatch } from 'shared/types'
import { FileIcon } from '../ui/FileIcon'

export function SearchResults({
    results,
    onSelect,
    disabled = false,
}: {
    results: SearchMatch[]
    onSelect: (item: SearchMatch) => void
    disabled?: boolean
}) {
    if (!results.length) {
        return (
            <div className="text-sm text-gray-400 px-2">
                No results
            </div>
        )
    }

    return (
        <div className="space-y-1">
            {results.map(r => (
                <div
                    key={`${r.fileId}-${r.startLine}`}
                    onClick={() => !disabled && onSelect(r)}
                    className={`flex items-start gap-2 p-2 border rounded
            ${disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100 cursor-pointer'}
          `}
                >
                    {/* Icon */}
                    <div className="mt-1 w-5 flex justify-center">
                        <FileIcon path={r.filePath} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm truncate">
                            {r.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {r.filePath}:{r.startLine}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
