import { useState } from 'react'

export function InjectPanel({
    code
}: {
    code: string
}) {
    const [path, setPath] = useState('')
    const [status, setStatus] = useState<string | null>(null)

    const inject = async () => {
        try {
            const res = await window.api.injectCode(path, code)
            setStatus(`Injected. Backup: ${res.backupPath}`)
        } catch (e: any) {
            setStatus(e.message || 'Injection failed')
        }
    }

    return (
        <div className="mt-4 space-y-2">
            <input
                value={path}
                onChange={e => setPath(e.target.value)}
                placeholder="Absolute path to target file"
                className="w-full p-2 border rounded"
            />
            <button
                onClick={inject}
                className="px-4 py-2 bg-green-600 text-white rounded"
            >
                Inject Code
            </button>
            {status && <div className="text-sm text-gray-600">{status}</div>}
        </div>
    )
}
