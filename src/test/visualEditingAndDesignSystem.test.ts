import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from '../store/useProjectStore'
import { createBlankProject } from '../services/generator/templates'
import { validateProjectData } from '../schemas/projectSchema'
import { generateProjectMarkdown } from '../services/export/markdownExport'

describe('Figma-Inspired Visual Editing and Design System Tests', () => {
  beforeEach(() => {
    const blank = createBlankProject('Visual Editing Test')
    useProjectStore.setState({ project: blank, past: [], future: [] })
  })

  it('adds, updates, moves, and resizes visual elements', () => {
    const store = useProjectStore.getState()
    const home = store.project!.pages[0]

    // 1. Add visual button element
    const buttonElement = store.addVisualElement(home.id, {
      type: 'button',
      name: 'Primary CTA Button',
      content: 'Get Started Today',
      layout: {
        x: 100,
        y: 150,
        width: 180,
        height: 48,
        rotation: 0,
        isLocked: false,
        isHidden: false,
      },
      style: {
        fill: '#1769E8',
        cornerRadius: 8,
        typography: {
          fontFamily: 'Inter',
          fontSize: 15,
          fontWeight: 600,
          color: '#FFFFFF',
        },
      },
    })

    const afterAdd = useProjectStore.getState().project!.wireframes[home.id]
    expect(afterAdd.elements).toBeDefined()
    expect(afterAdd.elements!.length).toBe(1)
    expect(afterAdd.elements![0].id).toBe(buttonElement.id)
    expect(afterAdd.elements![0].name).toBe('Primary CTA Button')
    expect(afterAdd.elements![0].layout.x).toBe(100)
    expect(afterAdd.elements![0].layout.width).toBe(180)

    // 2. Move element
    store.updateVisualElement(home.id, buttonElement.id, {
      layout: {
        ...buttonElement.layout,
        x: 140,
        y: 200,
      },
    })

    const afterMove = useProjectStore.getState().project!.wireframes[home.id].elements![0]
    expect(afterMove.layout.x).toBe(140)
    expect(afterMove.layout.y).toBe(200)

    // 3. Resize element
    store.updateVisualElement(home.id, buttonElement.id, {
      layout: {
        ...afterMove.layout,
        width: 220,
        height: 54,
      },
    })

    const afterResize = useProjectStore.getState().project!.wireframes[home.id].elements![0]
    expect(afterResize.layout.width).toBe(220)
    expect(afterResize.layout.height).toBe(54)
  })

  it('manages hierarchical layers: reorder, hide, lock, duplicate, and delete', () => {
    const store = useProjectStore.getState()
    const home = store.project!.pages[0]

    // Add three layers
    const el1 = store.addVisualElement(home.id, { type: 'text', name: 'Layer 1 Header' })
    const el2 = store.addVisualElement(home.id, { type: 'button', name: 'Layer 2 Button' })
    const el3 = store.addVisualElement(home.id, { type: 'card', name: 'Layer 3 Card' })

    let elements = useProjectStore.getState().project!.wireframes[home.id].elements!
    expect(elements.length).toBe(3)

    // Lock and Hide layer 2
    store.toggleLockVisualElement(home.id, el2.id)
    store.toggleHideVisualElement(home.id, el2.id)

    const updatedEl2 = useProjectStore.getState().project!.wireframes[home.id].elements!.find((e) => e.id === el2.id)!
    expect(updatedEl2.layout.isLocked).toBe(true)
    expect(updatedEl2.layout.isHidden).toBe(true)

    // Duplicate layer 1
    const duplicate = store.duplicateVisualElement(home.id, el1.id)
    expect(duplicate).toBeDefined()
    expect(duplicate!.name).toBe('Layer 1 Header (Copy)')
    expect(useProjectStore.getState().project!.wireframes[home.id].elements!.length).toBe(4)

    // Reorder layers
    const reversedIds = [el3.id, el2.id, el1.id]
    store.reorderVisualElements(home.id, reversedIds)
    const reordered = useProjectStore.getState().project!.wireframes[home.id].elements!
    expect(reordered[0].id).toBe(el3.id)

    // Delete duplicated layer
    store.deleteVisualElement(home.id, duplicate!.id)
    expect(useProjectStore.getState().project!.wireframes[home.id].elements!.length).toBe(3)
  })

  it('customizes design appearance: fill, stroke, shadows, opacity, and corner radius', () => {
    const store = useProjectStore.getState()
    const home = store.project!.pages[0]

    const card = store.addVisualElement(home.id, {
      type: 'card',
      name: 'Custom Card',
      style: {
        fill: '#0D1527',
        opacity: 0.95,
        cornerRadius: 16,
        stroke: {
          color: '#873FF0',
          width: 2,
          style: 'solid',
          position: 'inside',
        },
        shadow: {
          x: 0,
          y: 8,
          blur: 24,
          spread: 0,
          color: 'rgba(135, 63, 240, 0.25)',
        },
      },
    })

    const retrieved = useProjectStore.getState().project!.wireframes[home.id].elements![0]
    expect(retrieved.style.fill).toBe('#0D1527')
    expect(retrieved.style.opacity).toBe(0.95)
    expect(retrieved.style.cornerRadius).toBe(16)
    expect(retrieved.style.stroke?.color).toBe('#873FF0')
    expect(retrieved.style.stroke?.width).toBe(2)
    expect(retrieved.style.shadow?.blur).toBe(24)
  })

  it('manages design system: color tokens, typography tokens, and style application', () => {
    const store = useProjectStore.getState()

    // Add color token
    const token = store.addColorToken({
      name: 'Brand Electric Indigo',
      hex: '#4F46E5',
      category: 'primary',
    })
    expect(token.id).toBeDefined()
    expect(useProjectStore.getState().project!.designSystem!.colors.some((c) => c.name === 'Brand Electric Indigo')).toBe(true)

    // Update color token
    store.updateColorToken(token.id, { hex: '#4338CA' })
    const updatedToken = useProjectStore.getState().project!.designSystem!.colors.find((c) => c.id === token.id)!
    expect(updatedToken.hex).toBe('#4338CA')

    // Add text style token
    const textToken = store.addTextStyleToken({
      name: 'Banner Display ExtraLarge',
      fontFamily: 'Outfit',
      fontSize: 48,
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: -1,
      color: '#FFFFFF',
    })
    expect(textToken.id).toBeDefined()
    expect(useProjectStore.getState().project!.designSystem!.typography.some((t) => t.name === 'Banner Display ExtraLarge')).toBe(true)

    // Apply text style to element
    const home = store.project!.pages[0]
    const title = store.addVisualElement(home.id, {
      type: 'text',
      name: 'Hero Title',
      style: {
        textStyleId: textToken.id,
        typography: {
          fontFamily: textToken.fontFamily,
          fontSize: textToken.fontSize,
          fontWeight: textToken.fontWeight,
          lineHeight: textToken.lineHeight,
          letterSpacing: textToken.letterSpacing,
          color: textToken.color,
        },
      },
    })

    const titleEl = useProjectStore.getState().project!.wireframes[home.id].elements![0]
    expect(titleEl.style.textStyleId).toBe(textToken.id)
    expect(titleEl.style.typography?.fontFamily).toBe('Outfit')
    expect(titleEl.style.typography?.fontSize).toBe(48)
  })

  it('records undo/redo history for visual edits and verifies persistence validation', () => {
    const store = useProjectStore.getState()
    const home = store.project!.pages[0]

    expect(store.canUndo()).toBe(false)

    // 1. Add element
    const el = store.addVisualElement(home.id, { type: 'button', name: 'Undo Button' })
    expect(useProjectStore.getState().canUndo()).toBe(true)
    expect(useProjectStore.getState().project!.wireframes[home.id].elements!.length).toBe(1)

    // 2. Undo
    useProjectStore.getState().undo()
    expect(useProjectStore.getState().project!.wireframes[home.id]?.elements?.length || 0).toBe(0)
    expect(useProjectStore.getState().canRedo()).toBe(true)

    // 3. Redo
    useProjectStore.getState().redo()
    expect(useProjectStore.getState().project!.wireframes[home.id].elements!.length).toBe(1)

    // 4. Validate project data with Zod schema
    const project = useProjectStore.getState().project!
    const validation = validateProjectData(project)
    expect(validation.success).toBe(true)

    // 5. Verify Markdown export contains Design System section
    const markdown = generateProjectMarkdown(project)
    expect(markdown).toContain('## Design System & Style Tokens')
    expect(markdown).toContain('Color Tokens')
    expect(markdown).toContain('Typography Tokens')
  })

  it('validates all 9 Figma-style editor requirements directly', async () => {
    const { useUIStore } = await import('../store/useUIStore')
    const projectStore = useProjectStore.getState()
    const uiStore = useUIStore.getState()
    const home = projectStore.project!.pages[0]

    // 1. Central canvas selectable elements: add shape and text
    const shape = projectStore.addVisualElement(home.id, {
      type: 'shape',
      name: 'Hero Accent Shape',
      layout: { x: 50, y: 80, width: 240, height: 160, rotation: 0, isLocked: false, isHidden: false },
      style: {
        fill: '#873FF0',
        stroke: { color: '#F9E52B', width: 2, style: 'solid', position: 'inside' },
        opacity: 0.9,
        cornerRadius: 12,
        shadow: { x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.2)' },
      },
    })
    expect(shape.type).toBe('shape')

    const text = projectStore.addVisualElement(home.id, {
      type: 'text',
      name: 'Main Headline',
      content: 'Next-Gen Experience',
      layout: { x: 60, y: 100, width: 300, height: 40, rotation: 0, isLocked: false, isHidden: false },
      style: {
        typography: {
          fontFamily: 'Outfit',
          fontWeight: 700,
          fontSize: 32,
          lineHeight: 1.25,
          letterSpacing: -0.5,
          textAlign: 'left',
          color: '#FFFFFF',
        },
      },
    })
    expect(text.type).toBe('text')
    expect(text.style.typography?.letterSpacing).toBe(-0.5)

    // 2. Selection synchronization with UI store and Layers
    uiStore.setSelectedElementIds([shape.id])
    expect(useUIStore.getState().selectedElementIds).toEqual([shape.id])

    // 3. Resize and drag-to-move coordinates
    projectStore.updateVisualElement(home.id, shape.id, {
      layout: { ...shape.layout, x: 120, y: 140, width: 320, height: 200 },
    })
    const movedShape = useProjectStore.getState().project!.wireframes[home.id].elements!.find(e => e.id === shape.id)!
    expect(movedShape.layout.x).toBe(120)
    expect(movedShape.layout.y).toBe(140)
    expect(movedShape.layout.width).toBe(320)
    expect(movedShape.layout.height).toBe(200)

    // 4. Left panel tabs: Pages and Layers
    useUIStore.getState().setSidebarActiveTab('layers')
    expect(useUIStore.getState().sidebarActiveTab).toBe('layers')
    useUIStore.getState().setSidebarActiveTab('pages')
    expect(useUIStore.getState().sidebarActiveTab).toBe('pages')

    // 5. Right properties panel tabs: Design and Page
    useUIStore.getState().setPropertiesActiveTab('design')
    expect(useUIStore.getState().propertiesActiveTab).toBe('design')
    useUIStore.getState().setPropertiesActiveTab('page')
    expect(useUIStore.getState().propertiesActiveTab).toBe('page')

    // 6. Duplicate and Delete actions
    const duplicated = projectStore.duplicateVisualElement(home.id, shape.id)
    expect(duplicated).toBeDefined()
    expect(duplicated?.name).toBe('Hero Accent Shape (Copy)')
    expect(useProjectStore.getState().project!.wireframes[home.id].elements!.length).toBe(3)

    projectStore.deleteVisualElement(home.id, duplicated!.id)
    expect(useProjectStore.getState().project!.wireframes[home.id].elements!.length).toBe(2)

    // 7. Undo and Redo actions
    expect(projectStore.canUndo()).toBe(true)
    projectStore.undo() // undos delete
    expect(useProjectStore.getState().project!.wireframes[home.id].elements!.length).toBe(3)
    projectStore.redo() // redoes delete
    expect(useProjectStore.getState().project!.wireframes[home.id].elements!.length).toBe(2)

    // 8. Persistent saving & validation
    const valid = validateProjectData(useProjectStore.getState().project!)
    expect(valid.success).toBe(true)
  })
})

