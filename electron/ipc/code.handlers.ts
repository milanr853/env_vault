import { ipcMain } from 'electron'
import type { FileID } from '@shared/types'
import { indexManager } from '../indexer/index-manager'

ipcMain.handle(
    'code:extract',
    (_, fileId: FileID, start: number, end: number) => {
        const file = indexManager.store.files.get(fileId)
        if (!file) return ''

        // lines are 1-based, arrays are 0-based
        return file.lines.slice(start - 1, end).join('\n')
    }
)
