import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { NEO_CARD_PALETTE } from '../components/canvas/PageNode'

describe('OpenSitemap: Professional Dark Grey Glass UI Theme Tests', () => {
  const cssPath = path.resolve(__dirname, '../index.css')
  const cssContent = fs.readFileSync(cssPath, 'utf-8')

  const headerPath = path.resolve(__dirname, '../components/layout/Header.tsx')
  const headerContent = fs.readFileSync(headerPath, 'utf-8')

  const sidebarPath = path.resolve(__dirname, '../components/layout/Sidebar.tsx')
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8')

  const propertiesPath = path.resolve(__dirname, '../components/layout/PropertiesPanel.tsx')
  const propertiesContent = fs.readFileSync(propertiesPath, 'utf-8')

  const canvasPath = path.resolve(__dirname, '../components/canvas/SitemapCanvas.tsx')
  const canvasContent = fs.readFileSync(canvasPath, 'utf-8')

  it('1. Verifies CSS theme variables define the professional dark grey palette', () => {
    expect(cssContent).toContain('--theme-chrome: #202020')
    expect(cssContent).toContain('--theme-sidebar: #252525')
    expect(cssContent).toContain('--theme-toolbar: #2B2B2B')
    expect(cssContent).toContain('--theme-input: #303030')
    expect(cssContent).toContain('--theme-border: #3B3B3B')
    expect(cssContent).toContain('--theme-text-primary: #F3F3F3')
    expect(cssContent).toContain('--theme-text-secondary: #B0B0B0')
    expect(cssContent).toContain('--theme-text-disabled: #777777')
    expect(cssContent).toContain('--theme-canvas: #080D19')
  })

  it('2. Verifies .selected-glass class specification provides frosted glass highlight', () => {
    expect(cssContent).toContain('.selected-glass')
    expect(cssContent).toMatch(/background:\s*rgba\(220,\s*220,\s*220,\s*0\.12\)/)
    expect(cssContent).toMatch(/backdrop-filter:\s*blur\(8px\)/)
    expect(cssContent).toContain('inset 0 1px 0 rgba(255, 255, 255, 0.12)')
  })

  it('3. Verifies Top Header uses #202020, #3B3B3B borders, #2B2B2B controls pill, and #F3F3F3 text', () => {
    expect(headerContent).toContain('bg-[#202020]')
    expect(headerContent).toContain('border-[#3B3B3B]')
    expect(headerContent).toContain('bg-[#2B2B2B]')
    expect(headerContent).toContain('text-[#F3F3F3]')
    expect(headerContent).toContain('text-[#B0B0B0]')
    // Preserves action buttons
    expect(headerContent).toContain('#873FF0') // Generate with AI
    expect(headerContent).toContain('#F59E0B') // Export
    expect(headerContent).toContain('#F04444') // NK Avatar
  })

  it('4. Verifies Left Sidebar uses #252525, #3B3B3B borders, and selected-glass on active view/tab', () => {
    expect(sidebarContent).toContain('bg-[#252525]')
    expect(sidebarContent).toContain('border-[#3B3B3B]')
    expect(sidebarContent).toContain('bg-[#2B2B2B]') // Project card
    expect(sidebarContent).toContain('selected-glass') // Active nav and tab
    expect(sidebarContent).toContain('bg-[#303030]') // Search input & active page row
    expect(sidebarContent).toContain('text-[#F3F3F3]')
    expect(sidebarContent).toContain('text-[#B0B0B0]')
  })

  it('5. Verifies Right Properties Panel uses #252525, #303030 inputs, #3B3B3B borders, and selected-glass on active tab', () => {
    expect(propertiesContent).toContain('bg-[#252525]')
    expect(propertiesContent).toContain('border-[#3B3B3B]')
    expect(propertiesContent).toContain('bg-[#303030]') // Form inputs
    expect(propertiesContent).toContain('bg-[#2B2B2B]') // Section cards
    expect(propertiesContent).toContain('selected-glass') // Active tab
    expect(propertiesContent).toContain('text-[#F3F3F3]')
    expect(propertiesContent).toContain('text-[#B0B0B0]')
    expect(propertiesContent).toContain('text-[#777777]')
  })

  it('6. Verifies Canvas retains near-black/navy background and dotted grid', () => {
    expect(canvasContent).toContain('bg-[#030817]')
    expect(canvasContent).toContain('color="#1B263B"') // Dotted grid color
    expect(canvasContent).toContain('!bg-[#2B2B2B]') // Canvas Controls
    expect(canvasContent).toContain('!bg-[#252525]/90') // MiniMap
  })

  it('7. CRITICAL: Verifies all sitemap card colors in NEO_CARD_PALETTE are 100% preserved', () => {
    expect(NEO_CARD_PALETTE.blue.bg).toBe('#1769E8') // Blue Home Page & Login/Sign Up
    expect(NEO_CARD_PALETTE.cobalt.bg).toBe('#1769E8')
    expect(NEO_CARD_PALETTE.red.bg).toBe('#F04444') // Red Timetable
    expect(NEO_CARD_PALETTE.yellow.bg).toBe('#F9E52B') // Yellow Attendance
    expect(NEO_CARD_PALETTE.purple.bg).toBe('#873FF0') // Purple Grades
    expect(NEO_CARD_PALETTE.teal.bg).toBe('#29C7A3') // Teal Friends
    expect(NEO_CARD_PALETTE.pink.bg).toBe('#F45AA8') // Pink Notifications
    expect(NEO_CARD_PALETTE.cream.bg).toBe('#F4E8D6') // Cream Profile
  })
})
