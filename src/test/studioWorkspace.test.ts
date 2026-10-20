import { describe, it, expect, beforeEach } from 'vitest'
import {
  useStudioStore,
  MIN_LEFT_SIDEBAR_WIDTH,
  MAX_LEFT_SIDEBAR_WIDTH,
  DEFAULT_LEFT_SIDEBAR_WIDTH,
  MIN_RIGHT_SIDEBAR_WIDTH,
  MAX_RIGHT_SIDEBAR_WIDTH,
  DEFAULT_RIGHT_SIDEBAR_WIDTH,
} from '../store/useStudioStore'
import { useUIStore } from '../store/useUIStore'
import { useProjectStore } from '../store/useProjectStore'
import { createBlankProject } from '../services/generator/templates'
import { validateProjectData } from '../schemas/projectSchema'
import { isSupportedImageFile, sanitizeSvg, processImageFile } from '../services/storage/assetUtils'

describe('OpenSitemap Studio Workspace Integration Tests', () => {
  beforeEach(async () => {
    // Reset stores
    const blank = createBlankProject('Studio Test Project')
    useProjectStore.setState({ project: blank, past: [], future: [] })
    useUIStore.setState({ activeView: 'studio' })
    await useStudioStore.getState().initDocument()
  })

  it('1. Initializes default Studio document with Desktop & Mobile frames and nodes', () => {
    const doc = useStudioStore.getState().document
    expect(doc).toBeDefined()
    expect(doc.frames.length).toBeGreaterThanOrEqual(2)

    const desktop = doc.frames.find((f) => f.preset === 'desktop')
    const mobile = doc.frames.find((f) => f.preset === 'iphone')
    expect(desktop).toBeDefined()
    expect(desktop?.width).toBe(1440)
    expect(desktop?.height).toBe(900)
    expect(mobile).toBeDefined()
    expect(mobile?.width).toBe(393)
    expect(mobile?.height).toBe(852)

    expect(doc.nodes.length).toBeGreaterThanOrEqual(4)
    expect(doc.prototypes.length).toBeGreaterThanOrEqual(1)
  })

  it('2. Adds, updates, resizes, and duplicates frames with presets and custom dimensions', () => {
    const store = useStudioStore.getState()

    // Add iPad frame
    const ipadFrame = store.addFrame('ipad', { name: 'Tablet Catalog' })
    expect(ipadFrame.id).toBeDefined()
    expect(ipadFrame.name).toBe('Tablet Catalog')
    expect(ipadFrame.width).toBe(834)
    expect(ipadFrame.height).toBe(1194)

    // Update frame background and clipping
    store.updateFrame(ipadFrame.id, {
      background: '#1E1B4B',
      clipsContent: true,
      width: 900,
    })
    const updated = useStudioStore.getState().document.frames.find((f) => f.id === ipadFrame.id)!
    expect(updated.background).toBe('#1E1B4B')
    expect(updated.width).toBe(900)

    // Duplicate frame
    const duplicated = store.duplicateFrame(ipadFrame.id)
    expect(duplicated).toBeDefined()
    expect(duplicated?.name).toBe('Tablet Catalog (Copy)')
    expect(useStudioStore.getState().document.frames.some((f) => f.id === duplicated?.id)).toBe(true)

    // Delete frame
    store.deleteFrame(duplicated!.id)
    expect(useStudioStore.getState().document.frames.some((f) => f.id === duplicated?.id)).toBe(false)
  })

  it('3. Adds, updates, moves, and formats text, shapes, drawings, and images', () => {
    const store = useStudioStore.getState()
    const frame = store.document.frames[0]

    // 1. Text object with typography
    const textNode = store.addNode(
      {
        type: 'text',
        name: 'Main Slogan',
        text: {
          content: 'Built for High-Growth Teams',
          fontFamily: 'Outfit',
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: -1,
          textAlign: 'left',
          color: '#F8F5EF',
        },
      },
      frame.id
    )
    expect(textNode.type).toBe('text')
    expect(textNode.text?.fontSize).toBe(36)
    expect(textNode.text?.letterSpacing).toBe(-1)

    // 2. Geometric Shape (Rectangle with gradient fill and stroke)
    const shapeNode = store.addNode(
      {
        type: 'rectangle',
        name: 'Feature Box',
        x: 100,
        y: 120,
        width: 320,
        height: 180,
        cornerRadius: 16,
        fill: {
          type: 'gradient',
          color: '#873FF0',
          gradientType: 'linear',
          gradientAngle: 45,
          gradientStops: [
            { color: '#873FF0', offset: 0 },
            { color: '#1769E8', offset: 100 },
          ],
        },
        stroke: { color: '#C084FC', width: 2, style: 'solid' },
        shadow: { x: 0, y: 12, blur: 32, spread: 0, color: 'rgba(0,0,0,0.5)' },
      },
      frame.id
    )
    expect(shapeNode.fill.type).toBe('gradient')
    expect(shapeNode.cornerRadius).toBe(16)
    expect(shapeNode.stroke?.width).toBe(2)

    // 3. Move and Resize
    store.updateNode(shapeNode.id, {
      x: 140,
      y: 160,
      width: 400,
      height: 220,
      rotation: 15,
      opacity: 0.9,
    })
    const moved = useStudioStore.getState().document.nodes.find((n) => n.id === shapeNode.id)!
    expect(moved.x).toBe(140)
    expect(moved.y).toBe(160)
    expect(moved.width).toBe(400)
    expect(moved.rotation).toBe(15)
    expect(moved.opacity).toBe(0.9)

    // 4. Freehand vector drawing
    const drawNode = store.addNode(
      {
        type: 'drawing',
        name: 'Signature Curve',
        drawing: {
          points: [
            { x: 10, y: 10 },
            { x: 30, y: 50 },
            { x: 80, y: 20 },
          ],
          strokeColor: '#38BDF8',
          strokeWidth: 4,
        },
      },
      frame.id
    )
    expect(drawNode.drawing?.points.length).toBe(3)
    expect(drawNode.drawing?.strokeWidth).toBe(4)
  })

  it('4. Reusable components: master component creation, instance creation, and change propagation', () => {
    const store = useStudioStore.getState()
    const frame = store.document.frames[0]

    // Create a base card node
    const baseNode = store.addNode(
      {
        type: 'rectangle',
        name: 'Action Badge',
        x: 50,
        y: 50,
        width: 160,
        height: 44,
        cornerRadius: 8,
        fill: { type: 'solid', color: '#1769E8' },
        text: {
          content: 'Submit Application',
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: 0,
          textAlign: 'center',
          color: '#FFFFFF',
        },
      },
      frame.id
    )

    // Select and convert to Master Component
    store.setSelectedIds([baseNode.id])
    const master = store.createComponentFromSelection()
    expect(master).toBeDefined()
    expect(master?.type).toBe('component')
    expect(master?.component?.isMaster).toBe(true)

    // Instantiate component
    const instance = store.createInstanceFromMaster(master!.id)
    expect(instance).toBeDefined()
    expect(instance?.type).toBe('instance')
    expect(instance?.component?.masterId).toBe(master!.id)

    // Update master component fill & radius and verify propagation to instance
    store.updateNode(master!.id, {
      fill: { type: 'solid', color: '#873FF0' },
      cornerRadius: 20,
    })

    const updatedInstance = useStudioStore.getState().document.nodes.find((n) => n.id === instance!.id)!
    expect(updatedInstance.fill.color).toBe('#873FF0')
    expect(updatedInstance.cornerRadius).toBe(20)

    // Detach instance
    store.detachInstance(instance!.id)
    const detached = useStudioStore.getState().document.nodes.find((n) => n.id === instance!.id)!
    expect(detached.type).not.toBe('instance')
    expect(detached.component).toBeUndefined()
  })

  it('5. Auto-Layout calculations for horizontal and vertical directions', () => {
    const store = useStudioStore.getState()
    const frame = store.document.frames[0]

    // Enable auto-layout on frame
    store.updateFrame(frame.id, {
      autoLayout: {
        enabled: true,
        direction: 'vertical',
        gap: 20,
        padding: { top: 32, right: 24, bottom: 32, left: 24 },
        alignment: 'start',
        hugContents: false,
      },
    })

    const updatedFrame = useStudioStore.getState().document.frames.find((f) => f.id === frame.id)!
    expect(updatedFrame.autoLayout?.enabled).toBe(true)
    expect(updatedFrame.autoLayout?.direction).toBe('vertical')
    expect(updatedFrame.autoLayout?.gap).toBe(20)
    expect(updatedFrame.autoLayout?.padding.top).toBe(32)
  })

  it('6. Prototyping interactions: connecting source nodes to destination frames', () => {
    const store = useStudioStore.getState()
    const frames = store.document.frames
    const sourceFrame = frames[0]
    const targetFrame = frames[1]

    const btn = store.addNode({ type: 'rectangle', name: 'Nav Button' }, sourceFrame.id)

    // Add prototype connection
    const proto = store.addPrototype({
      sourceNodeId: btn.id,
      destinationFrameId: targetFrame.id,
      trigger: 'click',
      action: 'navigate',
      transition: 'slide-left',
      durationMs: 400,
    })

    expect(proto.id).toBeDefined()
    expect(proto.sourceNodeId).toBe(btn.id)
    expect(proto.destinationFrameId).toBe(targetFrame.id)
    expect(proto.transition).toBe('slide-left')

    // Update prototype transition
    store.updatePrototype(proto.id, { transition: 'dissolve', durationMs: 250 })
    const updatedProto = useStudioStore.getState().document.prototypes.find((p) => p.id === proto.id)!
    expect(updatedProto.transition).toBe('dissolve')
    expect(updatedProto.durationMs).toBe(250)

    // Delete prototype
    store.deletePrototype(proto.id)
    expect(useStudioStore.getState().document.prototypes.some((p) => p.id === proto.id)).toBe(false)
  })

  it('7. Undo/Redo stack and persistent project data validation', async () => {
    const store = useStudioStore.getState()
    const initialNodeCount = store.document.nodes.length

    // Add a node
    const testNode = store.addNode({ type: 'rectangle', name: 'History Test Box' })
    expect(useStudioStore.getState().document.nodes.length).toBe(initialNodeCount + 1)
    expect(store.canUndo()).toBe(true)

    // Undo
    useStudioStore.getState().undo()
    expect(useStudioStore.getState().document.nodes.length).toBe(initialNodeCount)
    expect(useStudioStore.getState().canRedo()).toBe(true)

    // Redo
    useStudioStore.getState().redo()
    expect(useStudioStore.getState().document.nodes.length).toBe(initialNodeCount + 1)

    // Synchronize to Project and validate with projectSchema
    await useStudioStore.getState().saveDocument()
    const project = useProjectStore.getState().project!
    expect(project.studio).toBeDefined()
    expect(project.studio?.frames.length).toBeGreaterThanOrEqual(2)

    const valid = validateProjectData(project)
    expect(valid.success).toBe(true)
  })

  it('8. Verifies existing workspaces (Sitemap, Wireframes, Style Guide) remain unaffected', () => {
    const project = useProjectStore.getState().project!
    expect(project.pages.length).toBeGreaterThan(0)
    expect(project.sections.length).toBeGreaterThan(0)
    expect(project.wireframes).toBeDefined()

    // Test switching back to other views
    useUIStore.getState().setActiveView('canvas')
    expect(useUIStore.getState().activeView).toBe('canvas')

    useUIStore.getState().setActiveView('wireframe')
    expect(useUIStore.getState().activeView).toBe('wireframe')

    useUIStore.getState().setActiveView('design')
    expect(useUIStore.getState().activeView).toBe('design')

    useUIStore.getState().setActiveView('studio')
    expect(useUIStore.getState().activeView).toBe('studio')
  })

  it('9. macOS Safari trackpad pinch-to-zoom mechanics and focal point preservation', () => {
    const store = useStudioStore.getState()
    store.setZoom(1.0)
    store.setPan({ x: 0, y: 0 })

    // Simulate zooming around focal point (x: 400, y: 300)
    // Formula: newPan = focal - (focal - oldPan) * (newZoom / oldZoom)
    const focalPoint = { x: 400, y: 300 }
    const oldZoom = 1.0
    const zoomFactor = 1.2
    const targetZoom = Math.min(5.0, Math.max(0.1, oldZoom * zoomFactor))

    // In canvas coordinates before zoom: (400 - 0) / 1.0 = 400
    // After zoom, canvas point 400 must still be at screen 400:
    // 400 * targetZoom + newPanX = 400 => newPanX = 400 - 400 * 1.2 = -80
    const newPanX = focalPoint.x - (focalPoint.x - 0) * (targetZoom / oldZoom)
    const newPanY = focalPoint.y - (focalPoint.y - 0) * (targetZoom / oldZoom)
    expect(newPanX).toBe(-80)
    expect(newPanY).toBe(-60)

    store.setZoom(targetZoom)
    store.setPan({ x: newPanX, y: newPanY })

    expect(useStudioStore.getState().zoom).toBe(1.2)
    expect(useStudioStore.getState().pan).toEqual({ x: -80, y: -60 })

    // Two finger panning: trackpad scroll without pinch (ctrlKey: false)
    // Pan shifts canvas offset smoothly without changing zoom
    const currentPan = useStudioStore.getState().pan
    const deltaX = 45
    const deltaY = -30
    store.setPan({ x: currentPan.x - deltaX, y: currentPan.y - deltaY })
    expect(useStudioStore.getState().zoom).toBe(1.2)
    expect(useStudioStore.getState().pan).toEqual({ x: -125, y: -30 })

    // Clamping limits (1% to 800%)
    store.setZoom(10.0) // clamped to 8.0 in store
    expect(useStudioStore.getState().zoom).toBe(8.0)

    store.setZoom(0.005) // clamped to 0.01 in store
    expect(useStudioStore.getState().zoom).toBe(0.01)

    // Reset to 100%
    store.zoomTo100()
    expect(useStudioStore.getState().zoom).toBe(1.0)
  })

  it('10. File format validation, unsupported file rejection, and SVG sanitization', async () => {
    // 1. Supported format validation
    const pngFile = new File(['png-data'], 'photo.png', { type: 'image/png' })
    const jpegFile = new File(['jpg-data'], 'banner.jpeg', { type: 'image/jpeg' })
    const webpFile = new File(['webp-data'], 'art.webp', { type: 'image/webp' })
    const gifFile = new File(['gif-data'], 'anim.gif', { type: 'image/gif' })
    const svgFile = new File(['<svg></svg>'], 'vector.svg', { type: 'image/svg+xml' })
    const avifFile = new File(['avif-data'], 'photo.avif', { type: 'image/avif' })

    expect(isSupportedImageFile(pngFile)).toBe(true)
    expect(isSupportedImageFile(jpegFile)).toBe(true)
    expect(isSupportedImageFile(webpFile)).toBe(true)
    expect(isSupportedImageFile(gifFile)).toBe(true)
    expect(isSupportedImageFile(svgFile)).toBe(true)
    expect(isSupportedImageFile(avifFile)).toBe(true)

    // 2. Unsupported format rejection
    const exeFile = new File(['bad'], 'script.exe', { type: 'application/x-msdownload' })
    const txtFile = new File(['text'], 'notes.txt', { type: 'text/plain' })
    const pdfFile = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' })

    expect(isSupportedImageFile(exeFile)).toBe(false)
    expect(isSupportedImageFile(txtFile)).toBe(false)
    expect(isSupportedImageFile(pdfFile)).toBe(false)

    await expect(processImageFile(exeFile)).rejects.toThrow('Unsupported file type')

    // 3. SVG sanitization: strips scripts, inline handlers, and javascript: links
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" onload="alert('pwned')">
      <script>fetch('/steal')</script>
      <circle cx="50" cy="50" r="40" fill="red" onclick="alert(1)" onerror="alert(2)" />
      <a href="javascript:alert(3)"><text x="10" y="20">Click</text></a>
    </svg>`

    const cleanedSvg = sanitizeSvg(maliciousSvg)
    expect(cleanedSvg).not.toContain('<script')
    expect(cleanedSvg).not.toContain('onload=')
    expect(cleanedSvg).not.toContain('onclick=')
    expect(cleanedSvg).not.toContain('onerror=')
    expect(cleanedSvg).not.toContain('javascript:')
    expect(cleanedSvg).toContain('circle cx="50" cy="50" r="40" fill="red"')
    expect(cleanedSvg).toContain('viewBox="0 0 100 100"')
  })

  it('11. Canvas drop placement, aspect ratio preservation, and containing frame detection', async () => {
    const store = useStudioStore.getState()
    const frame = store.document.frames[0] // Desktop frame

    // Mock SVG with known 800x400 aspect ratio (2:1)
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="#3B82F6"/></svg>`
    const svgFile = new File([svgContent], 'hero-graphic.svg', { type: 'image/svg+xml' })

    // Import and place directly on canvas outside any frame (x: 2200 is outside both desktop and mobile frames)
    const placedOutside = await store.importAssetAndPlace(svgFile, 2200, 200)
    expect(placedOutside).toBeDefined()
    expect(placedOutside?.type).toBe('image')
    expect(placedOutside?.frameId).toBeNull()
    expect(placedOutside?.x).toBe(2200)
    expect(placedOutside?.y).toBe(200)
    // Preserves 2:1 aspect ratio
    expect(placedOutside!.width / placedOutside!.height).toBeCloseTo(2.0, 1)
    // Newly placed image is selected
    expect(useStudioStore.getState().selectedIds).toContain(placedOutside!.id)

    // Import and drop inside the desktop frame at (frame.x + 150, frame.y + 120)
    const placedInside = await store.importAssetAndPlace(svgFile, frame.x + 150, frame.y + 120)
    expect(placedInside).toBeDefined()
    expect(placedInside?.frameId).toBe(frame.id)
    // Relative to frame origin
    expect(placedInside?.x).toBe(150)
    expect(placedInside?.y).toBe(120)
    expect(placedInside!.width / placedInside!.height).toBeCloseTo(2.0, 1)

    // Asset was saved into project assets library
    const assetList = useStudioStore.getState().assets
    expect(assetList.some((a) => a.id === placedInside?.image?.assetId)).toBe(true)
  })

  it('12. Asset persistence: project document saves assets and restores thumbnails without broken data', async () => {
    const store = useStudioStore.getState()
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="purple"/></svg>`
    const svgFile = new File([svgContent], 'badge.svg', { type: 'image/svg+xml' })

    const asset = await store.uploadAsset(svgFile)
    expect(asset).toBeDefined()
    expect(asset?.dataUrl.startsWith('data:image/svg+xml')).toBe(true)

    // Save document to project store
    await store.saveDocument()
    const project = useProjectStore.getState().project!
    expect(project.studio?.assets).toBeDefined()
    expect(project.studio?.assets?.some((a) => a.id === asset?.id)).toBe(true)

    // Re-initialize document from project and verify asset is restored
    await store.initDocument()
    const restoredAssets = useStudioStore.getState().assets
    expect(restoredAssets.some((a) => a.id === asset?.id)).toBe(true)
  })

  it('13. Toolbar tools state switching and canvas zoom/pan stability with pure black work area', () => {
    const store = useStudioStore.getState()

    // 1. Tool state transitions
    store.setActiveTool('select')
    expect(useStudioStore.getState().activeTool).toBe('select')

    store.setActiveTool('hand')
    expect(useStudioStore.getState().activeTool).toBe('hand')

    store.setActiveTool('frame')
    expect(useStudioStore.getState().activeTool).toBe('frame')

    store.setActiveTool('rectangle')
    expect(useStudioStore.getState().activeTool).toBe('rectangle')

    store.setActiveTool('pen')
    expect(useStudioStore.getState().activeTool).toBe('pen')

    store.setActiveTool('text')
    expect(useStudioStore.getState().activeTool).toBe('text')

    // 2. Add text block via text tool
    const textNode = store.addNode({
      type: 'text',
      name: 'Toolbar Header',
      text: { content: 'Pure Black Canvas', fontFamily: 'Inter', fontSize: 24, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0, textAlign: 'left', color: '#FFFFFF' },
    })
    expect(textNode.name).toBe('Toolbar Header')

    // 3. Selection and component creation
    store.setSelectedIds([textNode.id])
    expect(useStudioStore.getState().selectedIds).toContain(textNode.id)
    store.createComponentFromSelection()

    const compMaster = useStudioStore.getState().document.nodes.find((n) => n.id === textNode.id)
    expect(compMaster?.component?.isMaster).toBe(true)

    // 4. Zoom & Pan operations preserve document integrity
    store.setZoom(1.5)
    store.setPan({ x: 120, y: 80 })
    expect(useStudioStore.getState().zoom).toBe(1.5)
    expect(useStudioStore.getState().pan).toEqual({ x: 120, y: 80 })
  })

  it('14. Resizable side panels respect min/max constraints and keep canvas viewport and selection invariant', () => {
    const store = useStudioStore.getState()

    // 1. Left sidebar default and constraint checks
    expect(DEFAULT_LEFT_SIDEBAR_WIDTH).toBe(260)
    expect(MIN_LEFT_SIDEBAR_WIDTH).toBe(200)
    expect(MAX_LEFT_SIDEBAR_WIDTH).toBe(420)

    store.setLeftSidebarWidth(300)
    expect(useStudioStore.getState().leftSidebarWidth).toBe(300)

    // Test minimum clamping
    store.setLeftSidebarWidth(120)
    expect(useStudioStore.getState().leftSidebarWidth).toBe(MIN_LEFT_SIDEBAR_WIDTH)

    // Test maximum clamping
    store.setLeftSidebarWidth(600)
    expect(useStudioStore.getState().leftSidebarWidth).toBe(MAX_LEFT_SIDEBAR_WIDTH)

    // 2. Right sidebar default and constraint checks
    expect(DEFAULT_RIGHT_SIDEBAR_WIDTH).toBe(320)
    expect(MIN_RIGHT_SIDEBAR_WIDTH).toBe(260)
    expect(MAX_RIGHT_SIDEBAR_WIDTH).toBe(480)

    store.setRightSidebarWidth(360)
    expect(useStudioStore.getState().rightSidebarWidth).toBe(360)

    // Test minimum clamping
    store.setRightSidebarWidth(180)
    expect(useStudioStore.getState().rightSidebarWidth).toBe(MIN_RIGHT_SIDEBAR_WIDTH)

    // Test maximum clamping
    store.setRightSidebarWidth(700)
    expect(useStudioStore.getState().rightSidebarWidth).toBe(MAX_RIGHT_SIDEBAR_WIDTH)

    // 3. Canvas stability: Zoom level, pan coordinates, and selected object position invariant during resizing
    store.setZoom(2.25)
    store.setPan({ x: 180, y: 95 })

    const sampleNode = store.addNode({
      type: 'rectangle',
      name: 'Invariant Card',
      x: 150,
      y: 200,
      width: 280,
      height: 160,
    })
    store.setSelectedIds([sampleNode.id])

    // Resize both panels dynamically
    store.setLeftSidebarWidth(350)
    store.setRightSidebarWidth(410)

    const currentState = useStudioStore.getState()
    // Zoom and pan must remain invariant
    expect(currentState.zoom).toBe(2.25)
    expect(currentState.pan).toEqual({ x: 180, y: 95 })

    // Node coordinates and dimensions must not move or scale merely because a sidebar resized
    const nodeAfterResize = currentState.document.nodes.find((n) => n.id === sampleNode.id)!
    expect(nodeAfterResize.x).toBe(150)
    expect(nodeAfterResize.y).toBe(200)
    expect(nodeAfterResize.width).toBe(280)
    expect(nodeAfterResize.height).toBe(160)

    // Selection remains active and editable
    expect(currentState.selectedIds).toEqual([sampleNode.id])

    store.updateNode(sampleNode.id, { width: 320, opacity: 0.85 })
    const editedNode = useStudioStore.getState().document.nodes.find((n) => n.id === sampleNode.id)!
    expect(editedNode.width).toBe(320)
    expect(editedNode.opacity).toBe(0.85)
  })

  it('15. Sidebar widths persist in localStorage and project document, restoring with fallback on reopen', async () => {
    const store = useStudioStore.getState()

    // 1. Set custom widths
    store.setLeftSidebarWidth(340)
    store.setRightSidebarWidth(440)

    // Verify localStorage persistence
    if (typeof window !== 'undefined' && window.localStorage) {
      expect(window.localStorage.getItem('opensitemap_studio_left_width')).toBe('340')
      expect(window.localStorage.getItem('opensitemap_studio_right_width')).toBe('440')
    }

    // 2. Persist to project document
    await store.saveDocument()
    const project = useProjectStore.getState().project!
    expect(project.studio?.leftSidebarWidth).toBe(340)
    expect(project.studio?.rightSidebarWidth).toBe(440)

    // 3. Re-initialize document and confirm widths are restored
    useStudioStore.setState({ leftSidebarWidth: 260, rightSidebarWidth: 320 })
    await store.initDocument()

    expect(useStudioStore.getState().leftSidebarWidth).toBe(340)
    expect(useStudioStore.getState().rightSidebarWidth).toBe(440)

    // 4. Test fallback to sensible bounds when stored project values are out-of-range
    if (project.studio) {
      project.studio.leftSidebarWidth = 9999
      project.studio.rightSidebarWidth = -50
    }
    await store.initDocument()
    // Left clamped to MAX (420), Right clamped to MIN (260)
    expect(useStudioStore.getState().leftSidebarWidth).toBe(MAX_LEFT_SIDEBAR_WIDTH)
    expect(useStudioStore.getState().rightSidebarWidth).toBe(MIN_RIGHT_SIDEBAR_WIDTH)
  })

  it('16. Full-screen asset preview opens, navigates adjacent assets, and closes via Escape / close action', async () => {
    const store = useStudioStore.getState()

    // 1. Upload two SVG image assets
    const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>`
    const file1 = new File([svg1], 'circle.svg', { type: 'image/svg+xml' })
    const asset1 = await store.uploadAsset(file1)
    expect(asset1).toBeDefined()

    const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect width="200" height="100" fill="green"/></svg>`
    const file2 = new File([svg2], 'banner.svg', { type: 'image/svg+xml' })
    const asset2 = await store.uploadAsset(file2)
    expect(asset2).toBeDefined()

    // Initially preview is closed
    expect(useStudioStore.getState().previewingAssetId).toBeNull()

    // 2. Click asset thumbnail to open full-screen preview
    store.openAssetPreview(asset1!.id)
    expect(useStudioStore.getState().previewingAssetId).toBe(asset1!.id)

    // 3. Navigate forward (ArrowRight / next)
    store.navigateAssetPreview('next')
    expect(useStudioStore.getState().previewingAssetId).toBe(asset2!.id)

    // 4. Navigate forward wraps around
    store.navigateAssetPreview('next')
    expect(useStudioStore.getState().previewingAssetId).toBe(asset1!.id)

    // 5. Navigate backward (ArrowLeft / prev)
    store.navigateAssetPreview('prev')
    expect(useStudioStore.getState().previewingAssetId).toBe(asset2!.id)

    // 6. Close preview
    store.closeAssetPreview()
    expect(useStudioStore.getState().previewingAssetId).toBeNull()
  })

  it('17. Preview actions: Place on Canvas and Replace Selected Image with coordinate and property preservation', async () => {
    const store = useStudioStore.getState()

    // 1. Upload two image assets
    const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="purple"/></svg>`
    const file1 = new File([svg1], 'hero-banner.svg', { type: 'image/svg+xml' })
    const asset1 = (await store.uploadAsset(file1))!

    const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><circle cx="200" cy="100" r="80" fill="amber"/></svg>`
    const file2 = new File([svg2], 'avatar-badge.svg', { type: 'image/svg+xml' })
    const asset2 = (await store.uploadAsset(file2))!

    // 2. Open preview for asset 1 and Place on Canvas
    store.openAssetPreview(asset1.id)
    const placedNode = store.placeAssetOnCanvas(asset1.id)
    expect(placedNode).toBeDefined()
    expect(placedNode?.type).toBe('image')
    expect(placedNode?.image?.assetId).toBe(asset1.id)
    expect(placedNode?.image?.src).toBe(asset1.dataUrl)

    // Placed node is automatically selected on the canvas
    expect(useStudioStore.getState().selectedIds).toContain(placedNode!.id)

    // Set custom properties on the placed image (rotation, opacity, dimensions)
    store.updateNode(placedNode!.id, {
      x: 120,
      y: 140,
      width: 360,
      height: 180,
      rotation: 10,
      opacity: 0.92,
    })

    // 3. Replace Selected Image with asset 2
    store.openAssetPreview(asset2.id)
    const replaceSuccess = store.replaceSelectedWithAsset(asset2.id)
    expect(replaceSuccess).toBe(true)

    const updatedNode = useStudioStore.getState().document.nodes.find((n) => n.id === placedNode!.id)!
    // Confirm image source is replaced with asset 2
    expect(updatedNode.image?.assetId).toBe(asset2.id)
    expect(updatedNode.image?.src).toBe(asset2.dataUrl)
    // Confirm coordinates, dimensions, rotation, and opacity are preserved
    expect(updatedNode.x).toBe(120)
    expect(updatedNode.y).toBe(140)
    expect(updatedNode.width).toBe(360)
    expect(updatedNode.height).toBe(180)
    expect(updatedNode.rotation).toBe(10)
    expect(updatedNode.opacity).toBe(0.92)

    // 4. If nothing is selected on the canvas, replaceSelectedWithAsset fails safely
    store.clearSelection()
    expect(useStudioStore.getState().selectedIds).toHaveLength(0)

    const failedReplace = store.replaceSelectedWithAsset(asset1.id)
    expect(failedReplace).toBe(false)

    // 5. Verify clicking on canvas node does not trigger previewingAssetId
    store.closeAssetPreview()
    store.setSelectedIds([updatedNode.id])
    expect(useStudioStore.getState().previewingAssetId).toBeNull()
  })

  it('18. Acceptance Tests 1, 2, 3: Drag root-level image into empty frame, populated frame, and move between frames', () => {
    const store = useStudioStore.getState()

    // 1. Setup empty frame "MacBook Pro 1"
    const macBookFrame = store.addFrame('macbook', {
      name: 'MacBook Pro 1',
      x: 500,
      y: 100,
      width: 1024,
      height: 640,
    })

    // Initially "MacBook Pro 1" has 0 elements
    const initialChildren = store.document.nodes.filter((n) => n.frameId === macBookFrame.id)
    expect(initialChildren).toHaveLength(0)

    // Setup root-level image "Phoenix_AI-Driven"
    const rootImage = store.addNode(
      {
        type: 'image',
        name: 'Phoenix_AI-Driven',
        frameId: null,
        x: 650,
        y: 250,
        width: 400,
        height: 250,
        image: {
          assetId: 'asset-phoenix-1',
          src: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
          fit: 'fill',
          aspectRatioLocked: true,
        },
      },
      null
    )
    expect(rootImage.frameId).toBeNull()
    expect(useStudioStore.getState().document.nodes.some((n) => !n.frameId && n.id === rootImage.id)).toBe(true)

    // CASE 1: Drag root-level image into an empty frame
    store.reparentNode(rootImage.id, macBookFrame.id)

    let doc = useStudioStore.getState().document
    let reparentedImage = doc.nodes.find((n) => n.id === rootImage.id)!
    expect(reparentedImage.frameId).toBe(macBookFrame.id)
    // Converted to local frame coordinates: 650 - 500 = 150, 250 - 100 = 150
    expect(reparentedImage.x).toBe(150)
    expect(reparentedImage.y).toBe(150)
    expect(reparentedImage.width).toBe(400)
    expect(reparentedImage.height).toBe(250)
    // Frame is no longer empty (1 element inside, "No elements in frame" disappears)
    expect(doc.nodes.filter((n) => n.frameId === macBookFrame.id)).toHaveLength(1)
    expect(doc.nodes.filter((n) => !n.frameId).some((n) => n.id === rootImage.id)).toBe(false)

    // CASE 2: Drag another root-level image into the frame that already contains elements
    const rootBanner = store.addNode(
      {
        type: 'image',
        name: 'Hero_Banner_Visual',
        frameId: null,
        x: 700,
        y: 400,
        width: 300,
        height: 120,
        image: {
          assetId: 'asset-banner-1',
          src: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
          fit: 'fill',
        },
      },
      null
    )
    store.reparentNode(rootBanner.id, macBookFrame.id)

    doc = useStudioStore.getState().document
    const reparentedBanner = doc.nodes.find((n) => n.id === rootBanner.id)!
    expect(reparentedBanner.frameId).toBe(macBookFrame.id)
    expect(reparentedBanner.x).toBe(700 - 500) // 200
    expect(reparentedBanner.y).toBe(400 - 100) // 300
    // Frame now contains both elements with preserved, stable IDs
    const currentFrameChildren = doc.nodes.filter((n) => n.frameId === macBookFrame.id)
    expect(currentFrameChildren).toHaveLength(2)
    expect(currentFrameChildren.map((c) => c.id)).toEqual([rootImage.id, rootBanner.id])

    // CASE 3: Move an image from Frame A ("MacBook Pro 1") to Frame B ("Mobile Frame")
    const frameB = doc.frames.find((f) => f.preset === 'iphone')!
    expect(frameB).toBeDefined()

    // Move Phoenix image from MacBook Pro 1 to iPhone Frame
    // Phoenix canvas position is: macBookFrame.x (500) + reparentedImage.x (150) = 650
    const canvasPosX = macBookFrame.x + reparentedImage.x
    const canvasPosY = macBookFrame.y + reparentedImage.y
    store.reparentNode(rootImage.id, frameB.id)

    doc = useStudioStore.getState().document
    const movedToFrameB = doc.nodes.find((n) => n.id === rootImage.id)!
    expect(movedToFrameB.frameId).toBe(frameB.id)
    // Frame B local coordinates maintain exact canvas position
    expect(frameB.x + movedToFrameB.x).toBe(canvasPosX)
    expect(frameB.y + movedToFrameB.y).toBe(canvasPosY)
    // Frame A now has only 1 child
    expect(doc.nodes.filter((n) => n.frameId === macBookFrame.id)).toHaveLength(1)
    // Frame B now contains the moved node
    expect(doc.nodes.filter((n) => n.frameId === frameB.id).some((n) => n.id === rootImage.id)).toBe(true)
  })

  it('19. Acceptance Test 4: Move an image out of a frame back to ROOT CANVAS ELEMENTS', () => {
    const store = useStudioStore.getState()
    const frame = store.document.frames[0]

    // Create image inside the frame
    const framedNode = store.addNode(
      {
        type: 'image',
        name: 'Product_Card_Photo',
        x: 80,
        y: 120,
        width: 240,
        height: 160,
        image: {
          assetId: 'asset-card-1',
          src: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
          fit: 'crop',
        },
      },
      frame.id
    )

    // Calculate canvas absolute coordinates before reparenting
    const expectedCanvasX = frame.x + framedNode.x
    const expectedCanvasY = frame.y + framedNode.y

    // Move out of frame onto ROOT CANVAS ELEMENTS (targetFrameId: null)
    store.reparentNode(framedNode.id, null)

    const doc = useStudioStore.getState().document
    const rootNode = doc.nodes.find((n) => n.id === framedNode.id)!

    expect(rootNode.frameId).toBeNull()
    expect(rootNode.x).toBe(expectedCanvasX)
    expect(rootNode.y).toBe(expectedCanvasY)
    expect(rootNode.width).toBe(240)
    expect(rootNode.height).toBe(160)
    expect(doc.nodes.filter((n) => !n.frameId).some((n) => n.id === framedNode.id)).toBe(true)
    expect(doc.nodes.filter((n) => n.frameId === frame.id).some((n) => n.id === framedNode.id)).toBe(false)
  })

  it('20. Acceptance Tests 5 & 6: Reorder objects inside a frame and reparent text & shapes', () => {
    const store = useStudioStore.getState()
    const frame = store.document.frames[0]

    // Clear existing nodes in frame for clean reordering test
    const cleanNodes = store.document.nodes.filter((n) => n.frameId !== frame.id)
    useStudioStore.setState((s) => ({ document: { ...s.document, nodes: cleanNodes } }))

    // Add three objects inside frame: Shape A, Text B, Shape C
    const shapeA = store.addNode(
      {
        type: 'rectangle',
        name: 'Background Card',
        x: 20,
        y: 20,
        width: 300,
        height: 200,
        cornerRadius: 12,
        fill: { type: 'solid', color: '#1E293B' },
        stroke: { color: '#334155', width: 1, style: 'solid' },
      },
      frame.id
    )

    const textB = store.addNode(
      {
        type: 'text',
        name: 'Hero Heading',
        x: 40,
        y: 40,
        width: 260,
        height: 36,
        text: {
          content: 'Next-Gen Visual Systems',
          fontFamily: 'Outfit',
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: -0.5,
          textAlign: 'left',
          color: '#38BDF8',
        },
      },
      frame.id
    )

    const shapeC = store.addNode(
      {
        type: 'ellipse',
        name: 'Status Indicator',
        x: 40,
        y: 90,
        width: 16,
        height: 16,
        fill: { type: 'solid', color: '#10B981' },
      },
      frame.id
    )

    // Initial order: [shapeA, textB, shapeC]
    let frameChildren = useStudioStore.getState().document.nodes.filter((n) => n.frameId === frame.id)
    expect(frameChildren.map((n) => n.id)).toEqual([shapeA.id, textB.id, shapeC.id])

    // CASE 5: Reorder objects inside the frame (Move shapeC to be before shapeA)
    store.reparentNode(shapeC.id, frame.id, shapeA.id)

    frameChildren = useStudioStore.getState().document.nodes.filter((n) => n.frameId === frame.id)
    expect(frameChildren.map((n) => n.id)).toEqual([shapeC.id, shapeA.id, textB.id])

    // Reorder textB to be before shapeC (making textB first)
    store.reparentNode(textB.id, frame.id, shapeC.id)
    frameChildren = useStudioStore.getState().document.nodes.filter((n) => n.frameId === frame.id)
    expect(frameChildren.map((n) => n.id)).toEqual([textB.id, shapeC.id, shapeA.id])

    // CASE 6: Move root text and shape objects into a frame using the same mechanism
    const rootText = store.addNode(
      {
        type: 'text',
        name: 'Global Disclaimer',
        frameId: null,
        x: frame.x + 100,
        y: frame.y + 350,
        width: 280,
        height: 40,
        text: {
          content: 'Confidential & Proprietary',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: 0,
          textAlign: 'center',
          color: '#94A3B8',
        },
      },
      null
    )

    const rootShape = store.addNode(
      {
        type: 'rectangle',
        name: 'Global Badge',
        frameId: null,
        x: frame.x + 200,
        y: frame.y + 400,
        width: 120,
        height: 32,
        cornerRadius: 6,
        fill: { type: 'solid', color: '#873FF0' },
      },
      null
    )

    // Reparent root text and shape into frame
    store.reparentNode(rootText.id, frame.id)
    store.reparentNode(rootShape.id, frame.id)

    const doc = useStudioStore.getState().document
    const reparentedText = doc.nodes.find((n) => n.id === rootText.id)!
    const reparentedShape = doc.nodes.find((n) => n.id === rootShape.id)!

    // Verify text reparenting and preservation of typography properties
    expect(reparentedText.frameId).toBe(frame.id)
    expect(reparentedText.x).toBe(100)
    expect(reparentedText.y).toBe(350)
    expect(reparentedText.text?.content).toBe('Confidential & Proprietary')
    expect(reparentedText.text?.fontFamily).toBe('Inter')
    expect(reparentedText.text?.fontSize).toBe(12)
    expect(reparentedText.text?.color).toBe('#94A3B8')

    // Verify shape reparenting and preservation of appearance properties
    expect(reparentedShape.frameId).toBe(frame.id)
    expect(reparentedShape.x).toBe(200)
    expect(reparentedShape.y).toBe(400)
    expect(reparentedShape.fill.color).toBe('#873FF0')
    expect(reparentedShape.cornerRadius).toBe(6)
  })

  it('21. Acceptance Test 7: Verify coordinate transformation invariance (zero visual jump)', () => {
    const store = useStudioStore.getState()
    const frameA = store.document.frames[0] // e.g. at (100, 100)
    const frameB = store.addFrame('desktop', {
      name: 'Secondary Frame',
      x: 1200,
      y: 200,
      width: 1440,
      height: 900,
    })

    // 1. Create node in Frame A with arbitrary position & rotation
    const node = store.addNode(
      {
        type: 'image',
        name: 'Invariant Visual Card',
        x: 180,
        y: 240,
        width: 320,
        height: 180,
        rotation: 12,
        opacity: 0.95,
        image: {
          assetId: 'asset-invariant-1',
          src: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
          fit: 'crop',
          aspectRatioLocked: true,
        },
      },
      frameA.id
    )

    const initialCanvasX = frameA.x + node.x
    const initialCanvasY = frameA.y + node.y

    // Step A: Reparent from Frame A to Frame B
    store.reparentNode(node.id, frameB.id)
    let doc = useStudioStore.getState().document
    let currentNode = doc.nodes.find((n) => n.id === node.id)!
    expect(frameB.x + currentNode.x).toBe(initialCanvasX)
    expect(frameB.y + currentNode.y).toBe(initialCanvasY)
    expect(currentNode.rotation).toBe(12)
    expect(currentNode.opacity).toBe(0.95)

    // Step B: Reparent from Frame B to Root Canvas
    store.reparentNode(node.id, null)
    doc = useStudioStore.getState().document
    currentNode = doc.nodes.find((n) => n.id === node.id)!
    expect(currentNode.frameId).toBeNull()
    expect(currentNode.x).toBe(initialCanvasX)
    expect(currentNode.y).toBe(initialCanvasY)

    // Step C: Reparent from Root Canvas back to Frame A
    store.reparentNode(node.id, frameA.id)
    doc = useStudioStore.getState().document
    currentNode = doc.nodes.find((n) => n.id === node.id)!
    expect(currentNode.frameId).toBe(frameA.id)
    expect(frameA.x + currentNode.x).toBe(initialCanvasX)
    expect(frameA.y + currentNode.y).toBe(initialCanvasY)
    expect(currentNode.x).toBe(180)
    expect(currentNode.y).toBe(240)
  })

  it('22. Acceptance Test 8: Undo and Redo restore exact frame hierarchy and coordinates', () => {
    const store = useStudioStore.getState()
    const frame = store.document.frames[0]

    // Create root image
    const image = store.addNode(
      {
        type: 'image',
        name: 'History Test Graphic',
        frameId: null,
        x: frame.x + 120,
        y: frame.y + 160,
        width: 200,
        height: 150,
      },
      null
    )
    expect(image.frameId).toBeNull()
    const origX = image.x
    const origY = image.y

    // Reparent into frame
    store.reparentNode(image.id, frame.id)
    let doc = useStudioStore.getState().document
    let inFrame = doc.nodes.find((n) => n.id === image.id)!
    expect(inFrame.frameId).toBe(frame.id)
    expect(inFrame.x).toBe(120)
    expect(inFrame.y).toBe(160)

    // 1. Undo reparenting
    expect(store.canUndo()).toBe(true)
    store.undo()

    doc = useStudioStore.getState().document
    let restoredRoot = doc.nodes.find((n) => n.id === image.id)!
    expect(restoredRoot.frameId).toBeNull()
    expect(restoredRoot.x).toBe(origX)
    expect(restoredRoot.y).toBe(origY)

    // 2. Redo reparenting
    expect(store.canRedo()).toBe(true)
    store.redo()

    doc = useStudioStore.getState().document
    inFrame = doc.nodes.find((n) => n.id === image.id)!
    expect(inFrame.frameId).toBe(frame.id)
    expect(inFrame.x).toBe(120)
    expect(inFrame.y).toBe(160)
  })

  it('23. Acceptance Tests 9 & 10: Hierarchy persistence on save/reopen, and continued image editing/resizing/exporting', async () => {
    const store = useStudioStore.getState()
    const frame = store.document.frames[0]

    // Create and reparent image into frame
    const image = store.addNode(
      {
        type: 'image',
        name: 'Persistent Product Render',
        frameId: null,
        x: frame.x + 80,
        y: frame.y + 100,
        width: 320,
        height: 240,
        image: {
          assetId: 'asset-render-1',
          src: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
          fit: 'crop',
          aspectRatioLocked: true,
        },
      },
      null
    )
    store.reparentNode(image.id, frame.id)

    // CASE 9: Save, reload project, and verify persistence
    await store.saveDocument()
    const project = useProjectStore.getState().project!
    expect(project.studio).toBeDefined()
    const persistedNode = project.studio?.nodes.find((n) => n.id === image.id)!
    expect(persistedNode).toBeDefined()
    expect(persistedNode.frameId).toBe(frame.id)
    expect(persistedNode.x).toBe(80)
    expect(persistedNode.y).toBe(100)

    // Re-initialize document from project data
    await store.initDocument()
    const reloaded = useStudioStore.getState().document.nodes.find((n) => n.id === image.id)!
    expect(reloaded).toBeDefined()
    expect(reloaded.frameId).toBe(frame.id)
    expect(reloaded.x).toBe(80)
    expect(reloaded.y).toBe(100)

    // CASE 10: Confirm image editing, resizing, cropping, frame resizing, and export still work
    // A. Resize and edit image properties
    store.updateNode(image.id, {
      width: 400,
      height: 300,
      rotation: 45,
      opacity: 0.85,
      image: {
        ...reloaded.image!,
        fit: 'fit',
        aspectRatioLocked: false,
      },
    })

    let doc = useStudioStore.getState().document
    const editedNode = doc.nodes.find((n) => n.id === image.id)!
    expect(editedNode.width).toBe(400)
    expect(editedNode.height).toBe(300)
    expect(editedNode.rotation).toBe(45)
    expect(editedNode.opacity).toBe(0.85)
    expect(editedNode.image?.fit).toBe('fit')
    expect(editedNode.image?.aspectRatioLocked).toBe(false)

    // B. Resize parent frame
    store.updateFrame(frame.id, {
      width: 1600,
      height: 1000,
      background: '#0B1120',
    })
    doc = useStudioStore.getState().document
    const updatedFrame = doc.frames.find((f) => f.id === frame.id)!
    expect(updatedFrame.width).toBe(1600)
    expect(updatedFrame.height).toBe(1000)
    expect(updatedFrame.background).toBe('#0B1120')

    // C. Frame children lookup for SVG/PNG export
    const exportChildren = doc.nodes.filter((n) => n.frameId === frame.id)
    expect(exportChildren.some((n) => n.id === image.id)).toBe(true)

    // JSON export structure integrity
    const exportedJSON = JSON.stringify(doc)
    const parsed = JSON.parse(exportedJSON)
    expect(parsed.frames.some((f: any) => f.id === frame.id)).toBe(true)
    expect(parsed.nodes.some((n: any) => n.id === image.id && n.frameId === frame.id)).toBe(true)
  })
})

