import { SearchMatch } from "shared/types"

export function SearchResults({
    results,
    onSelect
}: {
    results: SearchMatch[]
    onSelect: (item: SearchMatch) => void
}) {
    return (
        <div className="space-y-1">
            {results.map(r => (
                <div
                    key={`${r.fileId}-${r.startLine}`}
                    onClick={() => onSelect(r)}
                    className="p-2 border rounded hover:bg-gray-100 cursor-pointer"
                >
                    <div className="font-mono text-sm">{r.name}</div>
                    <div className="text-xs text-gray-500">
                        {r.filePath}:{r.startLine}
                    </div>
                </div>
            ))}
        </div>
    )
}
