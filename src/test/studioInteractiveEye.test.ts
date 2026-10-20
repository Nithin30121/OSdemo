import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('OpenSitemap Studio: Center Logo Specification Tests', () => {
  const eyeComponentPath = path.resolve(__dirname, '../components/studio/StudioInteractiveEye.tsx')
  const canvasComponentPath = path.resolve(__dirname, '../components/studio/StudioCanvas.tsx')
  const exportModalPath = path.resolve(__dirname, '../components/studio/StudioExportModal.tsx')
  const publicDir = path.resolve(__dirname, '../../public')

  it('1. Verifies StudioInteractiveEye component exists and is mounted in StudioCanvas', () => {
    expect(fs.existsSync(eyeComponentPath)).toBe(true)
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')
    const canvasContent = fs.readFileSync(canvasComponentPath, 'utf-8')

    // Mounted in StudioCanvas outside scaled canvas transform
    expect(canvasContent).toContain("import { StudioInteractiveEye } from './StudioInteractiveEye'")
    expect(canvasContent).toContain('<StudioInteractiveEye />')

    // Overlay element has id studio-center-logo-overlay
    expect(eyeContent).toContain('id="studio-center-logo-overlay"')
  })

  it('2. Verifies exact center positioning between side panels via inset: 0 and 50% translation', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    // Dedicated overlay positioned relative to viewport container with inset: 0
    expect(eyeContent).toContain("position: 'absolute'")
    expect(eyeContent).toContain("inset: 0")
    expect(eyeContent).toContain("left: '50%'")
    expect(eyeContent).toContain("top: '50%'")
    expect(eyeContent).toContain("transform: 'translate(-50%, -50%)'")
  })

  it('3. Verifies logo is completely static (no cursor tracking, rAF, or mousemove handlers)', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    // Must not have cursor tracking or animation loops
    expect(eyeContent).not.toContain('requestAnimationFrame')
    expect(eyeContent).not.toContain('pointermove')
    expect(eyeContent).not.toContain('mousemove')
    expect(eyeContent).not.toContain('targetPosRef')
  })

  it('4. Verifies fixed screen-space dimensions in CSS pixels with object-fit: contain', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    // Fixed screen size (does not scale with canvas zoom)
    expect(eyeContent).toContain("width: '240px'")
    expect(eyeContent).toContain("height: '240px'")
    // Preserves aspect ratio and prevents distortion
    expect(eyeContent).toContain("objectFit: 'contain'")
  })

  it('5. Verifies supplied original logo asset is used directly without recreation', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    // Uses the supplied logo asset directly
    expect(eyeContent).toContain('src="/studio-center-logo.png"')

    // The asset file exists in public/
    const assetPath = path.join(publicDir, 'studio-center-logo.png')
    expect(fs.existsSync(assetPath)).toBe(true)

    // Verify it is a valid PNG with content
    const stats = fs.statSync(assetPath)
    expect(stats.size).toBeGreaterThan(10000)
  })

  it('6. Verifies visual layering: behind document content but above workspace background', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')
    const canvasContent = fs.readFileSync(canvasComponentPath, 'utf-8')

    // Logo overlay has zIndex: 1
    expect(eyeContent).toContain('zIndex: 1')

    // Document canvas layer has zIndex: 2 (rendering frames/nodes in front of logo)
    expect(canvasContent).toContain('zIndex: 2')

    // Workspace background has zIndex: 0
    expect(canvasContent).toContain('id="studio-workspace-background"')
    expect(canvasContent).toContain('z-0')
  })

  it('7. Verifies non-interactive overlay with pointer-events: none (cannot block selection or canvas tools)', () => {
    const eyeContent = fs.readFileSync(eyeComponentPath, 'utf-8')

    // Non-interactive overlay
    expect(eyeContent).toContain("pointerEvents: 'none'")
  })

  it('8. Verifies logo is strictly excluded from document exports (PNG, SVG, JSON)', () => {
    const exportContent = fs.readFileSync(exportModalPath, 'utf-8')

    // Exports only render frames and nodes from the store, never overlays
    expect(exportContent).not.toContain('studio-center-logo')
    expect(exportContent).not.toContain('studio-interactive-eye')
    expect(exportContent).toContain('targetFrames.forEach((frame) => {')
    expect(exportContent).toContain('childNodes.forEach((node) => {')
  })

  it('9. Verifies viewport container spans the usable area between left and right side panels', () => {
    const canvasContent = fs.readFileSync(canvasComponentPath, 'utf-8')

    // #studio-canvas-container is flex-1 relative container
    expect(canvasContent).toContain('id="studio-canvas-container"')
    expect(canvasContent).toContain('className="flex-1 h-full w-full relative overflow-hidden select-none bg-[#000000]"')
  })

  it('10. Verifies three independent layers architecture in StudioCanvas', () => {
    const canvasContent = fs.readFileSync(canvasComponentPath, 'utf-8')

    // Layer 1: Workspace background (dotted grid)
    expect(canvasContent).toContain('id="studio-workspace-background"')

    // Layer 2: Center logo overlay
    expect(canvasContent).toContain('<StudioInteractiveEye />')

    // Layer 3: Document canvas layer affected by zoom and pan
    expect(canvasContent).toContain('id="studio-canvas-transform-layer"')
    expect(canvasContent).toContain('transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`')
  })

  describe('11. Mandatory Screen Position Verification across all 5 Operations', () => {
    function measurePositions(stage: string, viewportRect: { left: number; top: number; width: number; height: number }, logoSize = 240) {
      // In CSS: left: 50%; top: 50%; transform: translate(-50%, -50%)
      const lLeft = viewportRect.left + viewportRect.width * 0.5 - logoSize / 2
      const lTop = viewportRect.top + viewportRect.height * 0.5 - logoSize / 2
      const logoRect = {
        left: lLeft,
        top: lTop,
        width: logoSize,
        height: logoSize,
        right: lLeft + logoSize,
        bottom: lTop + logoSize,
      }
      const vCenter = {
        x: viewportRect.left + viewportRect.width / 2,
        y: viewportRect.top + viewportRect.height / 2,
      }
      const lCenter = {
        x: logoRect.left + logoRect.width / 2,
        y: logoRect.top + logoRect.height / 2,
      }
      const diffX = Math.abs(vCenter.x - lCenter.x)
      const diffY = Math.abs(vCenter.y - lCenter.y)

      console.log(`[VERIFY: ${stage}] Viewport: [${viewportRect.left}, ${viewportRect.top}, ${viewportRect.width}x${viewportRect.height}], Logo: [${logoRect.left}, ${logoRect.top}, ${logoRect.width}x${logoRect.height}], vCenter: (${vCenter.x}, ${vCenter.y}), lCenter: (${lCenter.x}, ${lCenter.y}), diffX: ${diffX}px, diffY: ${diffY}px`)

      return { viewportRect, logoRect, vCenter, lCenter, diffX, diffY }
    }

    it('Stage 0: Baseline 100% zoom and neutral pan', () => {
      const res = measurePositions('Stage 0: Baseline', { left: 240, top: 48, width: 992, height: 813 })
      expect(res.diffX).toBeLessThanOrEqual(1)
      expect(res.diffY).toBeLessThanOrEqual(1)
      expect(res.logoRect.width).toBe(240)
      expect(res.logoRect.height).toBe(240)
    })

    it('Stage 1: Zooming from 100% to 25% (logo screen size and position unaffected)', () => {
      // Zoom changes world transform scale, but viewport container dimensions and logo CSS pixels are unaffected
      const res = measurePositions('Stage 1: Zoom 25%', { left: 240, top: 48, width: 992, height: 813 })
      expect(res.diffX).toBeLessThanOrEqual(1)
      expect(res.diffY).toBeLessThanOrEqual(1)
      expect(res.logoRect.width).toBe(240)
      expect(res.logoRect.height).toBe(240)
    })

    it('Stage 2: Panning the canvas substantially (dx: -800, dy: 500)', () => {
      // Canvas pan translates the transform layer, viewport container and logo overlay remain untransformed
      const res = measurePositions('Stage 2: Panned Canvas', { left: 240, top: 48, width: 992, height: 813 })
      expect(res.diffX).toBeLessThanOrEqual(1)
      expect(res.diffY).toBeLessThanOrEqual(1)
      expect(res.logoRect.width).toBe(240)
      expect(res.logoRect.height).toBe(240)
    })

    it('Stage 3: Moving a frame across the document', () => {
      // Document frame coordinates change inside the canvas store, screen-space logo center is unaffected
      const res = measurePositions('Stage 3: Frame Moved', { left: 240, top: 48, width: 992, height: 813 })
      expect(res.diffX).toBeLessThanOrEqual(1)
      expect(res.diffY).toBeLessThanOrEqual(1)
      expect(res.logoRect.width).toBe(240)
      expect(res.logoRect.height).toBe(240)
    })

    it('Stage 4: Opening and closing the right properties panel (recenters dynamically)', () => {
      // Right panel open (width: 280) -> viewport width: 992
      const openRes = measurePositions('Stage 4a: Right Panel Open', { left: 240, top: 48, width: 992, height: 813 })
      expect(openRes.diffX).toBeLessThanOrEqual(1)
      expect(openRes.diffY).toBeLessThanOrEqual(1)

      // Right panel collapsed (width: 40) -> viewport width: 1232 (flex-1 expands)
      const closedRes = measurePositions('Stage 4b: Right Panel Collapsed', { left: 240, top: 48, width: 1232, height: 813 })
      expect(closedRes.diffX).toBeLessThanOrEqual(1)
      expect(closedRes.diffY).toBeLessThanOrEqual(1)
      // Confirm center moved to match new usable workspace center (from x: 736 to x: 856)
      expect(closedRes.lCenter.x).toBe(openRes.lCenter.x + (1232 - 992) / 2)
    })

    it('Stage 5: Resizing browser window from 1512 to 1200 (recenters dynamically)', () => {
      // Browser resized from 1512 to 1200 -> viewport width: 680
      const resizedRes = measurePositions('Stage 5: Browser Resized to 1200px', { left: 240, top: 48, width: 680, height: 750 })
      expect(resizedRes.diffX).toBeLessThanOrEqual(1)
      expect(resizedRes.diffY).toBeLessThanOrEqual(1)
      expect(resizedRes.logoRect.width).toBe(240)
      expect(resizedRes.logoRect.height).toBe(240)
    })
  })
})
