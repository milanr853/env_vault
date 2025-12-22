import Editor from '@monaco-editor/react'

export function CodeClipboard({
    code,
    language
}: {
    code: string
    language: string
}) {
    return (
        <div className="h-full border rounded overflow-hidden">
            <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: 'on',
                    automaticLayout: true
                }}
            />
        </div>
    )
}
