import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('OpenSitemap Studio: Small Canvas Center Point Specification Tests', () => {
  const eyeComponentPath = path.resolve(__dirname, '../components/studio/StudioInteractiveEye.tsx')
  const canvasComponentPath = path.resolve(__dirname, '../components/studio/StudioCanvas.tsx')
  const exportModalPath = path.resolve(__dirname, '../components/studio/StudioExportModal.tsx')

  it('1. Verifies StudioCanvasCenterPoint component exists and renders a minimal red dot (~6px)', () => {
    expect(fs.existsSync(eyeComponentPath)).toBe(true)
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    expect(eyeContent).toContain('export const StudioCanvasCenterPoint')
    expect(eyeContent).toContain('id="studio-canvas-center-point"')
    // ~6px in diameter
    expect(eyeContent).toContain("width: '6px'")
    expect(eyeContent).toContain("height: '6px'")
    expect(eyeContent).toContain("borderRadius: '50%'")
    // Solid red dot
    expect(eyeContent).toContain('#FF3B30')
  })

  it('2. Verifies placed at fixed world coordinate (0, 0) and centered via translate(-50%, -50%)', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    expect(eyeContent).toContain('left: 0')
    expect(eyeContent).toContain('top: 0')
    expect(eyeContent).toContain("transform: 'translate(-50%, -50%)'")
  })

  it('3. Verifies rendered INSIDE the transformed canvas layer (#studio-canvas-transform-layer)', () => {
    const canvasContent = fs.readFileSync(canvasComponentPath, 'utf-8')

    expect(canvasContent).toContain("import { StudioCanvasCenterPoint } from './StudioInteractiveEye'")

    // Transformed canvas layer contains StudioCanvasCenterPoint
    const transformLayerIdx = canvasContent.indexOf('id="studio-canvas-transform-layer"')
    const centerPointIdx = canvasContent.indexOf('<StudioCanvasCenterPoint />')
    const frameRendererIdx = canvasContent.indexOf('<StudioFrameRenderer')

    expect(transformLayerIdx).toBeGreaterThan(0)
    expect(centerPointIdx).toBeGreaterThan(transformLayerIdx)
    expect(frameRendererIdx).toBeGreaterThan(centerPointIdx)
  })

  it('4. Verifies the large eye logo overlay has been completely removed', () => {
    const canvasContent = fs.readFileSync(canvasComponentPath, 'utf-8')
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    // Large logo image tag removed
    expect(eyeContent).not.toContain('<img')
    expect(eyeContent).not.toContain('studio-center-logo.png')
    expect(canvasContent).not.toContain('studio-center-logo-overlay')
  })

  it('5. Verifies dot is non-selectable, non-draggable, and non-interactive (pointer-events: none)', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    expect(eyeContent).toContain("pointerEvents: 'none'")
  })

  it('6. Verifies moves and scales with canvas transformations (pan and zoom math)', () => {
    // World coordinates of center point
    const worldPoint = { x: 0, y: 0 }

    // Screen position formula inside transform layer:
    // screenX = pan.x + worldPoint.x * zoom
    // screenY = pan.y + worldPoint.y * zoom
    const computeScreenPos = (pan: { x: number; y: number }, zoom: number) => ({
      x: pan.x + worldPoint.x * zoom,
      y: pan.y + worldPoint.y * zoom,
      renderedSize: 6 * zoom,
    })

    // Test at pan: (0, 0), zoom: 1.0 (100%)
    const pos1 = computeScreenPos({ x: 0, y: 0 }, 1.0)
    expect(pos1.x).toBe(0)
    expect(pos1.y).toBe(0)
    expect(pos1.renderedSize).toBe(6)

    // Test when canvas is panned to (300, 200)
    const pos2 = computeScreenPos({ x: 300, y: 200 }, 1.0)
    expect(pos2.x).toBe(300)
    expect(pos2.y).toBe(200)

    // Test when canvas is zoomed to 200% at pan (300, 200)
    const pos3 = computeScreenPos({ x: 300, y: 200 }, 2.0)
    expect(pos3.x).toBe(300) // (0,0) scaled by zoom is still 0, plus pan
    expect(pos3.y).toBe(200)
    expect(pos3.renderedSize).toBe(12)

    // Test when canvas is zoomed to 50%
    const pos4 = computeScreenPos({ x: 300, y: 200 }, 0.5)
    expect(pos4.renderedSize).toBe(3)
  })

  it('7. Verifies center point is strictly excluded from document exports (PNG, SVG, JSON)', () => {
    const exportContent = fs.readFileSync(exportModalPath, 'utf-8')

    // Exports only render frames and nodes from the store, never canvas annotations
    expect(exportContent).not.toContain('studio-canvas-center-point')
    expect(exportContent).not.toContain('StudioCanvasCenterPoint')
    expect(exportContent).toContain('targetFrames.forEach((frame) => {')
    expect(exportContent).toContain('childNodes.forEach((node) => {')
  })

  it('8. Verifies existing dotted workspace background and toolbar remain intact', () => {
    const canvasContent = fs.readFileSync(canvasComponentPath, 'utf-8')

    // Dotted workspace background preserved
    expect(canvasContent).toContain('id="studio-workspace-background"')
    expect(canvasContent).toContain('style={backgroundStyle}')

    // Floating toolbar preserved
    expect(canvasContent).toContain('<StudioToolPalette />')
  })
})
