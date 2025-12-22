export type FileID = number

export type FileMeta = {
    id: FileID
    path: string
    size: number
    mtime: number
    lines: string[]
}

export type SymbolEntry = {
    name: string
    fileId: FileID
    startLine: number
    endLine: number
    kind: 'function' | 'class' | 'variable' | 'component'
}

export type IndexStore = {
    files: Map<FileID, FileMeta>
    tokenIndex: Map<string, Set<FileID>>
    symbolIndex: Map<string, SymbolEntry[]>
    trigramIndex: Map<string, Set<FileID>>
}

export type SearchMatch = {
    name: string
    fileId: FileID
    filePath: string
    kind: 'function' | 'class' | 'variable' | 'component'
    startLine: number
    endLine: number
    score: number
}

export type ElectronAPI = {
    selectFolders(): Promise<string[]>
    search(query: string): Promise<SearchMatch[]>
}