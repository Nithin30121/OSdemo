import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from '../store/useProjectStore'
import { createBlankProject } from '../services/generator/templates'

describe('useProjectStore Operations', () => {
  beforeEach(() => {
    const blank = createBlankProject('Test Project')
    useProjectStore.setState({ project: blank, past: [], future: [] })
  })

  it('creates and updates pages', () => {
    const store = useProjectStore.getState()
    const initialCount = store.project!.pages.length

    // Add child page
    const homePage = store.project!.pages[0]
    const newPage = store.addPage({ name: 'About Us', slug: '/about' }, homePage.id)

    const updated = useProjectStore.getState().project!
    expect(updated.pages.length).toBe(initialCount + 1)
    expect(newPage.name).toBe('About Us')
    expect(newPage.parentId).toBe(homePage.id)

    // Check edge created
    expect(updated.edges.some((e) => e.source === homePage.id && e.target === newPage.id)).toBe(true)

    // Update page
    store.updatePage(newPage.id, { name: 'About Our Team', slug: '/team' })
    const reloaded = useProjectStore.getState().project!
    const found = reloaded.pages.find((p) => p.id === newPage.id)
    expect(found?.name).toBe('About Our Team')
    expect(found?.slug).toBe('/team')
  })

  it('deletes pages and their children recursively', () => {
    const store = useProjectStore.getState()
    const home = store.project!.pages[0]

    // Create page and child of page
    const parent = store.addPage({ name: 'Parent' }, home.id)
    const child = store.addPage({ name: 'Child' }, parent.id)

    expect(useProjectStore.getState().project!.pages.some((p) => p.id === child.id)).toBe(true)

    // Delete parent -> should also remove child
    store.deletePage(parent.id)
    const updated = useProjectStore.getState().project!
    expect(updated.pages.some((p) => p.id === parent.id)).toBe(false)
    expect(updated.pages.some((p) => p.id === child.id)).toBe(false)
  })

  it('creates, reorders, and deletes sections', () => {
    const store = useProjectStore.getState()
    const home = store.project!.pages[0]

    const sec1 = store.addSection(home.id, { name: 'Custom Section 1', type: 'features' })
    const sec2 = store.addSection(home.id, { name: 'Custom Section 2', type: 'pricing' })

    let currentHomeSections = useProjectStore.getState().project!.sections.filter((s) => s.pageId === home.id)
    expect(currentHomeSections.some((s) => s.id === sec1.id)).toBe(true)
    expect(currentHomeSections.some((s) => s.id === sec2.id)).toBe(true)

    // Reorder
    const reversedIds = [...currentHomeSections].reverse().map((s) => s.id)
    store.reorderSections(home.id, reversedIds)

    const reorderedSections = useProjectStore
      .getState()
      .project!.sections.filter((s) => s.pageId === home.id)
      .sort((a, b) => a.position - b.position)

    expect(reorderedSections[0].id).toBe(reversedIds[0])

    // Delete section
    store.deleteSection(sec1.id)
    const afterDelete = useProjectStore.getState().project!.sections.filter((s) => s.id === sec1.id)
    expect(afterDelete.length).toBe(0)
  })

  it('synchronizes global sections across pages and allows detaching', () => {
    const store = useProjectStore.getState()
    const home = store.project!.pages[0]
    const contact = store.addPage({ name: 'Contact', slug: '/contact' })

    // Create global header
    const globalNav = store.createGlobalSection({
      name: 'Site-wide Sticky Header',
      description: 'Shared navigation header',
      type: 'navbar',
      color: '#3b82f6',
    })

    // Attach to contact page
    const contactNav = store.attachGlobalSectionToPage(globalNav.id, contact.id)
    expect(contactNav.isGlobal).toBe(true)
    expect(contactNav.globalSectionId).toBe(globalNav.id)

    // Update global section -> updates linked instances everywhere
    store.updateGlobalSection(globalNav.id, { name: 'Renamed Brand Header' })
    const updatedSec = useProjectStore.getState().project!.sections.find((s) => s.id === contactNav.id)
    expect(updatedSec?.name).toBe('Renamed Brand Header')

    // Detach instance -> makes it independent local section
    store.detachGlobalSection(contactNav.id)
    const detached = useProjectStore.getState().project!.sections.find((s) => s.id === contactNav.id)
    expect(detached?.isGlobal).toBe(false)
    expect(detached?.globalSectionId).toBe(null)

    // Subsequent global update does not touch detached instance
    store.updateGlobalSection(globalNav.id, { name: 'Second Brand Name' })
    const detachedAfter = useProjectStore.getState().project!.sections.find((s) => s.id === contactNav.id)
    expect(detachedAfter?.name).toBe('Renamed Brand Header')
  })

  it('handles undo and redo history accurately', () => {
    const store = useProjectStore.getState()
    expect(store.canUndo()).toBe(false)

    // Action 1: Add Page
    const page = store.addPage({ name: 'Undoable Page' })
    expect(useProjectStore.getState().canUndo()).toBe(true)
    expect(useProjectStore.getState().project!.pages.some((p) => p.id === page.id)).toBe(true)

    // Undo action 1
    useProjectStore.getState().undo()
    expect(useProjectStore.getState().project!.pages.some((p) => p.id === page.id)).toBe(false)
    expect(useProjectStore.getState().canRedo()).toBe(true)

    // Redo action 1
    useProjectStore.getState().redo()
    expect(useProjectStore.getState().project!.pages.some((p) => p.id === page.id)).toBe(true)
  })
})
