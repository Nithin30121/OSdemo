import { GeneratorPromptInput, Page, Section, GlobalSection, CanvasEdge, WireframePageData, WireframeComponent } from '../../types'
import { getLayoutedElements } from '../../components/canvas/layoutUtils'

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
}

interface GeneratedStructure {
  name: string
  pages: Page[]
  sections: Section[]
  globalSections: GlobalSection[]
  edges: CanvasEdge[]
  wireframes: Record<string, WireframePageData>
}

interface PageBlueprint {
  name: string
  slug: string
  type: Page['type']
  parentIndex: number | null
  description: string
  sections: Array<{
    name: string
    description: string
    type: Section['type']
    isGlobal?: boolean
  }>
}

export function generateRuleBasedSitemap(input: GeneratorPromptInput): GeneratedStructure {
  const brandTitle = input.description.trim() ? input.description.slice(0, 32).trim() : 'New Website'
  const targetCount = Math.max(3, Math.min(input.pageCount || 6, 25))
  const websiteType = (input.websiteType || 'saas').toLowerCase()
  const reqs = new Set((input.requirements || []).map((r) => r.toLowerCase()))

  // Global Header and Footer
  const globalNav: GlobalSection = {
    id: generateId('gsec'),
    name: 'Primary Header Navigation',
    description: `Global navigation for ${brandTitle} with responsive links and call to action`,
    type: 'navbar',
    color: '#3b82f6',
  }

  const globalFooter: GlobalSection = {
    id: generateId('gsec'),
    name: 'Global Site Footer',
    description: `Site-wide footer with secondary links, social links, newsletter, and legal policies`,
    type: 'footer',
    color: '#64748b',
  }

  const blueprints: PageBlueprint[] = []

  // Blueprint 0: Always Home
  blueprints.push({
    name: 'Home',
    slug: '/',
    type: 'landing',
    parentIndex: null,
    description: `Main gateway for ${input.targetAudience || 'visitors'}. ${input.websiteGoals || 'Introduces the core offering.'}`,
    sections: [
      { name: 'Navigation Bar', description: 'Logo, links, and quick action CTA', type: 'navbar', isGlobal: true },
      { name: 'Hero Header', description: `Value proposition tailored to ${input.targetAudience || 'customers'}`, type: 'hero' },
      { name: 'Core Capabilities', description: 'Key benefits and solutions overview', type: 'features' },
      { name: 'Social Proof & Metrics', description: 'User testimonials, ratings, and stats', type: 'testimonials' },
      { name: 'Call to Action', description: 'Primary conversion banner', type: 'cta' },
      { name: 'Footer', description: 'Site links and disclaimers', type: 'footer', isGlobal: true },
    ],
  })

  // Determine blueprints based on type and requested features
  if (websiteType.includes('ecommerce') || websiteType.includes('shop') || websiteType.includes('store')) {
    blueprints.push(
      {
        name: 'Product Catalog',
        slug: '/shop',
        type: 'product',
        parentIndex: 0,
        description: 'Categorized catalog with search, price filters, and product cards',
        sections: [
          { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
          { name: 'Category & Filter Bar', description: 'Faceted search by tag, price, and rating', type: 'content' },
          { name: 'Product Grid', description: 'Product thumbnails, pricing, ratings, and cart buttons', type: 'features' },
          { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
        ],
      },
      {
        name: 'Product Details (PDP)',
        slug: '/shop/:productSlug',
        type: 'product',
        parentIndex: 1,
        description: 'Comprehensive product view with image gallery, specs, and buy box',
        sections: [
          { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
          { name: 'Product Gallery & Buy Box', description: 'Variant selectors, stock count, add-to-bag', type: 'hero' },
          { name: 'Specifications & Materials', description: 'Detailed dimensions, care, and warranty', type: 'content' },
          { name: 'Customer Reviews', description: 'Verified buyer feedback and ratings', type: 'testimonials' },
          { name: 'Related Recommendations', description: 'Cross-sell carousel', type: 'features' },
          { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
        ],
      },
      {
        name: 'Shopping Cart & Checkout',
        slug: '/checkout',
        type: 'checkout',
        parentIndex: 0,
        description: 'Frictionless multi-step payment and shipping address form',
        sections: [
          { name: 'Minimal Header', description: 'Focused checkout banner without distracting links', type: 'navbar' },
          { name: 'Cart Item Review', description: 'Item quantities, coupon discount code input', type: 'content' },
          { name: 'Shipping & Payment Gateway', description: 'Credit card, digital wallet, and billing address', type: 'form' },
          { name: 'Security & Trust Badges', description: 'SSL encryption guarantee and return policy', type: 'statistics' },
        ],
      },
    )
  } else if (websiteType.includes('agency') || websiteType.includes('portfolio') || websiteType.includes('creative')) {
    blueprints.push(
      {
        name: 'Case Studies & Work',
        slug: '/work',
        type: 'content',
        parentIndex: 0,
        description: 'Showcase of selected client projects and creative outcomes',
        sections: [
          { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
          { name: 'Projects Filter', description: 'Filter by branding, digital, and mobile', type: 'content' },
          { name: 'Featured Case Studies', description: 'High-impact project preview cards', type: 'features' },
          { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
        ],
      },
      {
        name: 'Services & Capabilities',
        slug: '/services',
        type: 'content',
        parentIndex: 0,
        description: 'Detailed scope of client engagement models and creative expertise',
        sections: [
          { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
          { name: 'Services Breakdown', description: 'Strategy, design systems, and engineering', type: 'features' },
          { name: 'Process & Timeline', description: 'How we take a project from concept to delivery', type: 'content' },
          { name: 'Client Testimonials', description: 'Quotes from startup founders and enterprise leaders', type: 'testimonials' },
          { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
        ],
      },
    )
  } else {
    // SaaS or General Business / Software
    blueprints.push(
      {
        name: 'Product Features',
        slug: '/features',
        type: 'content',
        parentIndex: 0,
        description: 'Deep dive into feature architecture, workflows, and automated integrations',
        sections: [
          { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
          { name: 'Feature Overview Hero', description: 'Key benefits summary', type: 'hero' },
          { name: 'Interactive Walkthrough', description: 'Step-by-step breakdown of platform tools', type: 'features' },
          { name: 'Performance Benchmarks', description: 'Speed, reliability, and security stats', type: 'statistics' },
          { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
        ],
      },
      {
        name: 'Pricing Plans',
        slug: '/pricing',
        type: 'content',
        parentIndex: 0,
        description: 'Transparent tier comparison with feature matrix and FAQs',
        sections: [
          { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
          { name: 'Pricing Matrix', description: 'Starter, Pro, and Enterprise tiers with monthly/yearly toggle', type: 'pricing' },
          { name: 'Plan Comparison Table', description: 'Feature-by-feature comparison', type: 'table' },
          { name: 'Billing FAQ', description: 'Answers about cancellations, invoices, and refunds', type: 'faq' },
          { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
        ],
      },
    )
  }

  // Check optional requirements and expand blueprints
  if (reqs.has('auth') || reqs.has('dashboard') || reqs.has('accounts') || reqs.has('app')) {
    const authIndex = blueprints.length
    blueprints.push({
      name: 'Sign In & Authentication',
      slug: '/login',
      type: 'auth',
      parentIndex: 0,
      description: 'Unified login and sign-up with SSO and social auth',
      sections: [
        { name: 'Authentication Form', description: 'Email/Password input and OAuth providers', type: 'form' },
        { name: 'Trust & Security Guarantee', description: 'Privacy assurance and customer reviews', type: 'testimonials' },
      ],
    })

    blueprints.push({
      name: 'Application Dashboard',
      slug: '/app/dashboard',
      type: 'dashboard',
      parentIndex: authIndex,
      description: 'Main operational center for active members and workspace owners',
      sections: [
        { name: 'App Header', description: 'Workspace selector, search, notifications', type: 'navbar' },
        { name: 'KPI Metric Cards', description: 'Real-time counters and performance health', type: 'statistics' },
        { name: 'Analytics Activity Chart', description: 'Time-series usage trend graphs', type: 'chart' },
        { name: 'Recent Items Table', description: 'Searchable data table with status indicators', type: 'table' },
      ],
    })
  }

  // About Us / Company
  blueprints.push({
    name: 'About Company',
    slug: '/about',
    type: 'content',
    parentIndex: 0,
    description: 'Founding mission, leadership team, and company culture',
    sections: [
      { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
      { name: 'Mission Manifesto', description: 'Why the company was created and our principles', type: 'hero' },
      { name: 'Leadership & Team', description: 'Executive bios and key contributors', type: 'team' },
      { name: 'Company Milestones', description: 'Timeline of growth and achievements', type: 'statistics' },
      { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
    ],
  })

  // Contact / Support
  blueprints.push({
    name: 'Contact & Support',
    slug: '/contact',
    type: 'content',
    parentIndex: 0,
    description: 'Direct inquiry channel, contact form, and office locations',
    sections: [
      { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
      { name: 'Inquiry & Message Form', description: 'Name, email, category, and message textarea', type: 'contact' },
      { name: 'Helpful Knowledge Links', description: 'Quick links to documentation and status page', type: 'content' },
      { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
    ],
  })

  // Blog / Resources
  if (reqs.has('blog') || blueprints.length < targetCount) {
    const blogIndex = blueprints.length
    blueprints.push({
      name: 'Blog & Editorial',
      slug: '/blog',
      type: 'blog',
      parentIndex: 0,
      description: 'Articles, industry insights, best practice tutorials, and product updates',
      sections: [
        { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
        { name: 'Featured Article Hero', description: 'Top highlighted story with cover image', type: 'hero' },
        { name: 'Article Archive Grid', description: 'Categorized posts with reading time estimates', type: 'features' },
        { name: 'Newsletter Signup', description: 'Email subscription box', type: 'cta' },
        { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
      ],
    })

    if (blueprints.length < targetCount) {
      blueprints.push({
        name: 'Single Post View',
        slug: '/blog/:slug',
        type: 'blog',
        parentIndex: blogIndex,
        description: 'Full-length readable article layout with social sharing and related posts',
        sections: [
          { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
          { name: 'Article Header', description: 'Title, author bio, publish date, estimated read time', type: 'content' },
          { name: 'Rich Article Body', description: 'Markdown prose, code samples, and image callouts', type: 'content' },
          { name: 'Related Articles', description: '3 related articles', type: 'features' },
          { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
        ],
      })
    }
  }

  // FAQ / Help Center
  if (blueprints.length < targetCount) {
    blueprints.push({
      name: 'Help Center & FAQ',
      slug: '/help',
      type: 'content',
      parentIndex: 0,
      description: 'Self-service guides, searchable answers, and troubleshooting articles',
      sections: [
        { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
        { name: 'Search Header', description: 'Instant documentation search box', type: 'hero' },
        { name: 'Category Topics', description: 'Getting Started, Account, Billing, Security', type: 'features' },
        { name: 'Top Questions Accordion', description: 'Expandable answers to common questions', type: 'faq' },
        { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
      ],
    })
  }

  // Legal / Privacy Policy
  if (blueprints.length < targetCount) {
    blueprints.push({
      name: 'Privacy Policy & Terms',
      slug: '/privacy',
      type: 'legal',
      parentIndex: 0,
      description: 'GDPR, CCPA compliance, data processing agreements, and terms of service',
      sections: [
        { name: 'Navigation Bar', description: 'Global header', type: 'navbar', isGlobal: true },
        { name: 'Legal Disclosures', description: 'Formal terms and privacy policies', type: 'content' },
        { name: 'Footer', description: 'Global footer', type: 'footer', isGlobal: true },
      ],
    })
  }

  // Slice blueprints to requested targetCount
  const selectedBlueprints = blueprints.slice(0, targetCount)

  // Construct actual Page, Section, Edge, and Wireframe objects
  const pages: Page[] = []
  const sections: Section[] = []
  const edges: CanvasEdge[] = []
  const wireframes: Record<string, WireframePageData> = {}

  // Assign IDs to all pages first
  const pageIds = selectedBlueprints.map(() => generateId('page'))

  selectedBlueprints.forEach((bp, index) => {
    const pageId = pageIds[index]
    const parentId = bp.parentIndex !== null && bp.parentIndex < pageIds.length ? pageIds[bp.parentIndex] : null

    // Create sections for this page
    const pageSectionIds: string[] = []
    const wireframeComponents: WireframeComponent[] = []

    bp.sections.forEach((secBp, sIdx) => {
      const secId = generateId('sec')
      let globalSecId: string | null = null

      if (secBp.isGlobal) {
        if (secBp.type === 'navbar') globalSecId = globalNav.id
        if (secBp.type === 'footer') globalSecId = globalFooter.id
      }

      const sec: Section = {
        id: secId,
        pageId,
        globalSectionId: globalSecId,
        name: secBp.name,
        description: secBp.description,
        type: secBp.type,
        isGlobal: !!secBp.isGlobal,
        position: sIdx,
      }
      sections.push(sec)
      pageSectionIds.push(secId)

      // Generate wireframe component
      wireframeComponents.push({
        id: generateId('wf'),
        sectionId: secId,
        type: secBp.type,
        name: secBp.name,
        props: {
          headline: secBp.name,
          subtext: secBp.description,
          buttonText: secBp.type === 'hero' ? 'Explore More' : secBp.type === 'cta' ? 'Get Started' : undefined,
          columns: secBp.type === 'features' ? 3 : undefined,
        },
      })
    })

    const page: Page = {
      id: pageId,
      name: bp.name,
      slug: bp.slug,
      description: bp.description,
      type: bp.type,
      parentId,
      sectionIds: pageSectionIds,
      position: { x: 0, y: 0 }, // will be calculated by layout
      visibility: 'published',
      notes: '',
    }
    pages.push(page)

    // Build wireframe data
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

    // Create edge if page has parent
    if (parentId) {
      edges.push({
        id: generateId('edge'),
        source: parentId,
        target: pageId,
      })
    }
  })

  const layouted = getLayoutedElements(pages, edges, 'TB', sections)

  return {
    name: `${brandTitle} Sitemap`,
    pages: layouted.pages,
    sections,
    globalSections: [globalNav, globalFooter],
    edges: layouted.edges,
    wireframes,
  }
}
