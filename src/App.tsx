import { useEffect, useState } from 'react'
import { useSearch } from './app/hooks'
import { detectLanguage } from './utils/lang'
import type { SearchMatch } from '@shared/types'
import { CodeClipboard } from './components/CodeClipboard'
import { SearchResults } from './components/SearchResults'
import { useDispatch, useSelector } from 'react-redux'
import { addProjects } from './features/projects/projectSlice'
import { Sidebar } from './layouts/Sidebar'


export default function App() {
    const [query, setQuery] = useState('')
    const { results, loading } = useSearch(query)

    const [selected, setSelected] = useState<SearchMatch | null>(null)
    const [code, setCode] = useState('')
    const [scanning, setScanning] = useState(false)

    useEffect(() => {
        window.api.onScanStart(() => setScanning(true))
        window.api.onScanEnd(() => setScanning(false))
    }, [])

    const dispatch = useDispatch()

    const importProjects = async () => {
        const paths = await window.api.selectFolders()
        console.log('Imported paths:', paths)

        if (paths.length) {
            dispatch(addProjects(paths))
        }
    }

    const projects = useSelector(
        (state: any) => state.projects.projects
    )


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
        <div className="flex h-screen">
            {/* LEFT PANEL */}
            <Sidebar />
            <div className="w-1/3 border-r p-4 space-y-3">
                <button
                    onClick={importProjects}
                    className="w-full rounded bg-blue-600 text-white py-2 hover:bg-blue-700"
                >
                    Import Project Folder
                </button>

                <div className="h-6">
                    <div
                        className={`transition-opacity duration-300 ${scanning ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="animate-pulse">Scanning project files…</span>
                        </div>
                    </div>
                </div>

                <input
                    className="w-full border rounded p-2"
                    placeholder="Search function / symbol"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                <SearchResults results={results} onSelect={onSelect} disabled={loading} />
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 p-4">
                {selected ? (
                    <CodeClipboard
                        code={code}
                        language={detectLanguage(selected.filePath)}
                    />
                ) : (
                    <div className="text-gray-400">
                        Select a result to view code
                    </div>
                )}
            </div>
        </div>
    )
}
