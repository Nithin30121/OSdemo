import { getDB } from './db'
import { StudioDocument, StudioAsset } from '../../types'

export async function saveStudioDocument(doc: StudioDocument): Promise<void> {
  const db = await getDB()
  await db.put('studio_documents', doc)
}

export async function loadStudioDocument(id: string): Promise<StudioDocument | undefined> {
  const db = await getDB()
  return await db.get('studio_documents', id)
}

export async function saveStudioAsset(asset: StudioAsset): Promise<void> {
  const db = await getDB()
  await db.put('studio_assets', asset)
}

export async function loadStudioAssets(): Promise<StudioAsset[]> {
  const db = await getDB()
  return await db.getAll('studio_assets')
}

export async function deleteStudioAsset(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('studio_assets', id)
}
