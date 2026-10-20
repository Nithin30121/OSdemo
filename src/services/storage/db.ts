import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Project, StudioDocument, StudioAsset } from '../../types'

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
  studio_documents: {
    key: string
    value: StudioDocument
    indexes: { 'by-updated': string }
  }
  studio_assets: {
    key: string
    value: StudioAsset
    indexes: { 'by-created': string }
  }
}

const DB_NAME = 'opensitemap_db'
const DB_VERSION = 2

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
        if (!db.objectStoreNames.contains('studio_documents')) {
          const studioStore = db.createObjectStore('studio_documents', { keyPath: 'id' })
          studioStore.createIndex('by-updated', 'updatedAt')
        }
        if (!db.objectStoreNames.contains('studio_assets')) {
          const assetsStore = db.createObjectStore('studio_assets', { keyPath: 'id' })
          assetsStore.createIndex('by-created', 'createdAt')
        }
      },
    })
  }
  return dbPromise
}
