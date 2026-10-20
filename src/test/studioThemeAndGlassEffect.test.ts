import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Studio Professional Grey Theme & Selective Glass Effect Tests', () => {
  const cssPath = path.resolve(__dirname, '../index.css')
  const cssContent = fs.readFileSync(cssPath, 'utf-8')

  it('1. Verifies that CSS variables for the Studio Grey palette are defined', () => {
    expect(cssContent).toContain('--studio-chrome: #242424')
    expect(cssContent).toContain('--studio-sidebar: #292929')
    expect(cssContent).toContain('--studio-toolbar: #303030')
    expect(cssContent).toContain('--studio-input: #353535')
    expect(cssContent).toContain('--studio-border: #424242')
    expect(cssContent).toContain('--studio-text-primary: #F2F2F2')
    expect(cssContent).toContain('--studio-text-secondary: #A8A8A8')
    expect(cssContent).toContain('--studio-text-disabled: #707070')
    expect(cssContent).toContain('--studio-canvas: #000000')
  })

  it('2. Verifies .selected-glass class specification has frosted translucent background and inner highlight', () => {
    expect(cssContent).toContain('.selected-glass')
    expect(cssContent).toMatch(/background:\s*rgba\(220,\s*220,\s*220,\s*0\.12\)/)
    expect(cssContent).toMatch(/border:\s*1px\s*solid\s*rgba\(240,\s*240,\s*240,\s*0\.28\)/)
    expect(cssContent).toMatch(/backdrop-filter:\s*blur\(8px\)/)
    expect(cssContent).toContain('inset 0 1px 0 rgba(255, 255, 255, 0.12)')
    expect(cssContent).toMatch(/color:\s*#F2F2F2/)
  })

  it('3. Verifies zero legacy navy color codes remain in Studio components', () => {
    const studioDir = path.resolve(__dirname, '../components/studio')
    const files = fs.readdirSync(studioDir).filter((f: string) => f.endsWith('.tsx') || f.endsWith('.ts'))

    const legacyNavyRegex = /(#0D1527|#080D19|#1E293B|#151F32|#0E1526)/i

    for (const file of files) {
      const filePath = path.join(studioDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const match = content.match(legacyNavyRegex)
      expect(match, `File ${file} should not contain legacy navy color ${match?.[0]}`).toBeNull()
    }
  })

  it('4. Verifies StudioTopBar uses professional grey theme and selected-glass on active controls', () => {
    const topBarPath = path.resolve(__dirname, '../components/studio/StudioTopBar.tsx')
    const content = fs.readFileSync(topBarPath, 'utf-8')

    // TopBar chrome background #242424 and border #424242
    expect(content).toContain('bg-[#242424]')
    expect(content).toContain('border-[#424242]')

    // Snapping toggle uses selected-glass when active
    expect(content).toMatch(/isSnappingEnabled\s*\?\s*['"]selected-glass/)
  })

  it('5. Verifies StudioToolPalette uses toolbar surface #303030 and selected-glass on active tool', () => {
    const toolPalettePath = path.resolve(__dirname, '../components/studio/StudioToolPalette.tsx')
    const content = fs.readFileSync(toolPalettePath, 'utf-8')

    // Toolbar surface #303030 and border #424242
    expect(content).toContain('bg-[#303030]')
    expect(content).toContain('border-[#424242]')

    // Active tool uses selected-glass
    expect(content).toMatch(/selected-glass/)
  })

  it('6. Verifies StudioLeftSidebar uses sidebar surface #292929 and selected-glass on active tab/layer', () => {
    const leftSidebarPath = path.resolve(__dirname, '../components/studio/StudioLeftSidebar.tsx')
    const content = fs.readFileSync(leftSidebarPath, 'utf-8')

    // Sidebar surface #292929 and border #424242
    expect(content).toContain('bg-[#292929]')
    expect(content).toContain('border-[#424242]')

    // Tab switcher uses #303030 container and selected-glass for active tab
    expect(content).toContain('bg-[#303030]')
    expect(content).toMatch(/leftTab === 'layers'\s*\?\s*['"]selected-glass/)
    expect(content).toMatch(/leftTab === 'assets'\s*\?\s*['"]selected-glass/)

    // Selected nodes in layers tree use selected-glass
    expect(content).toMatch(/isNodeSelected\s*\?\s*['"]selected-glass/)
  })

  it('7. Verifies StudioRightSidebar uses sidebar surface #292929, inputs #353535, and selected-glass on controls', () => {
    const rightSidebarPath = path.resolve(__dirname, '../components/studio/StudioRightSidebar.tsx')
    const content = fs.readFileSync(rightSidebarPath, 'utf-8')

    // Sidebar surface #292929 and border #424242
    expect(content).toContain('bg-[#292929]')
    expect(content).toContain('border-[#424242]')

    // Tab buttons use selected-glass
    expect(content).toMatch(/rightTab === 'design'\s*\?\s*['"]selected-glass/)
    expect(content).toMatch(/rightTab === 'prototype'\s*\?\s*['"]selected-glass/)

    // Fit Mode buttons (fill, fit, crop) use selected-glass on active mode
    expect(content).toMatch(/selectedNode\.image\?\.fit === mode\s*\?\s*['"]selected-glass/)

    // Text Alignment buttons use selected-glass on active alignment
    expect(content).toMatch(/selectedNode\.text\?\.textAlign === align\s*\?\s*['"]selected-glass/)

    // Inputs use #353535 and borders #424242
    expect(content).toContain('bg-[#353535]')
  })

  it('8. Verifies StudioExportModal uses professional grey theme and selected-glass on format options', () => {
    const exportModalPath = path.resolve(__dirname, '../components/studio/StudioExportModal.tsx')
    const content = fs.readFileSync(exportModalPath, 'utf-8')

    // Modal surface #292929 and border #424242
    expect(content).toContain('bg-[#292929]')
    expect(content).toContain('border-[#424242]')

    // Format selection buttons use selected-glass when active
    expect(content).toMatch(/exportFormat === 'png'\s*\?\s*['"]selected-glass/)
    expect(content).toMatch(/exportFormat === 'svg'\s*\?\s*['"]selected-glass/)
    expect(content).toMatch(/exportFormat === 'json'\s*\?\s*['"]selected-glass/)

    // Resolution scale buttons use selected-glass when active
    expect(content).toMatch(/resolutionScale === 1\s*\?\s*['"]selected-glass/)
    expect(content).toMatch(/resolutionScale === 2\s*\?\s*['"]selected-glass/)
  })

  it('9. Verifies Canvas workspace retains pure black background #000000', () => {
    const canvasPath = path.resolve(__dirname, '../components/studio/StudioCanvas.tsx')
    const content = fs.readFileSync(canvasPath, 'utf-8')

    expect(content).toContain("backgroundColor: '#000000'")
    expect(content).toContain('bg-[#000000]')
  })
})
