import { ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

type InjectPayload = {
    targetPath: string
    code: string
}

ipcMain.handle('code:inject', async (_, payload: InjectPayload) => {
    const { targetPath, code } = payload

    // Safety checks
    if (!fs.existsSync(targetPath)) {
        throw new Error('Target file does not exist')
    }

    const stat = fs.statSync(targetPath)
    if (!stat.isFile()) {
        throw new Error('Target path is not a file')
    }

    const allowedExt = new Set(['.js', '.ts', '.tsx', '.jsx', '.css', '.html', '.py'])
    if (!allowedExt.has(path.extname(targetPath))) {
        throw new Error('File type not allowed for injection')
    }

    const original = fs.readFileSync(targetPath, 'utf-8')

    // Backup (same folder)
    const backupPath = `${targetPath}.bak`
    if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, original)
    }

    // Default strategy: append at bottom with spacing
    const next = original.replace(/\s*$/, '\n\n' + code + '\n')

    fs.writeFileSync(targetPath, next)

    return {
        success: true,
        backupPath
    }
})
