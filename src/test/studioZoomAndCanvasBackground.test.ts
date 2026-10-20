import { describe, it, expect, beforeEach } from 'vitest'
import { useStudioStore } from '../store/useStudioStore'
import { CANVAS_BG_PRESETS } from '../components/studio/CanvasBackgroundSection'
import fs from 'fs'
import path from 'path'

// Ensure localStorage and window are available in test environment
const storageMock: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => (key in storageMock ? storageMock[key] : null),
  setItem: (key: string, val: string) => { storageMock[key] = String(val) },
  removeItem: (key: string) => { delete storageMock[key] },
  clear: () => { Object.keys(storageMock).forEach((k) => delete storageMock[k]) },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).localStorage = mockLocalStorage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).window = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...((globalThis as any).window || {}),
  localStorage: mockLocalStorage,
  innerWidth: 1440,
  innerHeight: 900,
}

describe('OpenSitemap Studio: Extended Zoom-Out & Canvas Background Color Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    useStudioStore.getState().initDocument()
  })

  describe('1. Extended Zoom Range (1% to 800%) and Zoom Controls', () => {
    it('1.1 Supports minimum zoom down to 1% (0.01) and maximum zoom up to 800% (8.0)', () => {
      const store = useStudioStore.getState()

      // Clamp lower bound
      store.setZoom(0.001)
      expect(useStudioStore.getState().zoom).toBe(0.01) // 1%

      // Clamp upper bound
      store.setZoom(10.0)
      expect(useStudioStore.getState().zoom).toBe(8.0) // 800%

      // Exact 1%
      store.setZoom(0.01)
      expect(useStudioStore.getState().zoom).toBe(0.01)

      // Exact 800%
      store.setZoom(8.0)
      expect(useStudioStore.getState().zoom).toBe(8.0)
    })

    it('1.2 Stepwise zoom out through acceptance levels: 21% -> 10% -> 5% -> 2% -> 1%', () => {
      const store = useStudioStore.getState()

      // Set to 21%
      store.setZoom(0.21)
      expect(useStudioStore.getState().zoom).toBe(0.21)

      // Presets at 10%, 5%, 2%, 1%
      store.setZoom(0.10)
      expect(useStudioStore.getState().zoom).toBe(0.10)

      store.setZoom(0.05)
      expect(useStudioStore.getState().zoom).toBe(0.05)

      store.setZoom(0.02)
      expect(useStudioStore.getState().zoom).toBe(0.02)

      store.setZoom(0.01)
      expect(useStudioStore.getState().zoom).toBe(0.01)

      // Stepwise zoom in back up without dropping below 1%
      store.zoomIn()
      expect(useStudioStore.getState().zoom).toBeGreaterThan(0.01)
    })

    it('1.3 Focal point zooming preserves viewport center during zoom operations', () => {
      const store = useStudioStore.getState()
      store.setZoom(1.0)
      store.setPan({ x: 100, y: 100 })

      const focalPoint = { x: 500, y: 400 }
      store.setZoom(2.0, focalPoint)

      const state = useStudioStore.getState()
      expect(state.zoom).toBe(2.0)
      // Screen point under mouse remains stable:
      // scale = 2.0 / 1.0 = 2.0
      // newPanX = 500 - (500 - 100) * 2.0 = 500 - 800 = -300
      expect(state.pan.x).toBe(-300)
      // newPanY = 400 - (400 - 100) * 2.0 = 400 - 600 = -200
      expect(state.pan.y).toBe(-200)
    })

    it('1.4 Fit All automatically zooms out to encompass all frames and canvas objects', () => {
      const store = useStudioStore.getState()

      // Call fitAll with defined viewport
      store.fitAll(1200, 800)
      const afterFitAll = useStudioStore.getState()

      expect(afterFitAll.zoom).toBeGreaterThanOrEqual(0.01)
      expect(afterFitAll.zoom).toBeLessThanOrEqual(2.0)
      expect(typeof afterFitAll.pan.x).toBe('number')
      expect(typeof afterFitAll.pan.y).toBe('number')
    })

    it('1.5 Fit Selection zooms directly to the selected element or frame', () => {
      const store = useStudioStore.getState()
      const firstFrame = store.document.frames[0]
      expect(firstFrame).toBeDefined()

      store.setSelectedIds([firstFrame.id])
      store.fitSelection(1200, 800)

      const afterFitSelection = useStudioStore.getState()
      expect(afterFitSelection.zoom).toBeGreaterThanOrEqual(0.01)
      expect(afterFitSelection.zoom).toBeLessThanOrEqual(4.0)

      // Fit Frame
      store.fitFrame(firstFrame.id, 1200, 800)
      const afterFitFrame = useStudioStore.getState()
      expect(afterFitFrame.zoom).toBeGreaterThanOrEqual(0.01)
    })
  })

  describe('2. Canvas Background Color Picker and Settings', () => {
    it('2.1 Default canvas background is pure black #000000', () => {
      const store = useStudioStore.getState()
      expect(store.canvasBackground).toBe('#000000')
    })

    it('2.2 Canvas background updates immediately and independently of object fills', () => {
      const store = useStudioStore.getState()
      const firstFrame = store.document.frames[0]
      const initialFrameBg = firstFrame.background

      // Update canvas background
      store.setCanvasBackground('#181818')
      expect(useStudioStore.getState().canvasBackground).toBe('#181818')

      // Frame background and object fills remain unchanged
      const currentFrame = useStudioStore.getState().document.frames.find((f) => f.id === firstFrame.id)
      expect(currentFrame?.background).toBe(initialFrameBg)
    })

    it('2.3 Preset swatches are configured correctly with black, charcoal, dark grey, light grey, white, and transparent', () => {
      expect(CANVAS_BG_PRESETS).toHaveLength(6)

      const values = CANVAS_BG_PRESETS.map((p) => p.value)
      expect(values).toContain('#000000') // black
      expect(values).toContain('#181818') // charcoal
      expect(values).toContain('#2B2B2B') // dark grey
      expect(values).toContain('#E5E5E5') // light grey
      expect(values).toContain('#FFFFFF') // white
      expect(values).toContain('transparent') // checkerboard transparency

      // Test selecting each preset
      CANVAS_BG_PRESETS.forEach((preset) => {
        useStudioStore.getState().setCanvasBackground(preset.value)
        expect(useStudioStore.getState().canvasBackground).toBe(preset.value)
      })
    })

    it('2.4 Reset option restores pure black #000000 canvas background', () => {
      const store = useStudioStore.getState()

      store.setCanvasBackground('#FFFFFF')
      expect(useStudioStore.getState().canvasBackground).toBe('#FFFFFF')

      store.resetCanvasBackground()
      expect(useStudioStore.getState().canvasBackground).toBe('#000000')
    })

    it('2.5 Canvas background persists to localStorage and document model', () => {
      const store = useStudioStore.getState()
      store.setCanvasBackground('#2B2B2B')

      // Verify in document model
      expect(useStudioStore.getState().document.canvasBackground).toBe('#2B2B2B')

      // Verify in localStorage
      const savedPref = globalThis.localStorage.getItem('opensitemap_studio_canvas_bg')
      expect(savedPref).toBe('#2B2B2B')
    })

    it('2.6 Canvas background is NOT included in export designs', () => {
      const exportModalPath = path.resolve(__dirname, '../components/studio/StudioExportModal.tsx')
      const content = fs.readFileSync(exportModalPath, 'utf-8')

      // Export modal exports only frame backgrounds and nodes, not workspace canvasBackground
      expect(content).not.toContain('fill="${document.canvasBackground')
      expect(content).toContain('fill="${frame.background || \'#0F172A\'}"')
    })
  })

  describe('3. UI Integration & Accessibility Checks', () => {
    it('3.1 Verifies StudioTopBar contains editable zoom input and presets dropdown', () => {
      const topBarPath = path.resolve(__dirname, '../components/studio/StudioTopBar.tsx')
      const content = fs.readFileSync(topBarPath, 'utf-8')

      expect(content).toContain('studio-zoom-input')
      expect(content).toContain('studio-zoom-dropdown-btn')
      expect(content).toContain('studio-zoom-menu')
      expect(content).toContain('Fit All')
      expect(content).toContain('Fit Selection')
      expect(content).toContain('Fit Frame')
      expect(content).toContain('800%')
      expect(content).toContain('1%')
    })

    it('3.2 Verifies StudioRightSidebar includes CanvasBackgroundSection in Design tab', () => {
      const rightSidebarPath = path.resolve(__dirname, '../components/studio/StudioRightSidebar.tsx')
      const content = fs.readFileSync(rightSidebarPath, 'utf-8')

      expect(content).toContain('CanvasBackgroundSection')
      expect(content).toContain('Canvas Settings')
      expect(content).toContain('Document Overview')
    })

    it('3.3 Verifies StudioCanvas applies contrast-aware dotted grid and background styles', () => {
      const canvasPath = path.resolve(__dirname, '../components/studio/StudioCanvas.tsx')
      const content = fs.readFileSync(canvasPath, 'utf-8')

      expect(content).toContain('canvasBackground')
      expect(content).toContain('isTransparent')
      expect(content).toContain('dotColor')
      expect(content).toContain('studio-canvas-container')
    })
  })
})
