export function detectLanguage(filePath: string): string {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))
        return 'typescript'
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx'))
        return 'javascript'
    return 'plaintext'
}
