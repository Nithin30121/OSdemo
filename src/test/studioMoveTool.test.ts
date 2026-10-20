import { describe, it, expect, beforeEach } from 'vitest'
import { useStudioStore } from '../store/useStudioStore'
import { calculateSnapping } from '../services/studio/snappingEngine'
import { StudioNode } from '../types/studio'

describe('Photoshop-Style Move Tool & Object Manipulation', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useStudioStore.getState()
    store.clearSelection()
    store.setSmartGuides(null)
    useStudioStore.setState({
      document: {
        id: 'doc-1',
        name: 'Move Tool Test Project',
        version: 1,
        updatedAt: '2026-10-20T00:00:00.000Z',
        frames: [
          {
            id: 'frame-1',
            name: 'Frame 1',
            x: 100,
            y: 100,
            width: 800,
            height: 600,
            background: '#1E293B',
            clipsContent: true,
            preset: 'custom',
          },
        ],
        nodes: [
          {
            id: 'node-1',
            name: 'Card A',
            type: 'rectangle',
            frameId: 'frame-1',
            x: 50,
            y: 50,
            width: 100,
            height: 80,
            rotation: 0,
            opacity: 1,
            cornerRadius: 0,
            isLocked: false,
            isHidden: false,
            fill: { type: 'solid', color: '#1769E8' },
          },
          {
            id: 'node-2',
            name: 'Card B',
            type: 'rectangle',
            frameId: 'frame-1',
            x: 200,
            y: 50,
            width: 100,
            height: 80,
            rotation: 0,
            opacity: 1,
            cornerRadius: 0,
            isLocked: false,
            isHidden: false,
            fill: { type: 'solid', color: '#873FF0' },
          },
          {
            id: 'node-3',
            name: 'Card C',
            type: 'rectangle',
            frameId: 'frame-1',
            x: 500,
            y: 50,
            width: 100,
            height: 80,
            rotation: 0,
            opacity: 1,
            cornerRadius: 0,
            isLocked: false,
            isHidden: false,
            fill: { type: 'solid', color: '#10B981' },
          },
        ],
        assets: [],
        prototypes: [],
      },
      past: [],
      future: [],
      selectedIds: [],
    })
  })

  // 1. Multi-object selection & moving while preserving relative positions
  it('moves multiple objects simultaneously while strictly preserving relative spacing', () => {
    const store = useStudioStore.getState()
    store.setSelectedIds(['node-1', 'node-2'])

    // Relative distance between node-1 and node-2 is initially 200 - 50 = 150px
    const initialPos = {
      'node-1': { x: 50, y: 50 },
      'node-2': { x: 200, y: 50 },
    }

    // Apply batch delta: deltaX = +40, deltaY = +30
    store.updateNode('node-1', { x: 90, y: 80 })
    store.updateNode('node-2', { x: 240, y: 80 })

    // Commit single history snapshot for the entire move gesture
    store.commitBatchMove(initialPos)

    const doc = useStudioStore.getState().document
    const n1 = doc.nodes.find((n) => n.id === 'node-1')!
    const n2 = doc.nodes.find((n) => n.id === 'node-2')!

    expect(n1.x).toBe(90)
    expect(n1.y).toBe(80)
    expect(n2.x).toBe(240)
    expect(n2.y).toBe(80)
    // Relative distance remains exactly 150px
    expect(n2.x - n1.x).toBe(150)

    // Verify undo restores both nodes in a single step
    expect(useStudioStore.getState().canUndo()).toBe(true)
    useStudioStore.getState().undo()

    const docAfterUndo = useStudioStore.getState().document
    const u1 = docAfterUndo.nodes.find((n) => n.id === 'node-1')!
    const u2 = docAfterUndo.nodes.find((n) => n.id === 'node-2')!
    expect(u1.x).toBe(50)
    expect(u1.y).toBe(50)
    expect(u2.x).toBe(200)
    expect(u2.y).toBe(50)
  })

  // 2. Option-drag duplication on macOS
  it('Option-drag creates independent in-place duplicates, selects duplicates, and leaves originals unchanged', () => {
    const store = useStudioStore.getState()
    store.setSelectedIds(['node-1'])

    // Initial state: 3 nodes
    expect(store.document.nodes.length).toBe(3)

    // Trigger Option-drag duplication
    const duplicatedIds = store.duplicateSelectedForDrag()

    expect(duplicatedIds.length).toBe(1)
    const newId = duplicatedIds[0]
    expect(newId).not.toBe('node-1')

    const docAfterDup = useStudioStore.getState().document
    expect(docAfterDup.nodes.length).toBe(4)

    // Original remains in original position
    const orig = docAfterDup.nodes.find((n) => n.id === 'node-1')!
    expect(orig.x).toBe(50)
    expect(orig.y).toBe(50)

    // Duplicate is selected and has identical dimensions and independent identity
    expect(useStudioStore.getState().selectedIds).toEqual([newId])
    const duplicate = docAfterDup.nodes.find((n) => n.id === newId)!
    expect(duplicate.x).toBe(50)
    expect(duplicate.y).toBe(50)
    expect(duplicate.width).toBe(100)
    expect(duplicate.height).toBe(80)
    expect(duplicate.name).toContain('Card A Copy')

    // Drag the duplicate to new position (x: 120, y: 120)
    store.updateNode(newId, { x: 120, y: 120 })
    store.commitBatchMove({ [newId]: { x: 50, y: 50 } })

    const finalDoc = useStudioStore.getState().document
    const origFinal = finalDoc.nodes.find((n) => n.id === 'node-1')!
    const dupFinal = finalDoc.nodes.find((n) => n.id === newId)!

    expect(origFinal.x).toBe(50)
    expect(origFinal.y).toBe(50)
    expect(dupFinal.x).toBe(120)
    expect(dupFinal.y).toBe(120)
  })

  // 3. Option-drag duplication for multiple items
  it('Option-drag duplicates multiple selected items simultaneously', () => {
    const store = useStudioStore.getState()
    store.setSelectedIds(['node-1', 'node-2'])

    const dupIds = store.duplicateSelectedForDrag()
    expect(dupIds.length).toBe(2)

    const doc = useStudioStore.getState().document
    expect(doc.nodes.length).toBe(5) // 3 original + 2 duplicates
    expect(useStudioStore.getState().selectedIds).toEqual(dupIds)

    // Both originals exist untouched
    expect(doc.nodes.find((n) => n.id === 'node-1')!.x).toBe(50)
    expect(doc.nodes.find((n) => n.id === 'node-2')!.x).toBe(200)
  })

  // 4. Smart Guides & Magnetic Snapping
  it('detects alignments and produces magenta Smart Guides with spacing measurements', () => {
    const targetInput = {
      id: 'node-1',
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      frameId: 'frame-1',
    }
    const candNode: StudioNode = {
      id: 'node-2',
      name: 'Node 2',
      type: 'rectangle',
      frameId: 'frame-1',
      x: 200,
      y: 53, // 3px off top edge (within 8px threshold)
      width: 100,
      height: 80,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'solid', color: '#873FF0' },
    }

    const snap = calculateSnapping(targetInput, [candNode], [], {
      zoom: 1.0,
      screenThreshold: 8,
      isBypassed: false,
    })

    // Guides generated
    expect(snap.guides.lines.length).toBeGreaterThan(0)
    expect(snap.guides.lines.some((g) => g.orientation === 'horizontal')).toBe(true)

    // Bypass snapping when Option/Alt modifier is pressed
    const bypassedSnap = calculateSnapping(targetInput, [candNode], [], {
      zoom: 1.0,
      screenThreshold: 8,
      isBypassed: true,
    })
    expect(bypassedSnap.snappedX).toBe(50)
    expect(bypassedSnap.snappedY).toBe(50)
    expect(bypassedSnap.guides.lines.length).toBe(0)
  })

  // 5. Spacing measurements in Snapping Engine
  it('calculates live spacing measurements with distance labels to nearby objects', () => {
    const targetInput = {
      id: 'node-1',
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      frameId: 'frame-1',
    }
    const candNode: StudioNode = {
      id: 'node-2',
      name: 'Node 2',
      type: 'rectangle',
      frameId: 'frame-1',
      x: 200,
      y: 50,
      width: 100,
      height: 80,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'solid', color: '#873FF0' },
    }

    const snap = calculateSnapping(targetInput, [candNode], [], {
      zoom: 1.0,
      screenThreshold: 8,
      isBypassed: false,
    })

    // Live spacing badge
    expect(snap.guides.spacings.length).toBeGreaterThan(0)
    const hSpacing = snap.guides.spacings.find((s) => s.orientation === 'horizontal')
    expect(hSpacing).toBeDefined()
    expect(hSpacing?.distance).toBe(50)
  })

  // 6. Alignment Actions: Align Left, Center, Right, Top, Center-V, Bottom
  it('aligns multiple selected objects relative to their collective bounding box', () => {
    const store = useStudioStore.getState()
    // Collective bounding box in frame coordinates: minX=50, maxX=300 (boxWidth=250), minY=50, maxY=180 (boxHeight=130)
    store.updateNode('node-1', { x: 50, y: 50 })
    store.updateNode('node-2', { x: 200, y: 100 })
    store.setSelectedIds(['node-1', 'node-2'])

    // Align Left: all items should have x = minX = 50
    store.alignSelected('left')
    let doc = useStudioStore.getState().document
    expect(doc.nodes.find((n) => n.id === 'node-1')!.x).toBe(50)
    expect(doc.nodes.find((n) => n.id === 'node-2')!.x).toBe(50)

    // Reset positions before testing Align Right
    store.updateNode('node-1', { x: 50 })
    store.updateNode('node-2', { x: 200 })
    store.alignSelected('right')
    doc = useStudioStore.getState().document
    // maxX is 300, both widths are 100 -> x = 300 - 100 = 200
    expect(doc.nodes.find((n) => n.id === 'node-1')!.x).toBe(200)
    expect(doc.nodes.find((n) => n.id === 'node-2')!.x).toBe(200)

    // Reset positions for Center H
    store.updateNode('node-1', { x: 50 })
    store.updateNode('node-2', { x: 250 })
    store.alignSelected('center-h')
    doc = useStudioStore.getState().document
    // minX=50, maxX=350 -> centerX = 200. With width=100, x = 200 - 50 = 150
    expect(doc.nodes.find((n) => n.id === 'node-1')!.x).toBe(150)
    expect(doc.nodes.find((n) => n.id === 'node-2')!.x).toBe(150)
  })

  // 7. Single item alignment relative to parent frame
  it('aligns a single node relative to its parent frame', () => {
    const store = useStudioStore.getState()
    // frame-1 has width: 800, height: 600
    // node-1 has width: 100, height: 80
    store.setSelectedIds(['node-1'])

    // Align Center H in Frame: (800 - 100) / 2 = 350
    store.alignSelected('center-h')
    let doc = useStudioStore.getState().document
    expect(doc.nodes.find((n) => n.id === 'node-1')!.x).toBe(350)

    // Align Center V in Frame: (600 - 80) / 2 = 260
    store.alignSelected('center-v')
    doc = useStudioStore.getState().document
    expect(doc.nodes.find((n) => n.id === 'node-1')!.y).toBe(260)

    // Align Right in Frame: 800 - 100 = 700
    store.alignSelected('right')
    doc = useStudioStore.getState().document
    expect(doc.nodes.find((n) => n.id === 'node-1')!.x).toBe(700)

    // Align Bottom in Frame: 600 - 80 = 520
    store.alignSelected('bottom')
    doc = useStudioStore.getState().document
    expect(doc.nodes.find((n) => n.id === 'node-1')!.y).toBe(520)
  })

  // 8. Distribution: Equal spacing between 3 or more objects
  it('distributes 3 objects horizontally with mathematically equal gaps', () => {
    const store = useStudioStore.getState()
    // Set 3 nodes at irregular positions:
    // node-1: x=0, width=100 -> end=100
    // node-2: x=150, width=100 -> end=250
    // node-3: x=600, width=100 -> end=700
    // Total available space for gaps = (700 - 0) - (100 + 100 + 100) = 700 - 300 = 400
    // Number of gaps = 3 - 1 = 2 gaps
    // Expected gap = 400 / 2 = 200px
    // node-1 x should remain 0
    // node-2 x should become 0 + 100 + 200 = 300
    // node-3 x should remain 600 (300 + 100 + 200 = 600)
    store.updateNode('node-1', { x: 0, width: 100 })
    store.updateNode('node-2', { x: 150, width: 100 })
    store.updateNode('node-3', { x: 600, width: 100 })

    store.setSelectedIds(['node-1', 'node-2', 'node-3'])
    store.distributeSelected('horizontal')

    const doc = useStudioStore.getState().document
    const n1 = doc.nodes.find((n) => n.id === 'node-1')!
    const n2 = doc.nodes.find((n) => n.id === 'node-2')!
    const n3 = doc.nodes.find((n) => n.id === 'node-3')!

    expect(n1.x).toBe(0)
    expect(n2.x).toBe(300)
    expect(n3.x).toBe(600)

    // Verify gaps between them are exactly equal
    const gap1 = n2.x - (n1.x + n1.width) // 300 - 100 = 200
    const gap2 = n3.x - (n2.x + n2.width) // 600 - 400 = 200
    expect(gap1).toBe(200)
    expect(gap2).toBe(200)
  })

  // 9. Locked objects protection
  it('respects locked objects: locked items cannot be aligned, moved, or deleted', () => {
    const store = useStudioStore.getState()
    // Lock node-1
    store.updateNode('node-1', { isLocked: true })
    store.setSelectedIds(['node-1'])

    // Align should ignore locked items
    store.alignSelected('left')
    let doc = useStudioStore.getState().document
    expect(doc.nodes.find((n) => n.id === 'node-1')!.x).toBe(50) // unchanged!

    // In multi-selection with locked item, locked item is protected
    store.setSelectedIds(['node-1', 'node-2'])
    store.alignSelected('right')
    doc = useStudioStore.getState().document
    // node-1 remains at 50 because it is locked
    expect(doc.nodes.find((n) => n.id === 'node-1')!.x).toBe(50)
  })

  // 10. Undo and redo restores previous and next states exactly
  it('integrates Move Tool operations seamlessly with Undo and Redo', () => {
    const store = useStudioStore.getState()
    store.setSelectedIds(['node-1'])

    // Record initial state
    const initialX = store.document.nodes.find((n) => n.id === 'node-1')!.x

    // Move node-1 to 300
    store.updateNode('node-1', { x: 300 })
    store.commitBatchMove({ 'node-1': { x: initialX, y: 50 } })

    expect(useStudioStore.getState().document.nodes.find((n) => n.id === 'node-1')!.x).toBe(300)

    // Undo move
    useStudioStore.getState().undo()
    expect(useStudioStore.getState().document.nodes.find((n) => n.id === 'node-1')!.x).toBe(initialX)

    // Redo move
    useStudioStore.getState().redo()
    expect(useStudioStore.getState().document.nodes.find((n) => n.id === 'node-1')!.x).toBe(300)
  })
})
