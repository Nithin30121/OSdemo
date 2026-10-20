import { getDB } from './db'
import { Project } from '../../types'
import { validateProjectData } from '../../schemas/projectSchema'
import { createSaaSTemplate, createKLConnectTemplate } from '../generator/templates'

const ACTIVE_PROJECT_KEY = 'active_project_id'

export async function saveProject(project: Project): Promise<void> {
  const db = await getDB()
  const updatedProject: Project = {
    ...project,
    updatedAt: new Date().toISOString(),
  }
  await db.put('projects', updatedProject)
  await setActiveProjectId(project.id)
}

export async function loadProject(id: string): Promise<Project | null> {
  const db = await getDB()
  const project = await db.get('projects', id)
  if (!project) return null

  const validation = validateProjectData(project)
  if (!validation.success) {
    console.warn(`Project ${id} validation warning:`, validation.error)
    return project as Project
  }
  return validation.data as Project
}

export interface ProjectSummary {
  id: string
  name: string
  description: string
  updatedAt: string
  createdAt: string
  pageCount: number
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const db = await getDB()
  const projects = await db.getAll('projects')
  return projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
      pageCount: p.pages ? p.pages.length : 0,
    }))
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('projects', id)
  
  const activeId = await getActiveProjectId()
  if (activeId === id) {
    const remaining = await listProjects()
    if (remaining.length > 0) {
      await setActiveProjectId(remaining[0].id)
    } else {
      const defaultProj = createSaaSTemplate()
      await saveProject(defaultProj)
      await setActiveProjectId(defaultProj.id)
    }
  }
}

export async function duplicateProject(id: string, newName?: string): Promise<Project> {
  const original = await loadProject(id)
  if (!original) {
    throw new Error(`Project ${id} not found`)
  }

  const now = new Date().toISOString()
  const newId = `proj_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
  const duplicate: Project = {
    ...JSON.parse(JSON.stringify(original)),
    id: newId,
    name: newName || `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  }

  await saveProject(duplicate)
  return duplicate
}

export async function getActiveProjectId(): Promise<string | null> {
  try {
    const db = await getDB()
    const record = await db.get('appState', ACTIVE_PROJECT_KEY)
    return record?.value ?? null
  } catch {
    return null
  }
}

export async function setActiveProjectId(id: string): Promise<void> {
  try {
    const db = await getDB()
    await db.put('appState', { key: ACTIVE_PROJECT_KEY, value: id })
  } catch (err) {
    console.error('Failed to set active project id:', err)
  }
}

export async function initializeInitialProject(): Promise<Project> {
  const activeId = await getActiveProjectId()
  if (activeId) {
    const project = await loadProject(activeId)
    if (project) return project
  }

  const existingList = await listProjects()
  if (existingList.length > 0) {
    const project = await loadProject(existingList[0].id)
    if (project) {
      await setActiveProjectId(project.id)
      return project
    }
  }

  // Create default KLConnect neo-brutalist project on first launch
  const initial = createKLConnectTemplate()
  await saveProject(initial)
  await setActiveProjectId(initial.id)
  return initial
}

