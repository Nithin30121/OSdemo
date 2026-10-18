import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Project } from '../../types'

interface OpenSitemapDB extends DBSchema {
  projects: {
    key: string
    value: Project
    indexes: { 'by-updated': string }
  }
  appState: {
    key: string
    value: { key: string; value: string }
  }
}

const DB_NAME = 'opensitemap_db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<OpenSitemapDB>> | null = null

export function getDB(): Promise<IDBPDatabase<OpenSitemapDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OpenSitemapDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
          projectStore.createIndex('by-updated', 'updatedAt')
        }
        if (!db.objectStoreNames.contains('appState')) {
          db.createObjectStore('appState', { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}
