import { describe, it, expect } from 'vitest'
import { validateProjectData } from '../schemas/projectSchema'
import { createSaaSTemplate } from '../services/generator/templates'
import { generateProjectMarkdown } from '../services/export/markdownExport'
import { generateSitemapSvg } from '../services/export/svgExport'

describe('Validation and Export Tests', () => {
  it('validates a complete project data model with Zod', () => {
    const project = createSaaSTemplate()
    const result = validateProjectData(project)
    expect(result.success).toBe(true)
  })

  it('rejects invalid or malformed project data with detailed issues', () => {
    const malformed = {
      id: '', // invalid: min 1
      name: '',
      pages: [
        {
          id: 'p1',
          name: 'Home',
          type: 'invalid-type-1234', // invalid enum
        },
      ],
    }

    const result = validateProjectData(malformed)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeDefined()
    }
  })

  it('generates high quality markdown specification with hierarchy and sections', () => {
    const project = createSaaSTemplate()
    const markdown = generateProjectMarkdown(project)

    expect(markdown).toContain(`# ${project.name}`)
    expect(markdown).toContain('## Sitemap Hierarchy')
    expect(markdown).toContain('## Detailed Page Specifications')
    expect(markdown).toContain('Total Pages:')

    // Every page should appear in markdown
    project.pages.forEach((page) => {
      expect(markdown).toContain(page.name)
      expect(markdown).toContain(page.slug)
    })
  })

  it('generates valid vector SVG markup with nodes and connecting edges', () => {
    const project = createSaaSTemplate()
    const svg = generateSitemapSvg(project)

    expect(svg.startsWith('<?xml') || svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain(project.name)
    expect(svg).toContain('id="edges"')
    expect(svg).toContain('id="nodes"')
    expect(svg).toContain('</svg>')
  })
})
