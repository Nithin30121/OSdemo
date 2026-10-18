import { Project } from '../../types'
import { validateProjectData } from '../../schemas/projectSchema'

export function exportProjectToJson(project: Project): void {
  const jsonString = JSON.stringify(project, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  a.download = `${safeName || 'sitemap'}_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importProjectFromJsonFile(file: File): Promise<{
  success: boolean
  project?: Project
  error?: string
}> {
  try {
    const text = await file.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return { success: false, error: 'File is not valid JSON.' }
    }

    const validation = validateProjectData(parsed)
    if (!validation.success) {
      return {
        success: false,
        error: `Invalid project structure: ${validation.error}`,
      }
    }

    // Assign fresh updated timestamp to imported project
    const project: Project = {
      ...validation.data,
      updatedAt: new Date().toISOString(),
    }

    return {
      success: true,
      project,
    }
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to read file: ${err.message || 'Unknown error'}`,
    }
  }
}
