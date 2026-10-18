import { create } from 'zustand'
import { Project, Page, Section, GlobalSection, CanvasEdge, PageGroup, WireframePageData, WireframeComponent } from '../types'
import { saveProject, loadProject as loadProjectFromDb, initializeInitialProject } from '../services/storage/projectStorage'
import { getLayoutedElements } from '../components/canvas/layoutUtils'
import { TEMPLATES } from '../services/generator/templates'

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
}

interface ProjectStoreState {
  project: Project | null
  isLoaded: boolean
  isSaving: boolean
  lastSaved: string | null
  error: string | null
  past: Project[]
  future: Project[]

  // Core Actions
  init: () => Promise<void>
  load: (id: string) => Promise<void>
  save: () => Promise<void>
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Project Info
  setProjectDetails: (name: string, description?: string) => void
  loadTemplate: (templateId: string) => void
  replaceEntireProject: (newProject: Project) => void

  // Pages
  addPage: (partial?: Partial<Page>, parentId?: string | null) => Page
  updatePage: (pageId: string, updates: Partial<Page>) => void
  deletePage: (pageId: string) => void
  duplicatePage: (pageId: string) => Page | null
  updatePagePosition: (pageId: string, position: { x: number; y: number }) => void
  batchUpdatePositions: (positions: Array<{ id: string; position: { x: number; y: number } }>) => void
  reparentPage: (pageId: string, newParentId: string | null) => void

  // Sections
  addSection: (pageId: string, partial: Partial<Section>) => Section
  updateSection: (sectionId: string, updates: Partial<Section>) => void
  deleteSection: (sectionId: string) => void
  reorderSections: (pageId: string, newOrderedIds: string[]) => void
  duplicateSection: (sectionId: string) => Section | null

  // Global Sections
  createGlobalSection: (data: Omit<GlobalSection, 'id'>, initialPageId?: string) => GlobalSection
  updateGlobalSection: (globalSectionId: string, updates: Partial<GlobalSection>) => void
  detachGlobalSection: (sectionId: string) => void
  attachGlobalSectionToPage: (globalSectionId: string, pageId: string) => Section

  // Edges
  connectPages: (sourcePageId: string, targetPageId: string) => void
  removeEdge: (edgeId: string) => void

  // Groups
  addGroup: (name: string, color?: string) => PageGroup
  updateGroup: (groupId: string, updates: Partial<PageGroup>) => void
  deleteGroup: (groupId: string) => void
  assignPageGroup: (pageId: string, groupId: string | null) => void

  // Wireframes
  updateWireframe: (pageId: string, data: WireframePageData) => void
  updateWireframeComponentProps: (pageId: string, componentId: string, newProps: Partial<WireframeComponent['props']>) => void
  syncWireframeFromSections: (pageId: string) => void

  // Layout & Generation
  applyAutoLayout: (direction?: 'TB' | 'LR') => void
  applyGeneratedSitemap: (
    generated: {
      name: string
      pages: Page[]
      sections: Section[]
      globalSections: GlobalSection[]
      edges: CanvasEdge[]
      wireframes: Record<string, WireframePageData>
    },
    mode: 'replace' | 'append',
  ) => void
}

const MAX_HISTORY = 30

function snapshot(project: Project): Project {
  return JSON.parse(JSON.stringify(project))
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  project: null,
  isLoaded: false,
  isSaving: false,
  lastSaved: null,
  error: null,
  past: [],
  future: [],

  init: async () => {
    try {
      const proj = await initializeInitialProject()
      set({
        project: proj,
        isLoaded: true,
        past: [],
        future: [],
        lastSaved: proj.updatedAt,
      })
    } catch (err: any) {
      set({ error: err.message, isLoaded: true })
    }
  },

  load: async (id: string) => {
    const proj = await loadProjectFromDb(id)
    if (proj) {
      set({
        project: proj,
        past: [],
        future: [],
        lastSaved: proj.updatedAt,
      })
    }
  },

  save: async () => {
    const { project } = get()
    if (!project) return
    set({ isSaving: true })
    try {
      await saveProject(project)
      set({ isSaving: false, lastSaved: new Date().toISOString() })
    } catch (err: any) {
      set({ isSaving: false, error: err.message })
    }
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  undo: () => {
    const { past, project, future } = get()
    if (past.length === 0 || !project) return

    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)

    set({
      project: previous,
      past: newPast,
      future: [snapshot(project), ...future].slice(0, MAX_HISTORY),
    })
    get().save()
  },

  redo: () => {
    const { past, project, future } = get()
    if (future.length === 0 || !project) return

    const next = future[0]
    const newFuture = future.slice(1)

    set({
      project: next,
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: newFuture,
    })
    get().save()
  },

  setProjectDetails: (name: string, description?: string) => {
    const { project, past } = get()
    if (!project) return

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        name,
        description: description !== undefined ? description : project.description,
        updatedAt: new Date().toISOString(),
      },
    })
    get().save()
  },

  loadTemplate: (templateId: string) => {
    const tmpl = TEMPLATES.find((t) => t.id === templateId)
    if (!tmpl) return
    const newProject = tmpl.createProject()
    const { project, past } = get()

    set({
      past: project ? [...past, snapshot(project)].slice(-MAX_HISTORY) : [],
      future: [],
      project: newProject,
    })
    get().save()
  },

  replaceEntireProject: (newProject: Project) => {
    const { project, past } = get()
    set({
      past: project ? [...past, snapshot(project)].slice(-MAX_HISTORY) : [],
      future: [],
      project: newProject,
    })
    get().save()
  },

  addPage: (partial = {}, parentId = null) => {
    const { project, past } = get()
    if (!project) throw new Error('No active project')

    const newPageId = generateId('page')
    const now = new Date().toISOString()

    // Determine position
    let x = 300
    let y = 100
    if (parentId) {
      const parent = project.pages.find((p) => p.id === parentId)
      if (parent) {
        const siblings = project.pages.filter((p) => p.parentId === parentId)
        x = parent.position.x + (siblings.length * 300)
        y = parent.position.y + 240
      }
    } else if (project.pages.length > 0) {
      const last = project.pages[project.pages.length - 1]
      x = last.position.x + 320
      y = last.position.y
    }

    // Default hero section
    const defaultHeroId = generateId('sec')
    const heroSection: Section = {
      id: defaultHeroId,
      pageId: newPageId,
      name: 'Hero Section',
      description: 'Primary value proposition and headline',
      type: 'hero',
      isGlobal: false,
      position: 0,
    }

    const newPage: Page = {
      id: newPageId,
      name: partial.name || `Page ${project.pages.length + 1}`,
      slug: partial.slug || `/${(partial.name || `page-${project.pages.length + 1}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      description: partial.description || '',
      type: partial.type || 'content',
      parentId: parentId || null,
      groupId: partial.groupId || null,
      sectionIds: [defaultHeroId],
      position: partial.position || { x, y },
      visibility: partial.visibility || 'published',
      notes: partial.notes || '',
      color: partial.color,
    }

    const newEdges = [...project.edges]
    if (parentId) {
      newEdges.push({
        id: generateId('edge'),
        source: parentId,
        target: newPageId,
      })
    }

    // Create wireframe for page
    const wireframe: WireframePageData = {
      pageId: newPageId,
      components: [
        {
          id: generateId('wf'),
          sectionId: defaultHeroId,
          type: 'hero',
          name: 'Hero Section',
          props: {
            headline: newPage.name,
            subtext: newPage.description || 'Welcome to this page',
            buttonText: 'Learn More',
          },
        },
      ],
      viewport: 'desktop',
      layoutConfiguration: {
        spacing: 'comfortable',
        showWireframeLabels: true,
        theme: 'wireframe-clean',
      },
    }

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: now,
        pages: [...project.pages, newPage],
        sections: [...project.sections, heroSection],
        edges: newEdges,
        wireframes: {
          ...project.wireframes,
          [newPageId]: wireframe,
        },
      },
    })

    get().save()
    return newPage
  },

  updatePage: (pageId: string, updates: Partial<Page>) => {
    const { project, past } = get()
    if (!project) return

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        pages: project.pages.map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
      },
    })
    get().save()
  },

  deletePage: (pageId: string) => {
    const { project, past } = get()
    if (!project) return

    // Find all descendant pages recursively
    const toDeleteIds = new Set<string>([pageId])
    let added = true
    while (added) {
      added = false
      project.pages.forEach((p) => {
        if (p.parentId && toDeleteIds.has(p.parentId) && !toDeleteIds.has(p.id)) {
          toDeleteIds.add(p.id)
          added = true
        }
      })
    }

    // Delete sections for these pages
    const updatedSections = project.sections.filter((s) => !toDeleteIds.has(s.pageId))
    const updatedPages = project.pages.filter((p) => !toDeleteIds.has(p.id))
    const updatedEdges = project.edges.filter((e) => !toDeleteIds.has(e.source) && !toDeleteIds.has(e.target))

    const updatedWireframes = { ...project.wireframes }
    toDeleteIds.forEach((id) => delete updatedWireframes[id])

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        pages: updatedPages,
        sections: updatedSections,
        edges: updatedEdges,
        wireframes: updatedWireframes,
      },
    })
    get().save()
  },

  duplicatePage: (pageId: string) => {
    const { project, past } = get()
    if (!project) return null

    const original = project.pages.find((p) => p.id === pageId)
    if (!original) return null

    const newPageId = generateId('page')
    const originalSections = project.sections.filter((s) => s.pageId === pageId)
    const newSections: Section[] = []
    const sectionIdMap = new Map<string, string>()

    originalSections.forEach((s) => {
      const newSecId = generateId('sec')
      sectionIdMap.set(s.id, newSecId)
      newSections.push({
        ...s,
        id: newSecId,
        pageId: newPageId,
      })
    })

    const duplicatePage: Page = {
      ...original,
      id: newPageId,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy`,
      position: { x: original.position.x + 40, y: original.position.y + 40 },
      sectionIds: newSections.map((s) => s.id),
    }

    const newEdges = [...project.edges]
    if (original.parentId) {
      newEdges.push({
        id: generateId('edge'),
        source: original.parentId,
        target: newPageId,
      })
    }

    // Copy wireframe
    const origWf = project.wireframes[pageId]
    const newWf: WireframePageData = origWf
      ? {
          ...origWf,
          pageId: newPageId,
          components: origWf.components.map((c) => ({
            ...c,
            id: generateId('wf'),
            sectionId: sectionIdMap.get(c.sectionId) || generateId('sec'),
          })),
        }
      : {
          pageId: newPageId,
          components: [],
          viewport: 'desktop',
          layoutConfiguration: {
            spacing: 'comfortable',
            showWireframeLabels: true,
            theme: 'wireframe-clean',
          },
        }

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        pages: [...project.pages, duplicatePage],
        sections: [...project.sections, ...newSections],
        edges: newEdges,
        wireframes: {
          ...project.wireframes,
          [newPageId]: newWf,
        },
      },
    })
    get().save()
    return duplicatePage
  },

  updatePagePosition: (pageId: string, position: { x: number; y: number }) => {
    const { project } = get()
    if (!project) return

    set({
      project: {
        ...project,
        pages: project.pages.map((p) => (p.id === pageId ? { ...p, position } : p)),
      },
    })
  },

  batchUpdatePositions: (positions) => {
    const { project } = get()
    if (!project) return

    const posMap = new Map(positions.map((p) => [p.id, p.position]))
    set({
      project: {
        ...project,
        pages: project.pages.map((p) => {
          const newPos = posMap.get(p.id)
          return newPos ? { ...p, position: newPos } : p
        }),
      },
    })
    get().save()
  },

  reparentPage: (pageId: string, newParentId: string | null) => {
    const { project, past } = get()
    if (!project || pageId === newParentId) return

    // Prevent cycles
    let curr = newParentId
    while (curr) {
      if (curr === pageId) {
        console.warn('Cannot reparent: cycle detected')
        return
      }
      const parent = project.pages.find((p) => p.id === curr)
      curr = parent ? parent.parentId : null
    }

    const filteredEdges = project.edges.filter((e) => e.target !== pageId)
    if (newParentId) {
      filteredEdges.push({
        id: generateId('edge'),
        source: newParentId,
        target: pageId,
      })
    }

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        pages: project.pages.map((p) => (p.id === pageId ? { ...p, parentId: newParentId } : p)),
        edges: filteredEdges,
      },
    })
    get().save()
  },

  addSection: (pageId: string, partial: Partial<Section>) => {
    const { project, past } = get()
    if (!project) throw new Error('No active project')

    const page = project.pages.find((p) => p.id === pageId)
    if (!page) throw new Error(`Page ${pageId} not found`)

    const existingPageSections = project.sections.filter((s) => s.pageId === pageId)
    const newPosition = existingPageSections.length

    const newSecId = generateId('sec')
    const newSection: Section = {
      id: newSecId,
      pageId,
      globalSectionId: partial.globalSectionId || null,
      name: partial.name || 'New Section',
      description: partial.description || '',
      type: partial.type || 'content',
      customTypeName: partial.customTypeName,
      color: partial.color,
      isGlobal: !!partial.isGlobal,
      position: newPosition,
      notes: partial.notes,
    }

    const updatedPage: Page = {
      ...page,
      sectionIds: [...page.sectionIds, newSecId],
    }

    // Add wireframe component
    const origWf = project.wireframes[pageId]
    const updatedComponents = origWf ? [...origWf.components] : []
    updatedComponents.push({
      id: generateId('wf'),
      sectionId: newSecId,
      type: newSection.type,
      name: newSection.name,
      props: {
        headline: newSection.name,
        subtext: newSection.description,
      },
    })

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        pages: project.pages.map((p) => (p.id === pageId ? updatedPage : p)),
        sections: [...project.sections, newSection],
        wireframes: {
          ...project.wireframes,
          [pageId]: origWf
            ? { ...origWf, components: updatedComponents }
            : {
                pageId,
                components: updatedComponents,
                viewport: 'desktop',
                layoutConfiguration: {
                  spacing: 'comfortable',
                  showWireframeLabels: true,
                  theme: 'wireframe-clean',
                },
              },
        },
      },
    })
    get().save()
    return newSection
  },

  updateSection: (sectionId: string, updates: Partial<Section>) => {
    const { project, past } = get()
    if (!project) return

    const targetSec = project.sections.find((s) => s.id === sectionId)
    if (!targetSec) return

    // If section is global, update the underlying global section and all linked sections
    let updatedSections = [...project.sections]
    let updatedGlobal = [...project.globalSections]

    if (targetSec.isGlobal && targetSec.globalSectionId) {
      const gId = targetSec.globalSectionId
      updatedGlobal = updatedGlobal.map((g) =>
        g.id === gId
          ? {
              ...g,
              name: updates.name !== undefined ? updates.name : g.name,
              description: updates.description !== undefined ? updates.description : g.description,
              type: updates.type !== undefined ? updates.type : g.type,
              color: updates.color !== undefined ? updates.color : g.color,
              notes: updates.notes !== undefined ? updates.notes : g.notes,
            }
          : g,
      )

      // Sync across all pages
      updatedSections = updatedSections.map((s) => {
        if (s.globalSectionId === gId) {
          return {
            ...s,
            ...updates,
            name: updates.name !== undefined ? updates.name : s.name,
            description: updates.description !== undefined ? updates.description : s.description,
            type: updates.type !== undefined ? updates.type : s.type,
          }
        }
        return s
      })
    } else {
      updatedSections = updatedSections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    }

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        sections: updatedSections,
        globalSections: updatedGlobal,
      },
    })
    get().save()
  },

  deleteSection: (sectionId: string) => {
    const { project, past } = get()
    if (!project) return

    const sec = project.sections.find((s) => s.id === sectionId)
    if (!sec) return

    const pageId = sec.pageId
    const updatedSections = project.sections
      .filter((s) => s.id !== sectionId)
      .map((s, idx) => (s.pageId === pageId ? { ...s, position: idx } : s))

    const updatedPages = project.pages.map((p) =>
      p.id === pageId ? { ...p, sectionIds: p.sectionIds.filter((id) => id !== sectionId) } : p,
    )

    // Remove from wireframe
    const origWf = project.wireframes[pageId]
    const updatedWf = origWf
      ? {
          ...origWf,
          components: origWf.components.filter((c) => c.sectionId !== sectionId),
        }
      : undefined

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        sections: updatedSections,
        pages: updatedPages,
        wireframes: updatedWf
          ? { ...project.wireframes, [pageId]: updatedWf }
          : project.wireframes,
      },
    })
    get().save()
  },

  reorderSections: (pageId: string, newOrderedIds: string[]) => {
    const { project, past } = get()
    if (!project) return

    const orderMap = new Map(newOrderedIds.map((id, index) => [id, index]))

    const updatedSections = project.sections.map((s) => {
      if (s.pageId === pageId && orderMap.has(s.id)) {
        return { ...s, position: orderMap.get(s.id)! }
      }
      return s
    })

    const updatedPages = project.pages.map((p) => (p.id === pageId ? { ...p, sectionIds: newOrderedIds } : p))

    // Reorder wireframe components to match
    const origWf = project.wireframes[pageId]
    let updatedWf = origWf
    if (origWf) {
      const compMap = new Map(origWf.components.map((c) => [c.sectionId, c]))
      const reorderedComponents: WireframeComponent[] = []
      newOrderedIds.forEach((sId) => {
        const comp = compMap.get(sId)
        if (comp) reorderedComponents.push(comp)
      })
      updatedWf = { ...origWf, components: reorderedComponents }
    }

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        sections: updatedSections,
        pages: updatedPages,
        wireframes: updatedWf ? { ...project.wireframes, [pageId]: updatedWf } : project.wireframes,
      },
    })
    get().save()
  },

  duplicateSection: (sectionId: string) => {
    const { project } = get()
    if (!project) return null

    const sec = project.sections.find((s) => s.id === sectionId)
    if (!sec) return null

    return get().addSection(sec.pageId, {
      ...sec,
      name: `${sec.name} (Copy)`,
      isGlobal: false,
      globalSectionId: null,
    })
  },

  createGlobalSection: (data, initialPageId) => {
    const { project, past } = get()
    if (!project) throw new Error('No active project')

    const newGId = generateId('gsec')
    const globalSec: GlobalSection = {
      ...data,
      id: newGId,
    }

    let updatedProject = {
      ...project,
      globalSections: [...project.globalSections, globalSec],
    }

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: updatedProject,
    })

    if (initialPageId) {
      get().attachGlobalSectionToPage(newGId, initialPageId)
    }

    get().save()
    return globalSec
  },

  updateGlobalSection: (globalSectionId: string, updates: Partial<GlobalSection>) => {
    const { project, past } = get()
    if (!project) return

    const updatedGlobal = project.globalSections.map((g) => (g.id === globalSectionId ? { ...g, ...updates } : g))

    // Sync all linked sections across all pages
    const updatedSections = project.sections.map((s) => {
      if (s.globalSectionId === globalSectionId) {
        return {
          ...s,
          name: updates.name !== undefined ? updates.name : s.name,
          description: updates.description !== undefined ? updates.description : s.description,
          type: updates.type !== undefined ? updates.type : s.type,
          color: updates.color !== undefined ? updates.color : s.color,
        }
      }
      return s
    })

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        globalSections: updatedGlobal,
        sections: updatedSections,
      },
    })
    get().save()
  },

  detachGlobalSection: (sectionId: string) => {
    const { project, past } = get()
    if (!project) return

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        sections: project.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                isGlobal: false,
                globalSectionId: null,
                notes: `${s.notes ? s.notes + ' ' : ''}(Detached from global library)`,
              }
            : s,
        ),
      },
    })
    get().save()
  },

  attachGlobalSectionToPage: (globalSectionId: string, pageId: string) => {
    const { project } = get()
    if (!project) throw new Error('No active project')

    const gSec = project.globalSections.find((g) => g.id === globalSectionId)
    if (!gSec) throw new Error(`Global section ${globalSectionId} not found`)

    return get().addSection(pageId, {
      globalSectionId: gSec.id,
      name: gSec.name,
      description: gSec.description,
      type: gSec.type,
      color: gSec.color,
      isGlobal: true,
      notes: gSec.notes,
    })
  },

  connectPages: (sourcePageId: string, targetPageId: string) => {
    const { project, past } = get()
    if (!project || sourcePageId === targetPageId) return

    // Avoid duplicate edges
    const exists = project.edges.some((e) => e.source === sourcePageId && e.target === targetPageId)
    if (exists) return

    // Reparent target to source
    get().reparentPage(targetPageId, sourcePageId)
  },

  removeEdge: (edgeId: string) => {
    const { project, past } = get()
    if (!project) return

    const edge = project.edges.find((e) => e.id === edgeId)
    if (!edge) return

    // Remove edge and unlink target parentId
    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        edges: project.edges.filter((e) => e.id !== edgeId),
        pages: project.pages.map((p) => (p.id === edge.target ? { ...p, parentId: null } : p)),
      },
    })
    get().save()
  },

  addGroup: (name: string, color = '#3b82f6') => {
    const { project, past } = get()
    if (!project) throw new Error('No active project')

    const newGroup: PageGroup = {
      id: generateId('grp'),
      name,
      color,
      collapsed: false,
    }

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        groups: [...project.groups, newGroup],
      },
    })
    get().save()
    return newGroup
  },

  updateGroup: (groupId: string, updates: Partial<PageGroup>) => {
    const { project, past } = get()
    if (!project) return

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        groups: project.groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
      },
    })
    get().save()
  },

  deleteGroup: (groupId: string) => {
    const { project, past } = get()
    if (!project) return

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        groups: project.groups.filter((g) => g.id !== groupId),
        pages: project.pages.map((p) => (p.groupId === groupId ? { ...p, groupId: null } : p)),
      },
    })
    get().save()
  },

  assignPageGroup: (pageId: string, groupId: string | null) => {
    get().updatePage(pageId, { groupId })
  },

  updateWireframe: (pageId: string, data: WireframePageData) => {
    const { project, past } = get()
    if (!project) return

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        wireframes: {
          ...project.wireframes,
          [pageId]: data,
        },
      },
    })
    get().save()
  },

  updateWireframeComponentProps: (pageId: string, componentId: string, newProps: Partial<WireframeComponent['props']>) => {
    const { project, past } = get()
    if (!project) return

    const origWf = project.wireframes[pageId]
    if (!origWf) return

    const updatedComponents = origWf.components.map((c) =>
      c.id === componentId
        ? {
            ...c,
            props: { ...c.props, ...newProps },
          }
        : c,
    )

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        wireframes: {
          ...project.wireframes,
          [pageId]: { ...origWf, components: updatedComponents },
        },
      },
    })
    get().save()
  },

  syncWireframeFromSections: (pageId: string) => {
    const { project, past } = get()
    if (!project) return

    const pageSections = project.sections
      .filter((s) => s.pageId === pageId)
      .sort((a, b) => a.position - b.position)

    const existingWf = project.wireframes[pageId]
    const existingCompMap = new Map(existingWf ? existingWf.components.map((c) => [c.sectionId, c]) : [])

    const newComponents: WireframeComponent[] = pageSections.map((sec) => {
      const existing = existingCompMap.get(sec.id)
      if (existing) {
        return {
          ...existing,
          name: sec.name,
          type: sec.type,
        }
      }
      return {
        id: generateId('wf'),
        sectionId: sec.id,
        type: sec.type,
        name: sec.name,
        props: {
          headline: sec.name,
          subtext: sec.description,
          buttonText: sec.type === 'hero' ? 'Explore More' : sec.type === 'cta' ? 'Get Started' : undefined,
        },
      }
    })

    const updatedWf: WireframePageData = {
      pageId,
      components: newComponents,
      viewport: existingWf ? existingWf.viewport : 'desktop',
      layoutConfiguration: existingWf
        ? existingWf.layoutConfiguration
        : {
            spacing: 'comfortable',
            showWireframeLabels: true,
            theme: 'wireframe-clean',
          },
    }

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        wireframes: {
          ...project.wireframes,
          [pageId]: updatedWf,
        },
      },
    })
    get().save()
  },

  applyAutoLayout: (direction = 'TB') => {
    const { project, past } = get()
    if (!project || project.pages.length === 0) return

    const { pages, edges } = getLayoutedElements(project.pages, project.edges, direction)

    set({
      past: [...past, snapshot(project)].slice(-MAX_HISTORY),
      future: [],
      project: {
        ...project,
        updatedAt: new Date().toISOString(),
        pages,
        edges,
      },
    })
    get().save()
  },

  applyGeneratedSitemap: (generated, mode) => {
    const { project, past } = get()
    if (!project) return

    if (mode === 'replace') {
      const layouted = getLayoutedElements(generated.pages, generated.edges, 'TB')
      const newProj: Project = {
        ...project,
        name: generated.name || project.name,
        updatedAt: new Date().toISOString(),
        pages: layouted.pages,
        sections: generated.sections,
        globalSections: generated.globalSections,
        edges: layouted.edges,
        wireframes: generated.wireframes,
      }

      set({
        past: [...past, snapshot(project)].slice(-MAX_HISTORY),
        future: [],
        project: newProj,
      })
    } else {
      // Append mode: merge into current project
      const maxY = project.pages.reduce((acc, p) => Math.max(acc, p.position.y), 0)
      const offsetPages = generated.pages.map((p) => ({
        ...p,
        position: { x: p.position.x, y: p.position.y + maxY + 300 },
      }))

      const mergedPages = [...project.pages, ...offsetPages]
      const mergedSections = [...project.sections, ...generated.sections]
      const mergedEdges = [...project.edges, ...generated.edges]
      const mergedWireframes = { ...project.wireframes, ...generated.wireframes }

      // Deduplicate global sections
      const existingGNames = new Set(project.globalSections.map((g) => g.name))
      const newGlobals = generated.globalSections.filter((g) => !existingGNames.has(g.name))

      const layouted = getLayoutedElements(mergedPages, mergedEdges, 'TB')

      set({
        past: [...past, snapshot(project)].slice(-MAX_HISTORY),
        future: [],
        project: {
          ...project,
          updatedAt: new Date().toISOString(),
          pages: layouted.pages,
          sections: mergedSections,
          globalSections: [...project.globalSections, ...newGlobals],
          edges: layouted.edges,
          wireframes: mergedWireframes,
        },
      })
    }
    get().save()
  },
}))
