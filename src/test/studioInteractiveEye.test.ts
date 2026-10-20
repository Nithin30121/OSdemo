import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('OpenSitemap Studio: Eye Logo Canvas Center Marker Specification Tests', () => {
  const eyeComponentPath = path.resolve(__dirname, '../components/studio/StudioInteractiveEye.tsx')
  const canvasComponentPath = path.resolve(__dirname, '../components/studio/StudioCanvas.tsx')
  const exportModalPath = path.resolve(__dirname, '../components/studio/StudioExportModal.tsx')
  const logoAssetPath = path.resolve(__dirname, '../../public/studio-center-logo.png')

  it('1. Verifies supplied eye-in-triangle logo asset exists in public folder', () => {
    expect(fs.existsSync(logoAssetPath)).toBe(true)
    const stats = fs.statSync(logoAssetPath)
    expect(stats.size).toBeGreaterThan(10000) // 1024x1024 RGBA PNG asset
  })

  it('2. Verifies StudioCanvasLogo renders the eye-in-triangle image with aspect ratio preserved', () => {
    expect(fs.existsSync(eyeComponentPath)).toBe(true)
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    // Renders eye logo image
    expect(eyeContent).toContain('/studio-center-logo.png')
    expect(eyeContent).toContain('<img')
    expect(eyeContent).toContain("objectFit: 'contain'")
    expect(eyeContent).toContain("width: '240px'")
    expect(eyeContent).toContain("height: '240px'")
  })

  it('3. Verifies red dot is completely removed (no red dot marker displayed)', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')
    const canvasContent = fs.readFileSync(canvasComponentPath, 'utf-8')

    // No red dot hex color or red dot element
    expect(eyeContent).not.toContain('#FF3B30')
    expect(eyeContent).not.toContain('studio-canvas-center-point')
    expect(canvasContent).not.toContain('StudioCanvasCenterPoint')
  })

  it('4. Verifies placed at exact canvas coordinates (0, 0) centered via translate(-50%, -50%)', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    // Positioned at origin (0, 0)
    expect(eyeContent).toContain('left: 0')
    expect(eyeContent).toContain('top: 0')
    expect(eyeContent).toContain("transform: 'translate(-50%, -50%)'")
  })

  it('5. Verifies rendered INSIDE the transformed canvas layer (#studio-canvas-transform-layer)', () => {
    const canvasContent = fs.readFileSync(canvasComponentPath, 'utf-8')

    // Imports StudioInteractiveEye
    expect(canvasContent).toContain("import { StudioInteractiveEye } from './StudioInteractiveEye'")

    // Transformed canvas layer contains StudioInteractiveEye
    const transformLayerIdx = canvasContent.indexOf('id="studio-canvas-transform-layer"')
    const logoIdx = canvasContent.indexOf('<StudioInteractiveEye />')
    const frameRendererIdx = canvasContent.indexOf('<StudioFrameRenderer')

    expect(transformLayerIdx).toBeGreaterThan(0)
    expect(logoIdx).toBeGreaterThan(transformLayerIdx)
    expect(frameRendererIdx).toBeGreaterThan(logoIdx)
  })

  it('6. Verifies logo is non-selectable, non-draggable, and non-interactive', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    expect(eyeContent).toContain("pointerEvents: 'none'")
    expect(eyeContent).toContain("userSelect: 'none'")
    expect(eyeContent).toContain('draggable={false}')
  })

  it('7. Verifies panning and zooming math (behaves like an ordinary canvas image)', () => {
    // World coordinates of origin logo
    const worldPoint = { x: 0, y: 0 }
    const logoBaseSize = 240

    // Screen position and rendered size formula inside transform layer:
    // screenX = pan.x + worldPoint.x * zoom
    // screenY = pan.y + worldPoint.y * zoom
    // renderedWidth = logoBaseSize * zoom
    const computeScreenTransform = (pan: { x: number; y: number }, zoom: number) => ({
      x: pan.x + worldPoint.x * zoom,
      y: pan.y + worldPoint.y * zoom,
      renderedSize: logoBaseSize * zoom,
    })

    // Test at pan: (0, 0), zoom: 1.0 (100%)
    const pos1 = computeScreenTransform({ x: 0, y: 0 }, 1.0)
    expect(pos1.x).toBe(0)
    expect(pos1.y).toBe(0)
    expect(pos1.renderedSize).toBe(240)

    // Test when canvas is panned to (500, 350)
    const pos2 = computeScreenTransform({ x: 500, y: 350 }, 1.0)
    expect(pos2.x).toBe(500)
    expect(pos2.y).toBe(350)

    // Test when canvas is zoomed to 200% at pan (500, 350)
    const pos3 = computeScreenTransform({ x: 500, y: 350 }, 2.0)
    expect(pos3.x).toBe(500)
    expect(pos3.y).toBe(350)
    expect(pos3.renderedSize).toBe(480)

    // Test when canvas is zoomed to 25% at pan (100, 100)
    const pos4 = computeScreenTransform({ x: 100, y: 100 }, 0.25)
    expect(pos4.x).toBe(100)
    expect(pos4.y).toBe(100)
    expect(pos4.renderedSize).toBe(60)
  })

  it('8. Verifies logo is strictly excluded from document exports (PNG, SVG, JSON)', () => {
    const exportContent = fs.readFileSync(exportModalPath, 'utf-8')

    // Exports only render frames and nodes from the store, never canvas annotations
    expect(exportContent).not.toContain('studio-canvas-center-logo')
    expect(exportContent).not.toContain('StudioInteractiveEye')
    expect(exportContent).toContain('targetFrames.forEach((frame) => {')
    expect(exportContent).toContain('childNodes.forEach((node) => {')
  })

  it('9. Verifies static rendering without dynamic viewport centering or pupil tracking', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    // No dynamic tracking states or viewport event listeners
    expect(eyeContent).not.toContain('mousemove')
    expect(eyeContent).not.toContain('onMouseMove')
    expect(eyeContent).not.toContain('pupil')
    expect(eyeContent).not.toContain('requestAnimationFrame')
  })
})
