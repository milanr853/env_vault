import { SearchMatch } from '@shared/types'
import { useEffect, useState } from 'react'

export function useSearch(query: string) {
    const [results, setResults] = useState<SearchMatch[]>([])

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        const id = setTimeout(async () => {
            const res = await window.api.search(query)
            setResults(res)
        }, 120)

        return () => clearTimeout(id)
    }, [query])

    return results
}
