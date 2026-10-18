import { describe, it, expect } from 'vitest'
import { generateRuleBasedSitemap } from '../services/generator/ruleBasedGenerator'
import { generateSitemapWithOllama } from '../services/generator/ollamaService'

describe('Sitemap Generator Tests', () => {
  it('generates offline sitemap with requested page count and semantic hierarchy', () => {
    const generated = generateRuleBasedSitemap({
      description: 'Cloud Database Platform for High-Velocity Teams',
      targetAudience: 'Backend Developers and DevOps Engineers',
      websiteGoals: 'Increase trial conversions and documentation engagement',
      websiteType: 'saas',
      pageCount: 6,
      requirements: ['auth', 'dashboard', 'pricing'],
    })

    expect(generated.pages.length).toBe(6)
    expect(generated.pages[0].slug).toBe('/')
    expect(generated.pages[0].parentId).toBeNull()

    // Verify sections exist for each page
    generated.pages.forEach((page) => {
      expect(page.sectionIds.length).toBeGreaterThan(0)
      const matchingSections = generated.sections.filter((s) => s.pageId === page.id)
      expect(matchingSections.length).toBe(page.sectionIds.length)

      // Verify wireframe created
      const wf = generated.wireframes[page.id]
      expect(wf).toBeDefined()
      expect(wf.components.length).toBe(matchingSections.length)
    })

    // Verify edges reflect parent-child relationships
    const nonRootPages = generated.pages.filter((p) => p.parentId !== null)
    expect(generated.edges.length).toBe(nonRootPages.length)
  })

  it('generates e-commerce specific pages for shop websites', () => {
    const generated = generateRuleBasedSitemap({
      description: 'Artisanal Handcrafted Leather Goods',
      targetAudience: 'Fashion Enthusiasts',
      websiteGoals: 'Direct to consumer sales',
      websiteType: 'ecommerce',
      pageCount: 4,
      requirements: [],
    })

    expect(generated.pages.length).toBe(4)
    const slugs = generated.pages.map((p) => p.slug)
    expect(slugs).toContain('/')
    expect(slugs.some((s) => s.includes('shop') || s.includes('checkout') || s.includes('product'))).toBe(true)
  })

  it('safely falls back to rule-based engine when Ollama is offline', async () => {
    // Port 99999 or non-existent endpoint
    const result = await generateSitemapWithOllama(
      {
        description: 'Test Project Offline',
        targetAudience: 'General Audience',
        websiteGoals: 'Testing',
        websiteType: 'saas',
        pageCount: 5,
        requirements: [],
      },
      'http://localhost:59999',
      'llama3',
    )

    expect(result.usedFallback).toBe(true)
    expect(result.projectData.pages.length).toBe(5)
    expect(result.notice).toContain('rule-based engine')
  })
})
