import { ipcMain } from 'electron'
import { searchIndex } from '../indexer/search-engine'
import { indexManager } from '../state'

ipcMain.handle('search:query', (_, query: string) => {
    return searchIndex(indexManager.store, query)
})
