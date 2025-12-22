import { useEffect, useState } from 'react'
import type { SearchMatch } from '@shared/types'

export function useSearch(query: string) {
    const [results, setResults] = useState<SearchMatch[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        setLoading(true)

        const timer = setTimeout(async () => {
            try {
                const res = await window.api.search(query)
                setResults(res)
            } finally {
                setLoading(false)
            }
        }, 500) // ✅ 500ms debounce

        return () => clearTimeout(timer)
    }, [query])

    return { results, loading }
}
