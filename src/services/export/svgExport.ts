import { Project, Page } from '../../types'

export function generateSitemapSvg(project: Project): string {
  if (project.pages.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><text x="200" y="100" text-anchor="middle" fill="#888">Empty Sitemap</text></svg>`
  }

  const CARD_WIDTH = 260
  const CARD_HEIGHT = 160
  const PADDING = 80

  // Calculate bounding box
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  project.pages.forEach((p) => {
    minX = Math.min(minX, p.position.x)
    minY = Math.min(minY, p.position.y)
    maxX = Math.max(maxX, p.position.x + CARD_WIDTH)
    maxY = Math.max(maxY, p.position.y + CARD_HEIGHT)
  })

  const width = Math.max(800, maxX - minX + PADDING * 2)
  const height = Math.max(600, maxY - minY + PADDING * 2 + 60) // Extra 60 for title bar
  const offsetX = PADDING - minX
  const offsetY = PADDING - minY + 60

  const pageMap = new Map<string, Page>()
  project.pages.forEach((p) => pageMap.set(p.id, p))

  const svgParts: string[] = []

  svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.08" />
    </filter>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8" />
    </marker>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#f8fafc" />
  
  <!-- Grid dots -->
  <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="1.5" fill="#cbd5e1" opacity="0.6"/>
  </pattern>
  <rect width="100%" height="100%" fill="url(#dotGrid)" />

  <!-- Document Header -->
  <g transform="translate(40, 45)">
    <text x="0" y="0" font-size="22" font-weight="700" fill="#0f172a">${escapeXml(project.name)}</text>
    <text x="0" y="22" font-size="13" fill="#64748b">${escapeXml(project.description || 'Information Architecture & Page Hierarchy')} • ${project.pages.length} Pages</text>
  </g>
`)

  // Render Edges
  svgParts.push('<g id="edges">')
  project.edges.forEach((edge) => {
    const sourcePage = pageMap.get(edge.source)
    const targetPage = pageMap.get(edge.target)
    if (!sourcePage || !targetPage) return

    const sx = sourcePage.position.x + offsetX + CARD_WIDTH / 2
    const sy = sourcePage.position.y + offsetY + CARD_HEIGHT
    const tx = targetPage.position.x + offsetX + CARD_WIDTH / 2
    const ty = targetPage.position.y + offsetY

    // Bezier curve
    const cy1 = sy + Math.max(30, (ty - sy) / 2)
    const cy2 = ty - Math.max(30, (ty - sy) / 2)

    svgParts.push(`  <path d="M ${sx} ${sy} C ${sx} ${cy1}, ${tx} ${cy2}, ${tx} ${ty}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" marker-end="url(#arrow)" />`)
  })
  svgParts.push('</g>')

  // Render Nodes
  svgParts.push('<g id="nodes">')
  project.pages.forEach((page) => {
    const x = page.position.x + offsetX
    const y = page.position.y + offsetY

    const sections = project.sections
      .filter((s) => s.pageId === page.id)
      .sort((a, b) => a.position - b.position)

    const accentColor = page.color || '#3b82f6'

    svgParts.push(`
  <g transform="translate(${x}, ${y})" filter="url(#card-shadow)">
    <!-- Node Card Container -->
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="${CARD_WIDTH}" height="5" rx="2" fill="${accentColor}" />

    <!-- Top Badge Row -->
    <rect x="14" y="16" width="60" height="20" rx="4" fill="#eff6ff" />
    <text x="44" y="30" font-size="10" font-weight="600" fill="#2563eb" text-anchor="middle">${escapeXml(page.type.toUpperCase())}</text>

    <text x="${CARD_WIDTH - 14}" y="30" font-size="11" font-weight="500" fill="#94a3b8" text-anchor="end">${sections.length} sections</text>

    <!-- Page Title & Slug -->
    <text x="14" y="60" font-size="15" font-weight="700" fill="#0f172a">${escapeXml(page.name)}</text>
    <text x="14" y="78" font-size="11" font-family="monospace" fill="#64748b">${escapeXml(page.slug)}</text>

    <!-- Divider -->
    <line x1="14" y1="90" x2="${CARD_WIDTH - 14}" y2="90" stroke="#f1f5f9" stroke-width="1" />

    <!-- Preview Sections snippet -->
    <g transform="translate(14, 104)">
      ${sections
        .slice(0, 3)
        .map(
          (s, idx) => `
        <text x="0" y="${idx * 16}" font-size="11" fill="#475569">
          <tspan fill="${s.isGlobal ? '#3b82f6' : '#94a3b8'}">•</tspan> ${escapeXml(s.name.slice(0, 26))}
        </text>
      `,
        )
        .join('')}
      ${sections.length > 3 ? `<text x="0" y="48" font-size="10" fill="#94a3b8">+ ${sections.length - 3} more...</text>` : ''}
    </g>
  </g>`)
  })
  svgParts.push('</g>')

  // Footer branding
  svgParts.push(`
  <g transform="translate(${width - 240}, ${height - 24})">
    <text font-size="11" fill="#94a3b8">Exported with OpenSitemap</text>
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
