import { Project, Page, Section } from '../../types'
import { calculateNodeHeight, NODE_WIDTH } from '../../components/canvas/layoutUtils'

export function generateSitemapSvg(project: Project): string {
  if (project.pages.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="100%" height="100%" fill="#090d16"/><text x="200" y="100" text-anchor="middle" fill="#64748b" font-family="-apple-system, sans-serif">Empty Sitemap</text></svg>`
  }

  const CARD_WIDTH = NODE_WIDTH
  const PADDING = 80

  // Pre-calculate heights for all pages
  const heightMap = new Map<string, number>()
  project.pages.forEach((p) => {
    heightMap.set(p.id, calculateNodeHeight(p, project.sections))
  })

  // Calculate bounding box
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  project.pages.forEach((p) => {
    const cardHeight = heightMap.get(p.id) || 200
    minX = Math.min(minX, p.position.x)
    minY = Math.min(minY, p.position.y)
    maxX = Math.max(maxX, p.position.x + CARD_WIDTH)
    maxY = Math.max(maxY, p.position.y + cardHeight)
  })

  const width = Math.max(900, Math.round(maxX - minX + PADDING * 2))
  const height = Math.max(650, Math.round(maxY - minY + PADDING * 2 + 70))
  const offsetX = Math.round(PADDING - minX)
  const offsetY = Math.round(PADDING - minY + 70)

  const pageMap = new Map<string, Page>()
  project.pages.forEach((p) => pageMap.set(p.id, p))

  const svgParts: string[] = []

  const NEO_PALETTE: Record<string, { bg: string; text: string; catText: string }> = {
    cobalt: { bg: '#1769E8', text: '#050B17', catText: '#0B215E' },
    blue: { bg: '#1769E8', text: '#050B17', catText: '#0B215E' },
    red: { bg: '#F04444', text: '#050B17', catText: '#5C0E0E' },
    yellow: { bg: '#F9E52B', text: '#050B17', catText: '#633903' },
    purple: { bg: '#873FF0', text: '#050B17', catText: '#340B6B' },
    teal: { bg: '#29C7A3', text: '#050B17', catText: '#074536' },
    pink: { bg: '#F45AA8', text: '#050B17', catText: '#5C0B36' },
    cream: { bg: '#F4E8D6', text: '#050B17', catText: '#44403C' },
  }

  const getSvgTheme = (color?: string, pageType?: string) => {
    if (color && NEO_PALETTE[color.toLowerCase()]) {
      return NEO_PALETTE[color.toLowerCase()]
    }
    const c = (color || '').toLowerCase()
    if (c.includes('red') || c === '#f04444') return NEO_PALETTE.red
    if (c.includes('yellow') || c === '#f9e52b') return NEO_PALETTE.yellow
    if (c.includes('purple') || c === '#873ff0') return NEO_PALETTE.purple
    if (c.includes('teal') || c.includes('cyan') || c === '#29c7a3') return NEO_PALETTE.teal
    if (c.includes('pink') || c === '#f45aa8') return NEO_PALETTE.pink
    if (c.includes('cream') || c === '#f4e8d6') return NEO_PALETTE.cream
    if (c.includes('blue') || c === '#1769e8') return NEO_PALETTE.cobalt

    switch (pageType) {
      case 'landing':
      case 'dashboard':
        return NEO_PALETTE.cobalt
      case 'product':
      case 'content':
        return NEO_PALETTE.yellow
      case 'checkout':
      case 'auth':
        return NEO_PALETTE.red
      case 'blog':
        return NEO_PALETTE.purple
      default:
        return NEO_PALETTE.cobalt
    }
  }

  svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.35" />
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748B" />
    </marker>
  </defs>

  <!-- Canvas Background -->
  <rect width="100%" height="100%" fill="#030817" />
  
  <!-- Subtle Grid Dots (74px spacing, ~3.5px size) -->
  <pattern id="dotGrid" width="74" height="74" patternUnits="userSpaceOnUse">
    <circle cx="37" cy="37" r="1.75" fill="#1B263B" opacity="0.8"/>
  </pattern>
  <rect width="100%" height="100%" fill="url(#dotGrid)" />

  <!-- Document Header -->
  <g transform="translate(40, 48)">
    <text x="0" y="0" font-size="20" font-weight="900" fill="#F8F5EF" letter-spacing="1">${escapeXml(project.name)}</text>
    <text x="0" y="22" font-size="12" fill="#94a3b8">${escapeXml(project.description || 'OpenSitemap Visual Architecture')} • ${project.pages.length} Pages • ${project.sections.length} Sections</text>
  </g>
`)

  // Render Edges
  svgParts.push('  <g id="edges">')
  project.edges.forEach((edge) => {
    const sourcePage = pageMap.get(edge.source)
    const targetPage = pageMap.get(edge.target)
    if (!sourcePage || !targetPage) return

    const sourceHeight = heightMap.get(sourcePage.id) || 200
    const sx = Math.round(sourcePage.position.x + offsetX + CARD_WIDTH / 2)
    const sy = Math.round(sourcePage.position.y + offsetY + sourceHeight)
    const tx = Math.round(targetPage.position.x + offsetX + CARD_WIDTH / 2)
    const ty = Math.round(targetPage.position.y + offsetY)

    // Orthogonal tree connector
    const midY = Math.round(sy + (ty - sy) / 2)
    const pathD = `M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`

    svgParts.push(`    <path d="${pathD}" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow)" />`)
  })
  svgParts.push('  </g>')

  // Render Nodes with Vertically Stacked Cream Sections
  svgParts.push('  <g id="nodes">')
  project.pages.forEach((page) => {
    const x = Math.round(page.position.x + offsetX)
    const y = Math.round(page.position.y + offsetY)
    const cardHeight = heightMap.get(page.id) || 200
    const theme = getSvgTheme(page.color, page.type)
    const categoryLabel = page.notes && page.notes.includes('/') ? page.notes : page.type.toUpperCase()

    const sections = project.sections
      .filter((s) => s.pageId === page.id)
      .sort((a, b) => a.position - b.position)

    svgParts.push(`
    <g transform="translate(${x}, ${y})" filter="url(#card-shadow)">
      <!-- Card Container Shell -->
      <rect width="${CARD_WIDTH}" height="${cardHeight}" rx="14" fill="${theme.bg}" stroke="rgba(0,0,0,0.2)" stroke-width="1" />

      <!-- Page Header -->
      <g transform="translate(14, 16)">
        <!-- Category Tag -->
        <text x="0" y="8" font-size="10" font-weight="800" fill="${theme.catText}" letter-spacing="1">${escapeXml(categoryLabel)}</text>
        
        <!-- Bold Condensed Page Title -->
        <text x="0" y="32" font-size="20" font-weight="900" fill="#050B17" letter-spacing="0.5">${escapeXml(page.name.toUpperCase().slice(0, 20))}</text>
      </g>

      <!-- Vertically Stacked Cream Sections List -->
      <g transform="translate(10, 56)">`)

    let currentY = 0

    if (sections.length === 0) {
      svgParts.push(`
        <rect x="0" y="${currentY}" width="${CARD_WIDTH - 20}" height="32" rx="6" fill="#F4E8D6" stroke="rgba(0,0,0,0.15)" />
        <text x="${(CARD_WIDTH - 20) / 2}" y="${currentY + 20}" font-size="10" fill="#64748b" text-anchor="middle">No sections</text>
      `)
    } else {
      sections.forEach((sec: Section) => {
        const hasDesc = !!(sec.description && sec.description.trim().length > 0)
        const isFeatured = sec.color === '#F9E52B' || sec.notes === 'featured' || sec.name.toLowerCase().includes('hero')
        const rowBg = isFeatured ? '#FEF08A' : '#F4E8D6'

        let rowHeight = 30
        if (hasDesc) {
          const charLen = sec.description.trim().length
          const lines = Math.min(2, Math.max(1, Math.ceil(charLen / 30)))
          rowHeight += lines * 14 + 4
        }

        svgParts.push(`
        <g transform="translate(0, ${currentY})">
          <!-- Section Row Box -->
          <rect width="${CARD_WIDTH - 20}" height="${rowHeight}" rx="6" fill="${rowBg}" stroke="rgba(0,0,0,0.15)" stroke-width="1" />

          <!-- Section Title -->
          <text x="10" y="19" font-size="11" font-weight="700" fill="#0F172A">${escapeXml(sec.name.slice(0, 28))}</text>
`)

        if (hasDesc) {
          const descText = sec.description.trim()
          const words = descText.split(' ')
          const lines: string[] = []
          let line = ''
          for (const word of words) {
            if ((line + ' ' + word).trim().length > 30) {
              lines.push(line.trim())
              line = word
              if (lines.length >= 2) break
            } else {
              line += ' ' + word
            }
          }
          if (line.trim().length > 0 && lines.length < 2) {
            lines.push(line.trim())
          }

          lines.forEach((l, lIdx) => {
            svgParts.push(`          <text x="10" y="${33 + lIdx * 14}" font-size="9" fill="#475569">${escapeXml(l)}</text>`)
          })
        }

        svgParts.push(`        </g>`)
        currentY += rowHeight + 6
      })
    }

    svgParts.push(`      </g>
    </g>`)
  })
  svgParts.push('  </g>')

  // Footer branding
  svgParts.push(`
  <g transform="translate(${width - 200}, ${height - 20})">
    <text font-size="11" fill="#475569" font-weight="600">OpenSitemap</text>
  </g>
</svg>`)

  return svgParts.join('\n')
}

export function downloadSitemapSvg(project: Project): void {
  const svg = generateSitemapSvg(project)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  a.download = `${safeName || 'sitemap'}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case '\'':
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })
}
