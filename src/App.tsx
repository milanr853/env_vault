import { useState } from 'react'
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
    const results = useSearch(query)

    const [selected, setSelected] = useState<SearchMatch | null>(null)
    const [code, setCode] = useState('')

    const dispatch = useDispatch()

    const importProjects = async () => {
        const paths = await window.api.selectFolders()
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

                <input
                    className="w-full border rounded p-2"
                    placeholder="Search function / symbol"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                <SearchResults results={results} onSelect={onSelect} />
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
