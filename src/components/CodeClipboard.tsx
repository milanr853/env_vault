import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { FiCopy, FiCheck } from 'react-icons/fi'

export function CodeClipboard({
    code,
    language,
}: {
    code: string
    language: string
}) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
    }

    return (
        <div className="relative h-full border rounded overflow-hidden bg-[#1e1e1e]">
            {/* 🔹 Copy button */}
            <button
                onClick={copyToClipboard}
                className="
          absolute top-2 right-2 z-10
          flex items-center gap-1
          text-xs px-2 py-1 rounded
          bg-gray-800 text-gray-200
          hover:bg-gray-700
        "
            >
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                {copied ? 'Copied' : 'Copy'}
            </button>

            {/* 🔹 Monaco Editor */}
            <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    )
}
