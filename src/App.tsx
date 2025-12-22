import { useState } from 'react'
import { useSearch } from './app/hooks'
import { SearchResults } from './components/SearchResults'
import { CodeClipboard } from './components/CodeClipboard'
import { detectLanguage } from './utils/lang'
import type { SearchMatch } from '@shared/types'
import { InjectPanel } from './components/InjectPanel'

export default function App() {
    const [query, setQuery] = useState('')
    const results = useSearch(query)

    const [selected, setSelected] = useState<SearchMatch | null>(null)
    const [code, setCode] = useState('')

    const onSelect = async (item: SearchMatch) => {
        setSelected(item)

        const extracted = await window.api.extractCode(
            item.fileId,
            item.startLine,
            item.endLine
        )

        setCode(extracted)
    }

    return (
        <div className="h-screen flex">
            {/* LEFT: Search */}
            <div className="w-1/3 p-4 border-r">
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search function / symbol"
                    className="w-full mb-2 p-2 border rounded"
                />

                <SearchResults
                    results={results}
                    onSelect={onSelect}
                />
            </div>

            {/* RIGHT: Code Clipboard */}
            <div className="flex-1 p-4">
                {selected ? (
                    <>
                        <CodeClipboard
                            code={code}
                            language={detectLanguage(selected.filePath)}
                        />
                        <InjectPanel code={code} />
                    </>
                ) : (
                    <div className="text-gray-400">
                        Select a result to view code
                    </div>
                )}
            </div>
        </div>
    )
}
