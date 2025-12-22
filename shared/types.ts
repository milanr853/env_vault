export type FileID = number

export type SymbolKind = 'function' | 'class' | 'variable' | 'component' | 'hook'

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
    kind: SymbolKind
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
    kind: SymbolKind
    startLine: number
    endLine: number
    score: number
}

export type ElectronAPI = {
    selectFolders(): Promise<string[]>
    search(query: string): Promise<SearchMatch[]>
    extractCode(fileId: FileID, startLine: number, endLine: number): Promise<string>
    injectCode(targetPath: string, code: string): Promise<InjectResult>
}


export type ExtractCodeParams = {
    fileId: FileID
    startLine: number
    endLine: number
}

export type InjectResult = {
    success: boolean
    backupPath: string
}