import { GeneratorPromptInput, Page, Section, GlobalSection, CanvasEdge, WireframePageData } from '../../types'
import { generateRuleBasedSitemap } from './ruleBasedGenerator'

export interface OllamaModelInfo {
  name: string
  size?: number
  digest?: string
  modified_at?: string
}

export interface OllamaStatus {
  isAvailable: boolean
  models: string[]
  error?: string
}

const DEFAULT_OLLAMA_ENDPOINT = 'http://localhost:11434'

export async function checkOllamaStatus(endpoint = DEFAULT_OLLAMA_ENDPOINT): Promise<OllamaStatus> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)

    const response = await fetch(`${endpoint.replace(/\/$/, '')}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return {
        isAvailable: false,
        models: [],
        error: `Ollama server returned status ${response.status}`,
      }
    }

    const data = await response.json()
    const models: string[] = (data.models || []).map((m: OllamaModelInfo) => m.name)

    return {
      isAvailable: true,
      models,
    }
  } catch (err: any) {
    let msg = 'Could not connect to Ollama.'
    if (err.name === 'AbortError') {
      msg = 'Connection to Ollama timed out (2.5s).'
    } else if (err.message) {
      msg = err.message
    }
    return {
      isAvailable: false,
      models: [],
      error: `${msg} Make sure Ollama is installed and run "ollama serve".`,
    }
  }
}

export async function generateSitemapWithOllama(
  input: GeneratorPromptInput,
  endpoint = DEFAULT_OLLAMA_ENDPOINT,
  modelName = 'llama3',
): Promise<{
  projectData: ReturnType<typeof generateRuleBasedSitemap>
  usedFallback: boolean
  notice?: string
}> {
  // First verify Ollama
  const status = await checkOllamaStatus(endpoint)
  if (!status.isAvailable) {
    console.warn('Ollama unavailable, falling back to rule-based generator:', status.error)
    return {
      projectData: generateRuleBasedSitemap(input),
      usedFallback: true,
      notice: `Local Ollama is offline (${status.error}). Generated sitemap using the high-fidelity offline rule-based engine.`,
    }
  }

  const selectedModel = modelName || (status.models.length > 0 ? status.models[0] : 'llama3')

  const prompt = `You are an expert Information Architect and Web Strategist.
Generate a comprehensive sitemap and page structure for this website:
- Description: ${input.description}
- Target Audience: ${input.targetAudience}
- Goals: ${input.websiteGoals}
- Website Type: ${input.websiteType}
- Target Page Count: ${input.pageCount}
- Requested Features: ${input.requirements.join(', ')}

Respond ONLY with valid JSON in the following format (no conversational prose, no markdown fences):
{
  "pages": [
    {
      "name": "Home",
      "slug": "/",
      "type": "landing",
      "parentSlug": null,
      "description": "Page description",
      "sections": [
        {
          "name": "Navigation Bar",
          "description": "Header with logo and links",
          "type": "navbar",
          "isGlobal": true
        },
        {
          "name": "Hero Section",
          "description": "Primary value proposition",
          "type": "hero",
          "isGlobal": false
        }
      ]
    }
  ]
}
Allowed types for page.type: "landing", "content", "product", "checkout", "dashboard", "auth", "legal", "utility", "blog", "custom".
Allowed types for section.type: "navbar", "hero", "features", "statistics", "content", "testimonials", "faq", "pricing", "contact", "footer", "dashboard", "table", "form", "chart", "cta", "team", "custom".`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const response = await fetch(`${endpoint.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        prompt,
        stream: false,
        format: 'json',
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Ollama generation failed with status ${response.status}`)
    }

    const data = await response.json()
    const responseText = data.response
    const parsed = JSON.parse(responseText)

    if (!parsed.pages || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
      throw new Error('Ollama output missing valid pages array')
    }

    // Convert parsed JSON into full project structure
    const globalNav: GlobalSection = {
      id: `gsec_nav_${Date.now()}`,
      name: 'Primary Header Navigation',
      description: 'Site-wide header navigation',
      type: 'navbar',
      color: '#3b82f6',
    }

    const globalFooter: GlobalSection = {
      id: `gsec_foot_${Date.now()}`,
      name: 'Global Site Footer',
      description: 'Site-wide footer',
      type: 'footer',
      color: '#64748b',
    }

    const slugToIdMap = new Map<string, string>()
    const pages: Page[] = []
    const sections: Section[] = []
    const edges: CanvasEdge[] = []
    const wireframes: Record<string, WireframePageData> = {}

    // First pass: create page IDs
    parsed.pages.forEach((p: any, idx: number) => {
      const pageId = `page_ai_${idx}_${Date.now()}`
      slugToIdMap.set(p.slug || `/${idx}`, pageId)
    })

    // Second pass: construct pages & sections
    parsed.pages.forEach((p: any, idx: number) => {
      const pageId = slugToIdMap.get(p.slug || `/${idx}`)!
      const parentId = p.parentSlug ? slugToIdMap.get(p.parentSlug) || null : null

      const pageSectionIds: string[] = []
      const wireframeComponents: any[] = []

      const rawSections = Array.isArray(p.sections) ? p.sections : []
      rawSections.forEach((s: any, sIdx: number) => {
        const secId = `sec_ai_${idx}_${sIdx}_${Date.now()}`
        let globalSecId: string | null = null
        if (s.isGlobal) {
          if (s.type === 'navbar') globalSecId = globalNav.id
          if (s.type === 'footer') globalSecId = globalFooter.id
        }

        const sec: Section = {
          id: secId,
          pageId,
          globalSectionId: globalSecId,
          name: s.name || `Section ${sIdx + 1}`,
          description: s.description || '',
          type: s.type || 'content',
          isGlobal: !!s.isGlobal,
          position: sIdx,
        }
        sections.push(sec)
        pageSectionIds.push(secId)

        wireframeComponents.push({
          id: `wf_${secId}`,
          sectionId: secId,
          type: sec.type,
          name: sec.name,
          props: {
            headline: sec.name,
            subtext: sec.description,
          },
        })
      })

      const page: Page = {
        id: pageId,
        name: p.name || `Page ${idx + 1}`,
        slug: p.slug || `/${idx}`,
        description: p.description || '',
        type: p.type || 'content',
        parentId,
        sectionIds: pageSectionIds,
        position: { x: 0, y: 0 },
        visibility: 'published',
        notes: '',
      }
      pages.push(page)

      wireframes[pageId] = {
        pageId,
        components: wireframeComponents,
        viewport: 'desktop',
        layoutConfiguration: {
          spacing: 'comfortable',
          showWireframeLabels: true,
          theme: 'wireframe-clean',
        },
      }

      if (parentId) {
        edges.push({
          id: `edge_${parentId}_${pageId}`,
          source: parentId,
          target: pageId,
        })
      }
    })

    return {
      projectData: {
        name: `${input.description.slice(0, 24)} (AI Generated)`,
        pages,
        sections,
        globalSections: [globalNav, globalFooter],
        edges,
        wireframes,
      },
      usedFallback: false,
    }
  } catch (err: any) {
    console.warn('Ollama generation failed, falling back:', err)
    return {
      projectData: generateRuleBasedSitemap(input),
      usedFallback: true,
      notice: `Ollama generation encountered an issue (${err.message || 'Error'}). Safely fell back to rule-based generation.`,
    }
  }
}
