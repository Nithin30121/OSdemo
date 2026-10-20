import { describe, it, expect, beforeEach } from 'vitest'
import { useStudioStore } from '../store/useStudioStore'
import { useProjectStore } from '../store/useProjectStore'
import { createBlankProject } from '../services/generator/templates'
import { calculateSnapping } from '../services/studio/snappingEngine'
import { StudioNode, StudioFrame } from '../types/studio'

describe('OpenSitemap Studio: Magnetic Snapping & Smart Guides Acceptance Tests', () => {
  beforeEach(async () => {
    const blank = createBlankProject('Snapping Test Project')
    useProjectStore.setState({ project: blank, past: [], future: [] })
    await useStudioStore.getState().initDocument()
    useStudioStore.setState({ isSnappingEnabled: true, smartGuides: null, snappingThreshold: 8 })
  })

  it('1. Acceptance Test 1: Align two images by their left edges', () => {
    const candNode: StudioNode = {
      id: 'image-1',
      name: 'Hero Image A',
      type: 'image',
      frameId: null,
      x: 300,
      y: 150,
      width: 200,
      height: 150,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'none', color: 'transparent' },
    }

    const targetInput = {
      id: 'image-2',
      x: 304, // 4px off left edge (within 8px screen threshold at 100% zoom)
      y: 350,
      width: 160,
      height: 120,
      frameId: null,
    }

    const result = calculateSnapping(targetInput, [candNode], [], {
      zoom: 1.0,
      screenThreshold: 8,
      isBypassed: false,
    })

    // Snaps left edge from 304 to 300
    expect(result.hasSnappedX).toBe(true)
    expect(result.snappedX).toBe(300)
    // Vertical Smart Guide line generated at X = 300
    const vGuide = result.guides.lines.find((g) => g.orientation === 'vertical' && g.position === 300)
    expect(vGuide).toBeDefined()
    expect(vGuide?.position).toBe(300)
  })

  it('2. Acceptance Test 2: Align horizontal centers of two objects', () => {
    // Image 1: x: 200, width: 200 -> center X = 300
    const candNode: StudioNode = {
      id: 'image-1',
      name: 'Card A',
      type: 'rectangle',
      frameId: null,
      x: 200,
      y: 100,
      width: 200,
      height: 100,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'solid', color: '#1769E8' },
    }

    // Target width: 140 -> its center is at target.x + 70
    // To align center at 300, target.x should be 230
    // Proposed raw target.x: 226 (center is 296, 4px away from 300)
    const targetInput = {
      id: 'image-2',
      x: 226,
      y: 260,
      width: 140,
      height: 90,
      frameId: null,
    }

    const result = calculateSnapping(targetInput, [candNode], [], {
      zoom: 1.0,
      screenThreshold: 8,
      isBypassed: false,
    })

    expect(result.hasSnappedX).toBe(true)
    expect(result.snappedX).toBe(230) // 230 + 70 = 300 (center aligned)
    const vGuide = result.guides.lines.find((g) => g.orientation === 'vertical' && g.position === 300)
    expect(vGuide).toBeDefined()
  })

  it('3. Acceptance Test 3: Align top and bottom edges', () => {
    const candNode: StudioNode = {
      id: 'node-anchor',
      name: 'Anchor Element',
      type: 'rectangle',
      frameId: null,
      x: 100,
      y: 200,
      width: 300,
      height: 150, // bottom = 350
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'solid', color: '#1769E8' },
    }

    // A. Top Edge Snap: Candidate top = 200. Proposed target.y = 203
    const topTarget = {
      id: 'node-top',
      x: 450,
      y: 203,
      width: 150,
      height: 100,
      frameId: null,
    }

    const topResult = calculateSnapping(topTarget, [candNode], [], {
      zoom: 1.0,
      screenThreshold: 8,
      isBypassed: false,
    })
    expect(topResult.hasSnappedY).toBe(true)
    expect(topResult.snappedY).toBe(200)
    expect(topResult.guides.lines.some((l) => l.orientation === 'horizontal' && l.position === 200)).toBe(true)

    // B. Bottom Edge Snap: Candidate bottom = 350. Target height = 80.
    // To align bottom at 350, target.y should be 350 - 80 = 270.
    // Proposed target.y = 267 (bottom = 347, 3px away)
    const bottomTarget = {
      id: 'node-bottom',
      x: 450,
      y: 267,
      width: 150,
      height: 80,
      frameId: null,
    }

    const bottomResult = calculateSnapping(bottomTarget, [candNode], [], {
      zoom: 1.0,
      screenThreshold: 8,
      isBypassed: false,
    })
    expect(bottomResult.hasSnappedY).toBe(true)
    expect(bottomResult.snappedY).toBe(270)
    expect(bottomResult.guides.lines.some((l) => l.orientation === 'horizontal' && l.position === 350)).toBe(true)
  })

  it('4. Acceptance Test 4: Snap an image to a frame edge and center', () => {
    // Frame at (400, 200), width 800, height 600
    // Left: 400, Center X: 800, Right: 1200
    // Top: 200, Center Y: 500, Bottom: 800
    const frame: StudioFrame = {
      id: 'frame-test-1',
      name: 'MacBook Pro Target',
      preset: 'macbook',
      x: 400,
      y: 200,
      width: 800,
      height: 600,
      background: '#0F172A',
      clipsContent: true,
      isLocked: false,
      isHidden: false,
    }

    // A. Snap to frame left edge: proposed X = 404 -> snaps to 400
    const edgeTarget = {
      id: 'img-edge',
      x: 404,
      y: 350,
      width: 200,
      height: 150,
      frameId: frame.id,
    }
    const edgeResult = calculateSnapping(edgeTarget, [], [frame], {
      zoom: 1.0,
      screenThreshold: 8,
    })
    expect(edgeResult.hasSnappedX).toBe(true)
    expect(edgeResult.snappedX).toBe(400)
    expect(edgeResult.guides.lines.some((l) => l.orientation === 'vertical' && l.position === 400)).toBe(true)

    // B. Snap to frame horizontal and vertical center
    // Target width: 200 (offset = 100). Target height: 100 (offset = 50).
    // Desired X for center 800: 800 - 100 = 700. Proposed: 703
    // Desired Y for center 500: 500 - 50 = 450. Proposed: 447
    const centerTarget = {
      id: 'img-center',
      x: 703,
      y: 447,
      width: 200,
      height: 100,
      frameId: frame.id,
    }
    const centerResult = calculateSnapping(centerTarget, [], [frame], {
      zoom: 1.0,
      screenThreshold: 8,
    })
    expect(centerResult.hasSnappedX).toBe(true)
    expect(centerResult.snappedX).toBe(700) // Center at 800
    expect(centerResult.hasSnappedY).toBe(true)
    expect(centerResult.snappedY).toBe(450) // Center at 500
    expect(centerResult.guides.lines.some((l) => l.orientation === 'vertical' && l.position === 800)).toBe(true)
    expect(centerResult.guides.lines.some((l) => l.orientation === 'horizontal' && l.position === 500)).toBe(true)
  })

  it('5. Acceptance Test 5: Create equal spacing between three objects', () => {
    // Object A: X: 100, width: 100 -> right: 200
    const objA: StudioNode = {
      id: 'obj-a',
      name: 'Item A',
      type: 'rectangle',
      frameId: null,
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'solid', color: '#1769E8' },
    }

    // Object B: X: 240, width: 100 -> left: 240, right: 340
    // Gap between A and B is 240 - 200 = 40px
    const objB: StudioNode = {
      id: 'obj-b',
      name: 'Item B',
      type: 'rectangle',
      frameId: null,
      x: 240,
      y: 100,
      width: 100,
      height: 80,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'solid', color: '#1769E8' },
    }

    // Object C: width: 100. Equal spacing to right of B is 340 + 40 = 380px.
    // Proposed X: 383 (within 8px threshold of 380)
    const objC = {
      id: 'obj-c',
      x: 383,
      y: 100,
      width: 100,
      height: 80,
      frameId: null,
    }

    const result = calculateSnapping(objC, [objA, objB], [], {
      zoom: 1.0,
      screenThreshold: 8,
      snapToEqualSpacing: true,
    })

    expect(result.hasSnappedX).toBe(true)
    expect(result.snappedX).toBe(380)
    // Spacing guides should show matching 40px distances
    expect(result.guides.spacings.length).toBeGreaterThanOrEqual(2)
    expect(result.guides.spacings.every((s) => s.distance === 40)).toBe(true)
  })

  it('6. Acceptance Test 6: Verify snapping feels consistent at 25%, 50%, 100%, and 200% zoom', () => {
    const anchor: StudioNode = {
      id: 'anchor',
      name: 'Anchor',
      type: 'rectangle',
      frameId: null,
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'solid', color: '#1769E8' },
    }

    // Screen threshold is 8 screen pixels
    // A. At 25% zoom (0.25): docThreshold = 8 / 0.25 = 32 doc px
    // Anchor right is at 500. Target left at 525 is 25 doc px away (25 * 0.25 = 6.25 screen px <= 8 screen px) -> Snaps to 500
    const target25Snapped = { id: 't25', x: 525, y: 200, width: 100, height: 100 }
    const res25 = calculateSnapping(target25Snapped, [anchor], [], { zoom: 0.25, screenThreshold: 8 })
    expect(res25.hasSnappedX).toBe(true)
    expect(res25.snappedX).toBe(500)

    // Target left at 535 is 35 doc px away (35 * 0.25 = 8.75 screen px > 8 screen px) -> Misses snap
    const target25Missed = { id: 't25m', x: 535, y: 200, width: 100, height: 100 }
    const res25m = calculateSnapping(target25Missed, [anchor], [], { zoom: 0.25, screenThreshold: 8 })
    expect(res25m.hasSnappedX).toBe(false)

    // B. At 50% zoom (0.5): docThreshold = 8 / 0.5 = 16 doc px
    // Target left at 512 is 12 doc px away (12 * 0.5 = 6 screen px <= 8 screen px) -> Snaps to 500
    const target50Snapped = { id: 't50', x: 512, y: 200, width: 100, height: 100 }
    const res50 = calculateSnapping(target50Snapped, [anchor], [], { zoom: 0.5, screenThreshold: 8 })
    expect(res50.hasSnappedX).toBe(true)
    expect(res50.snappedX).toBe(500)

    // C. At 100% zoom (1.0): docThreshold = 8 doc px
    // Target left at 506 is 6 doc px away (6 * 1.0 = 6 screen px <= 8 screen px) -> Snaps to 500
    const target100Snapped = { id: 't100', x: 506, y: 200, width: 100, height: 100 }
    const res100 = calculateSnapping(target100Snapped, [anchor], [], { zoom: 1.0, screenThreshold: 8 })
    expect(res100.hasSnappedX).toBe(true)
    expect(res100.snappedX).toBe(500)

    // D. At 200% zoom (2.0): docThreshold = 8 / 2 = 4 doc px
    // Target left at 503 is 3 doc px away (3 * 2.0 = 6 screen px <= 8 screen px) -> Snaps to 500
    const target200Snapped = { id: 't200', x: 503, y: 200, width: 100, height: 100 }
    const res200 = calculateSnapping(target200Snapped, [anchor], [], { zoom: 2.0, screenThreshold: 8 })
    expect(res200.hasSnappedX).toBe(true)
    expect(res200.snappedX).toBe(500)

    // Target left at 506 is 6 doc px away (6 * 2.0 = 12 screen px > 8 screen px) -> Misses snap
    const target200Missed = { id: 't200m', x: 506, y: 200, width: 100, height: 100 }
    const res200m = calculateSnapping(target200Missed, [anchor], [], { zoom: 2.0, screenThreshold: 8 })
    expect(res200m.hasSnappedX).toBe(false)
  })

  it('7. Acceptance Test 7: Verify guides disappear after dragging', () => {
    const store = useStudioStore.getState()

    // 1. Set active guides as if during drag
    store.setSmartGuides({
      lines: [{ id: 'guide-test', orientation: 'vertical', position: 300, start: 100, end: 500 }],
      spacings: [],
    })
    expect(useStudioStore.getState().smartGuides?.lines.length).toBe(1)

    // 2. Drag ends: guides are cleared immediately
    store.setSmartGuides(null)
    expect(useStudioStore.getState().smartGuides).toBeNull()
  })

  it('8. Acceptance Test 8: Verify Option temporarily bypasses snapping on macOS', () => {
    const anchor: StudioNode = {
      id: 'anchor-node',
      name: 'Anchor Node',
      type: 'rectangle',
      frameId: null,
      x: 500,
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'solid', color: '#1769E8' },
    }

    const target = {
      id: 'target-node',
      x: 503, // 3px away from anchor edge (normally snaps)
      y: 200,
      width: 100,
      height: 100,
      frameId: null,
    }

    // A. Normal drag: snaps
    const normalSnap = calculateSnapping(target, [anchor], [], {
      zoom: 1.0,
      isBypassed: false,
    })
    expect(normalSnap.hasSnappedX).toBe(true)
    expect(normalSnap.snappedX).toBe(500)
    expect(normalSnap.guides.lines.length).toBeGreaterThan(0)

    // B. Holding Option key (isBypassed: true): bypasses snapping completely
    const bypassedSnap = calculateSnapping(target, [anchor], [], {
      zoom: 1.0,
      isBypassed: true,
    })
    expect(bypassedSnap.hasSnappedX).toBe(false)
    expect(bypassedSnap.snappedX).toBe(503) // Preserves raw coordinate
    expect(bypassedSnap.guides.lines).toHaveLength(0)
    expect(bypassedSnap.guides.spacings).toHaveLength(0)
  })

  it('9. Acceptance Test 9: Verify locked and hidden objects are not snapping targets', () => {
    const lockedNode: StudioNode = {
      id: 'node-locked',
      name: 'Locked Target',
      type: 'rectangle',
      frameId: null,
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: true, // LOCKED
      isHidden: false,
      fill: { type: 'solid', color: '#1769E8' },
    }

    const hiddenNode: StudioNode = {
      id: 'node-hidden',
      name: 'Hidden Target',
      type: 'rectangle',
      frameId: null,
      x: 600,
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: true, // HIDDEN
      fill: { type: 'solid', color: '#1769E8' },
    }

    // Drag target near locked node: should NOT snap
    const nearLocked = { id: 'dragged-1', x: 403, y: 200, width: 80, height: 80 }
    const resLocked = calculateSnapping(nearLocked, [lockedNode, hiddenNode], [], { zoom: 1.0 })
    expect(resLocked.hasSnappedX).toBe(false)
    expect(resLocked.snappedX).toBe(403)

    // Drag target near hidden node: should NOT snap
    const nearHidden = { id: 'dragged-2', x: 603, y: 200, width: 80, height: 80 }
    const resHidden = calculateSnapping(nearHidden, [lockedNode, hiddenNode], [], { zoom: 1.0 })
    expect(resHidden.hasSnappedX).toBe(false)
    expect(resHidden.snappedX).toBe(603)
  })

  it('10. Acceptance Test 10: Verify undo and redo restore exact positions', () => {
    const store = useStudioStore.getState()
    const initialDoc = store.document
    const node = initialDoc.nodes[0]
    expect(node).toBeDefined()

    const initialX = node.x
    const initialY = node.y
    const initialPastLength = store.past.length

    // Simulate mouse move updates during dragging with skipHistory: true
    store.updateNode(node.id, { x: initialX + 50, y: initialY + 30 }, true)
    store.updateNode(node.id, { x: initialX + 120, y: initialY + 80 }, true)
    store.updateNode(node.id, { x: initialX + 200, y: initialY + 150 }, true)

    // No undo history entries added during pointer movements
    expect(useStudioStore.getState().past.length).toBe(initialPastLength)

    // Drag finishes: commit final position with exactly ONE undo operation
    store.commitNodeMove(node.id, initialX, initialY)
    expect(useStudioStore.getState().past.length).toBe(initialPastLength + 1)

    // The node is at its final position
    let currentNode = useStudioStore.getState().document.nodes.find((n) => n.id === node.id)!
    expect(currentNode.x).toBe(initialX + 200)
    expect(currentNode.y).toBe(initialY + 150)

    // 1. Undo reverts back to initial position before the drag started in a single step
    expect(store.canUndo()).toBe(true)
    store.undo()

    currentNode = useStudioStore.getState().document.nodes.find((n) => n.id === node.id)!
    expect(currentNode.x).toBe(initialX)
    expect(currentNode.y).toBe(initialY)

    // 2. Redo restores the final snapped position
    expect(store.canRedo()).toBe(true)
    store.redo()

    currentNode = useStudioStore.getState().document.nodes.find((n) => n.id === node.id)!
    expect(currentNode.x).toBe(initialX + 200)
    expect(currentNode.y).toBe(initialY + 150)
  })
})
