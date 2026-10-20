import { Project, Page, Section, GlobalSection, CanvasEdge, PageGroup, WireframePageData, WireframeComponent } from '../../types'
import { getLayoutedElements } from '../../components/canvas/layoutUtils'

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
}

export function createBlankProject(name = 'Untitled Sitemap'): Project {
  const id = generateId('proj')
  const now = new Date().toISOString()
  
  // Create default header and footer global sections
  const globalNav: GlobalSection = {
    id: generateId('gsec'),
    name: 'Primary Navigation Bar',
    description: 'Site-wide header with brand logo, nav links, CTA button, and mobile menu',
    type: 'navbar',
    color: '#3b82f6',
    notes: 'Responsive sticky header with glassmorphism backdrop blur',
  }

  const globalFooter: GlobalSection = {
    id: generateId('gsec'),
    name: 'Global Site Footer',
    description: 'Comprehensive footer with navigation columns, newsletter signup, and copyright',
    type: 'footer',
    color: '#64748b',
    notes: '4-column layout with social links and legal disclaimers',
  }

  const homePageId = generateId('page')
  const navSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    globalSectionId: globalNav.id,
    name: 'Global Navigation',
    description: 'Site-wide header with brand logo and primary links',
    type: 'navbar',
    isGlobal: true,
    position: 0,
  }

  const heroSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    name: 'Hero Section',
    description: 'Impactful headline, value proposition subtext, primary CTA button, and hero preview illustration',
    type: 'hero',
    color: '#8b5cf6',
    isGlobal: false,
    position: 1,
  }

  const logoSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    name: 'Logo Section',
    description: 'Show key customers and trusted brand partners',
    type: 'content',
    color: '#64748b',
    isGlobal: false,
    position: 2,
  }

  const howItWorksSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    name: 'How It Works Section',
    description: 'Describe the 3-step workflow from sitemap to wireframe',
    type: 'features',
    color: '#06b6d4',
    isGlobal: false,
    position: 3,
  }

  const featureSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    name: 'Feature Section',
    description: 'Describe the main visual planning features',
    type: 'features',
    color: '#10b981',
    isGlobal: false,
    position: 4,
  }

  const resultsSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    name: 'Results & Metrics Section',
    description: 'Display user adoption stats and performance metrics',
    type: 'statistics',
    color: '#f59e0b',
    isGlobal: false,
    position: 5,
  }

  const testimonialSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    name: 'Testimonial Section',
    description: 'Customer reviews and feedback from design leads',
    type: 'testimonials',
    color: '#ec4899',
    isGlobal: false,
    position: 6,
  }

  const ctaSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    name: 'CTA Section',
    description: 'Call to action encouraging trial registrations',
    type: 'cta',
    color: '#f43f5e',
    isGlobal: false,
    position: 7,
  }

  const faqSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    name: 'FAQ Section',
    description: 'Frequently asked questions regarding export and plans',
    type: 'faq',
    color: '#6366f1',
    isGlobal: false,
    position: 8,
  }

  const footerSection: Section = {
    id: generateId('sec'),
    pageId: homePageId,
    globalSectionId: globalFooter.id,
    name: 'Footer',
    description: 'Directory links, social handles, and copyright',
    type: 'footer',
    isGlobal: true,
    position: 9,
  }

  const homeSections = [
    navSection,
    heroSection,
    logoSection,
    howItWorksSection,
    featureSection,
    resultsSection,
    testimonialSection,
    ctaSection,
    faqSection,
    footerSection,
  ]

  const homePage: Page = {
    id: homePageId,
    name: 'Home',
    slug: '/',
    description: 'Primary landing page introducing the brand and core value propositions',
    type: 'landing',
    parentId: null,
    sectionIds: homeSections.map((s) => s.id),
    position: { x: 250, y: 100 },
    visibility: 'published',
    notes: 'Primary SEO gateway for search engine indexing',
    color: '#3b82f6',
  }

  const wireframe: WireframePageData = {
    pageId: homePageId,
    components: homeSections.map((sec) => ({
      id: generateId('wf'),
      sectionId: sec.id,
      type: sec.type,
      name: sec.name,
      props: {
        headline: sec.name,
        subtext: sec.description,
        buttonText: sec.type === 'hero' ? 'Start Building Free' : sec.type === 'cta' ? 'Get Started' : undefined,
      },
    })),
    viewport: 'desktop',
    layoutConfiguration: {
      spacing: 'comfortable',
      showWireframeLabels: true,
      theme: 'wireframe-clean',
    },
  }

  const blankProject: Project = {
    id,
    name,
    description: 'Visual sitemap and information architecture plan',
    createdAt: now,
    updatedAt: now,
    pages: [homePage],
    sections: homeSections,
    globalSections: [globalNav, globalFooter],
    edges: [],
    groups: [],
    wireframes: {
      [homePageId]: wireframe,
    },
    settings: {
      defaultTheme: 'system',
      canvasOrientation: 'TB',
    },
    designSystem: {
      colors: [
        { id: 'clr_primary', name: 'Primary Blue', hex: '#1769E8', category: 'primary' },
        { id: 'clr_secondary', name: 'Purple Accent', hex: '#873FF0', category: 'secondary' },
        { id: 'clr_accent', name: 'Bright Yellow', hex: '#F9E52B', category: 'accent' },
        { id: 'clr_dark', name: 'Deep Background', hex: '#080D19', category: 'neutral' },
        { id: 'clr_surface', name: 'Card Surface', hex: '#0D1527', category: 'neutral' },
        { id: 'clr_light', name: 'Warm Cream Text', hex: '#F8F5EF', category: 'neutral' },
        { id: 'clr_alert', name: 'Crimson Alert', hex: '#F04444', category: 'semantic' },
        { id: 'clr_success', name: 'Emerald Success', hex: '#10B981', category: 'semantic' },
      ],
      typography: [
        { id: 'txt_h1', name: 'Display H1', fontFamily: 'Inter', fontSize: 36, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.5 },
        { id: 'txt_h2', name: 'Heading H2', fontFamily: 'Inter', fontSize: 24, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.2 },
        { id: 'txt_h3', name: 'Heading H3', fontFamily: 'Inter', fontSize: 18, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
        { id: 'txt_body_lg', name: 'Body Large', fontFamily: 'Inter', fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
        { id: 'txt_body', name: 'Body Default', fontFamily: 'Inter', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
        { id: 'txt_caption', name: 'Caption / Meta', fontFamily: 'Inter', fontSize: 12, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0.2 },
      ],
    },
  }

  const layouted = getLayoutedElements(blankProject.pages, blankProject.edges, 'TB', blankProject.sections)
  blankProject.pages = layouted.pages
  blankProject.edges = layouted.edges

  return blankProject
}

export interface TemplateDefinition {
  id: string
  name: string
  category: string
  description: string
  tags: string[]
  createProject: () => Project
}

export function createSaaSTemplate(): Project {
  const p = createBlankProject('SaaS Platform Sitemap')
  p.description = 'Complete B2B SaaS architecture including Marketing, Onboarding, Pricing, and Dashboard'
  
  const gNav = p.globalSections[0]
  const gFoot = p.globalSections[1]

  const marketingGroup: PageGroup = {
    id: generateId('grp'),
    name: 'Marketing & Conversion',
    description: 'Public-facing acquisition pages',
    color: '#3b82f6',
    collapsed: false,
  }

  const appGroup: PageGroup = {
    id: generateId('grp'),
    name: 'Product & Dashboard',
    description: 'Authenticated application workspace',
    color: '#10b981',
    collapsed: false,
  }

  p.groups = [marketingGroup, appGroup]
  const home = p.pages[0]
  home.groupId = marketingGroup.id

  // 1. Features Page
  const featPageId = generateId('page')
  const fNav: Section = { id: generateId('sec'), pageId: featPageId, globalSectionId: gNav.id, name: 'Global Nav', description: 'Site header', type: 'navbar', isGlobal: true, position: 0 }
  const fHero: Section = { id: generateId('sec'), pageId: featPageId, name: 'Features Hero', description: 'Overview of platform capabilities', type: 'hero', isGlobal: false, position: 1 }
  const fDeep: Section = { id: generateId('sec'), pageId: featPageId, name: 'Feature Breakdown & Demos', description: 'Detailed breakdown of modules with video/screenshots', type: 'content', isGlobal: false, position: 2 }
  const fCta: Section = { id: generateId('sec'), pageId: featPageId, name: 'Conversion Callout', description: 'Direct CTA to free trial', type: 'cta', isGlobal: false, position: 3 }
  const fFoot: Section = { id: generateId('sec'), pageId: featPageId, globalSectionId: gFoot.id, name: 'Global Footer', description: 'Site footer', type: 'footer', isGlobal: true, position: 4 }
  
  const featPage: Page = {
    id: featPageId,
    name: 'Features & Capabilities',
    slug: '/features',
    description: 'Deep dive into workflow automation, analytics, and security tools',
    type: 'content',
    parentId: home.id,
    groupId: marketingGroup.id,
    sectionIds: [fNav.id, fHero.id, fDeep.id, fCta.id, fFoot.id],
    position: { x: 50, y: 340 },
    visibility: 'published',
    notes: 'Key buyer consideration page',
  }

  // 2. Pricing Page
  const pricePageId = generateId('page')
  const pNav: Section = { id: generateId('sec'), pageId: pricePageId, globalSectionId: gNav.id, name: 'Global Nav', description: 'Site header', type: 'navbar', isGlobal: true, position: 0 }
  const pHero: Section = { id: generateId('sec'), pageId: pricePageId, name: 'Pricing Tiers', description: 'Starter, Pro, and Enterprise tiers with monthly/annual toggle', type: 'pricing', isGlobal: false, position: 1 }
  const pFaq: Section = { id: generateId('sec'), pageId: pricePageId, name: 'Pricing FAQ', description: 'Answers regarding billing, refunds, and team seats', type: 'faq', isGlobal: false, position: 2 }
  const pFoot: Section = { id: generateId('sec'), pageId: pricePageId, globalSectionId: gFoot.id, name: 'Global Footer', description: 'Site footer', type: 'footer', isGlobal: true, position: 3 }

  const pricePage: Page = {
    id: pricePageId,
    name: 'Pricing Plans',
    slug: '/pricing',
    description: 'Transparent tier comparison with feature matrix and FAQs',
    type: 'content',
    parentId: home.id,
    groupId: marketingGroup.id,
    sectionIds: [pNav.id, pHero.id, pFaq.id, pFoot.id],
    position: { x: 380, y: 340 },
    visibility: 'published',
    notes: 'High intent page, emphasize self-serve signups',
  }

  // 3. Auth / Signup
  const authPageId = generateId('page')
  const aForm: Section = { id: generateId('sec'), pageId: authPageId, name: 'Signup / SSO Form', description: 'Email signup + Google / GitHub OAuth', type: 'form', isGlobal: false, position: 0 }
  const aTest: Section = { id: generateId('sec'), pageId: authPageId, name: 'Social Proof Sidebar', description: 'Customer testimonials and badges', type: 'testimonials', isGlobal: false, position: 1 }
  
  const authPage: Page = {
    id: authPageId,
    name: 'Sign Up / Onboarding',
    slug: '/signup',
    description: 'Minimal friction account registration flow',
    type: 'auth',
    parentId: home.id,
    groupId: appGroup.id,
    sectionIds: [aForm.id, aTest.id],
    position: { x: 700, y: 340 },
    visibility: 'published',
    notes: 'Streamlined conversion funnel',
  }

  // 4. App Dashboard
  const dashPageId = generateId('page')
  const dNav: Section = { id: generateId('sec'), pageId: dashPageId, name: 'Dashboard Header', description: 'Workspace switcher, notifications, user avatar', type: 'navbar', isGlobal: false, position: 0 }
  const dStats: Section = { id: generateId('sec'), pageId: dashPageId, name: 'KPI Summary Cards', description: 'Revenue, Active Users, Pipeline conversion', type: 'statistics', isGlobal: false, position: 1 }
  const dCharts: Section = { id: generateId('sec'), pageId: dashPageId, name: 'Activity Analytics Chart', description: 'Time-series growth trend graphs', type: 'chart', isGlobal: false, position: 2 }
  const dTable: Section = { id: generateId('sec'), pageId: dashPageId, name: 'Recent Projects Table', description: 'Paginated data table with sorting and bulk actions', type: 'table', isGlobal: false, position: 3 }

  const dashPage: Page = {
    id: dashPageId,
    name: 'Main App Dashboard',
    slug: '/app/dashboard',
    description: 'Core daily workspace for active users',
    type: 'dashboard',
    parentId: authPage.id,
    groupId: appGroup.id,
    sectionIds: [dNav.id, dStats.id, dCharts.id, dTable.id],
    position: { x: 700, y: 560 },
    visibility: 'published',
    notes: 'Authenticated primary user interface',
  }

  // Combine sections
  p.sections.push(fNav, fHero, fDeep, fCta, fFoot, pNav, pHero, pFaq, pFoot, aForm, aTest, dNav, dStats, dCharts, dTable)
  p.pages.push(featPage, pricePage, authPage, dashPage)

  // Edges
  p.edges = [
    { id: generateId('edge'), source: home.id, target: featPage.id },
    { id: generateId('edge'), source: home.id, target: pricePage.id },
    { id: generateId('edge'), source: home.id, target: authPage.id },
    { id: generateId('edge'), source: authPage.id, target: dashPage.id },
  ]

  // Add wireframes for each page
  p.wireframes[featPageId] = {
    pageId: featPageId,
    components: [
      { id: generateId('wf'), sectionId: fNav.id, type: 'navbar', name: 'Header', props: { headline: 'BrandLogo', subtext: 'Features, Pricing, Docs' } },
      { id: generateId('wf'), sectionId: fHero.id, type: 'hero', name: 'Feature Highlights', props: { headline: 'Supercharge Your Workflow', subtext: 'Explore intelligent tooling designed for high-velocity teams.' } },
      { id: generateId('wf'), sectionId: fDeep.id, type: 'content', name: 'Feature Details', props: { headline: 'Built for Scale', subtext: 'Interactive canvas, automated layouts, and versioning.' } },
      { id: generateId('wf'), sectionId: fCta.id, type: 'cta', name: 'CTA Banner', props: { headline: 'Ready to Map Your Product?', buttonText: 'Get Started Today' } },
      { id: generateId('wf'), sectionId: fFoot.id, type: 'footer', name: 'Footer', props: { headline: 'SaaS Platform' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  p.wireframes[pricePageId] = {
    pageId: pricePageId,
    components: [
      { id: generateId('wf'), sectionId: pNav.id, type: 'navbar', name: 'Header', props: { headline: 'BrandLogo' } },
      { id: generateId('wf'), sectionId: pHero.id, type: 'pricing', name: 'Pricing Tiers', props: { headline: 'Simple, Predictable Pricing', subtext: 'Choose the plan that best fits your organizational goals.' } },
      { id: generateId('wf'), sectionId: pFaq.id, type: 'faq', name: 'FAQ Accordion', props: { headline: 'Frequently Asked Questions' } },
      { id: generateId('wf'), sectionId: pFoot.id, type: 'footer', name: 'Footer', props: { headline: 'SaaS Platform' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  p.wireframes[authPageId] = {
    pageId: authPageId,
    components: [
      { id: generateId('wf'), sectionId: aForm.id, type: 'form', name: 'Sign Up Form', props: { headline: 'Create Your Workspace', subtext: 'No credit card required. Free 14-day trial.', buttonText: 'Create Account' } },
      { id: generateId('wf'), sectionId: aTest.id, type: 'testimonials', name: 'Customer Quote', props: { headline: 'Loved by 10,000+ Designers', subtext: '"This replaced 3 different tools in our discovery workflow."' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  p.wireframes[dashPageId] = {
    pageId: dashPageId,
    components: [
      { id: generateId('wf'), sectionId: dNav.id, type: 'navbar', name: 'Dashboard Header', props: { headline: 'Dashboard', subtext: 'Overview, Analytics, Team, Settings' } },
      { id: generateId('wf'), sectionId: dStats.id, type: 'statistics', name: 'Metrics Summary', props: { headline: 'Key Performance Indicators' } },
      { id: generateId('wf'), sectionId: dCharts.id, type: 'chart', name: 'Growth Trends', props: { headline: 'Usage & Velocity' } },
      { id: generateId('wf'), sectionId: dTable.id, type: 'table', name: 'Projects List', props: { headline: 'Active Sitemaps' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  const layouted = getLayoutedElements(p.pages, p.edges, 'TB', p.sections)
  p.pages = layouted.pages
  p.edges = layouted.edges

  return p
}

export function createECommerceTemplate(): Project {
  const p = createBlankProject('E-Commerce Storefront')
  p.description = 'Modern online shop with Catalog, Product Detail, Cart, and Checkout'
  
  const gNav = p.globalSections[0]
  const gFoot = p.globalSections[1]

  const shopGroup: PageGroup = {
    id: generateId('grp'),
    name: 'Shop & Catalog',
    description: 'Browsing and product discovery',
    color: '#ec4899',
    collapsed: false,
  }

  const checkoutGroup: PageGroup = {
    id: generateId('grp'),
    name: 'Checkout & Account',
    description: 'Transaction and fulfillment flow',
    color: '#8b5cf6',
    collapsed: false,
  }

  p.groups = [shopGroup, checkoutGroup]
  const home = p.pages[0]
  home.groupId = shopGroup.id

  // Catalog
  const catPageId = generateId('page')
  const cNav: Section = { id: generateId('sec'), pageId: catPageId, globalSectionId: gNav.id, name: 'Global Nav', description: 'Header', type: 'navbar', isGlobal: true, position: 0 }
  const cFilter: Section = { id: generateId('sec'), pageId: catPageId, name: 'Filter & Category Bar', description: 'Filter by tags, price, size, availability', type: 'content', isGlobal: false, position: 1 }
  const cGrid: Section = { id: generateId('sec'), pageId: catPageId, name: 'Product Grid', description: 'Card layout with pricing, ratings, and quick add-to-cart', type: 'features', isGlobal: false, position: 2 }
  const cFoot: Section = { id: generateId('sec'), pageId: catPageId, globalSectionId: gFoot.id, name: 'Global Footer', description: 'Footer', type: 'footer', isGlobal: true, position: 3 }

  const catPage: Page = {
    id: catPageId,
    name: 'Collection Catalog',
    slug: '/shop',
    description: 'Product listing with faceted search and filter sidebar',
    type: 'product',
    parentId: home.id,
    groupId: shopGroup.id,
    sectionIds: [cNav.id, cFilter.id, cGrid.id, cFoot.id],
    position: { x: 50, y: 340 },
    visibility: 'published',
    notes: 'Category archive page',
  }

  // Product Detail
  const pdpPageId = generateId('page')
  const pdpNav: Section = { id: generateId('sec'), pageId: pdpPageId, globalSectionId: gNav.id, name: 'Global Nav', description: 'Header', type: 'navbar', isGlobal: true, position: 0 }
  const pdpHero: Section = { id: generateId('sec'), pageId: pdpPageId, name: 'Product Gallery & Buy Box', description: 'Image carousel, variant selectors, add to bag, stock status', type: 'hero', isGlobal: false, position: 1 }
  const pdpReviews: Section = { id: generateId('sec'), pageId: pdpPageId, name: 'Customer Reviews & UGC', description: 'Verified buyer testimonials and star ratings', type: 'testimonials', isGlobal: false, position: 2 }
  const pdpFoot: Section = { id: generateId('sec'), pageId: pdpPageId, globalSectionId: gFoot.id, name: 'Global Footer', description: 'Footer', type: 'footer', isGlobal: true, position: 3 }

  const pdpPage: Page = {
    id: pdpPageId,
    name: 'Product Details (PDP)',
    slug: '/products/:slug',
    description: 'Detailed showcase of product specifications, gallery, and reviews',
    type: 'product',
    parentId: catPage.id,
    groupId: shopGroup.id,
    sectionIds: [pdpNav.id, pdpHero.id, pdpReviews.id, pdpFoot.id],
    position: { x: 50, y: 560 },
    visibility: 'published',
    notes: 'Primary transaction conversion page',
  }

  // Checkout
  const checkPageId = generateId('page')
  const chNav: Section = { id: generateId('sec'), pageId: checkPageId, name: 'Distraction-Free Checkout Header', description: 'Minimalist logo and security guarantees', type: 'navbar', isGlobal: false, position: 0 }
  const chForm: Section = { id: generateId('sec'), pageId: checkPageId, name: 'Shipping & Payment Form', description: 'Address, payment gateway, express checkout', type: 'form', isGlobal: false, position: 1 }
  const chSummary: Section = { id: generateId('sec'), pageId: checkPageId, name: 'Order Summary Box', description: 'Line items, discounts, shipping tax calculation', type: 'content', isGlobal: false, position: 2 }

  const checkPage: Page = {
    id: checkPageId,
    name: 'Secure Checkout',
    slug: '/checkout',
    description: 'Single-page high conversion checkout experience',
    type: 'checkout',
    parentId: home.id,
    groupId: checkoutGroup.id,
    sectionIds: [chNav.id, chForm.id, chSummary.id],
    position: { x: 450, y: 340 },
    visibility: 'published',
    notes: 'Optimized for mobile payment gateways',
  }

  p.sections.push(cNav, cFilter, cGrid, cFoot, pdpNav, pdpHero, pdpReviews, pdpFoot, chNav, chForm, chSummary)
  p.pages.push(catPage, pdpPage, checkPage)

  p.edges = [
    { id: generateId('edge'), source: home.id, target: catPage.id },
    { id: generateId('edge'), source: catPage.id, target: pdpPage.id },
    { id: generateId('edge'), source: home.id, target: checkPage.id },
  ]

  p.wireframes[catPageId] = {
    pageId: catPageId,
    components: [
      { id: generateId('wf'), sectionId: cNav.id, type: 'navbar', name: 'Header', props: { headline: 'STORE' } },
      { id: generateId('wf'), sectionId: cFilter.id, type: 'content', name: 'Filters', props: { headline: 'All Products (48)', subtext: 'Sort by: Featured, Newest, Price' } },
      { id: generateId('wf'), sectionId: cGrid.id, type: 'features', name: 'Product Grid', props: { headline: 'Curated Items', columns: 4 } },
      { id: generateId('wf'), sectionId: cFoot.id, type: 'footer', name: 'Footer', props: { headline: 'Store' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  p.wireframes[pdpPageId] = {
    pageId: pdpPageId,
    components: [
      { id: generateId('wf'), sectionId: pdpNav.id, type: 'navbar', name: 'Header', props: { headline: 'STORE' } },
      { id: generateId('wf'), sectionId: pdpHero.id, type: 'hero', name: 'Product View', props: { headline: 'Premium Minimalist Watch', subtext: '$249.00 — In Stock. Ships in 24 hours.', buttonText: 'Add to Cart' } },
      { id: generateId('wf'), sectionId: pdpReviews.id, type: 'testimonials', name: 'Reviews', props: { headline: 'Customer Ratings (4.9 / 5)' } },
      { id: generateId('wf'), sectionId: pdpFoot.id, type: 'footer', name: 'Footer', props: { headline: 'Store' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  p.wireframes[checkPageId] = {
    pageId: checkPageId,
    components: [
      { id: generateId('wf'), sectionId: chNav.id, type: 'navbar', name: 'Checkout Header', props: { headline: '🔒 Secure Checkout' } },
      { id: generateId('wf'), sectionId: chForm.id, type: 'form', name: 'Payment Fields', props: { headline: 'Shipping & Payment', buttonText: 'Complete Purchase' } },
      { id: generateId('wf'), sectionId: chSummary.id, type: 'content', name: 'Cart Summary', props: { headline: 'Order Total: $249.00' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  const layoutedEcom = getLayoutedElements(p.pages, p.edges, 'TB', p.sections)
  p.pages = layoutedEcom.pages
  p.edges = layoutedEcom.edges

  return p
}

export function createAgencyTemplate(): Project {
  const p = createBlankProject('Agency / Portfolio Sitemap')
  p.description = 'Showcase agency projects, team capabilities, case studies, and client contact'
  
  const gNav = p.globalSections[0]
  const gFoot = p.globalSections[1]

  const home = p.pages[0]

  // Work / Case Studies
  const workPageId = generateId('page')
  const wNav: Section = { id: generateId('sec'), pageId: workPageId, globalSectionId: gNav.id, name: 'Global Nav', description: 'Header', type: 'navbar', isGlobal: true, position: 0 }
  const wHero: Section = { id: generateId('sec'), pageId: workPageId, name: 'Selected Work Portfolio', description: 'Curated gallery of client case studies and awards', type: 'features', isGlobal: false, position: 1 }
  const wFoot: Section = { id: generateId('sec'), pageId: workPageId, globalSectionId: gFoot.id, name: 'Global Footer', description: 'Footer', type: 'footer', isGlobal: true, position: 2 }

  const workPage: Page = {
    id: workPageId,
    name: 'Case Studies & Work',
    slug: '/work',
    description: 'In-depth case studies documenting strategy, design, and impact',
    type: 'content',
    parentId: home.id,
    sectionIds: [wNav.id, wHero.id, wFoot.id],
    position: { x: 50, y: 340 },
    visibility: 'published',
    notes: 'Primary demonstration of expertise',
  }

  // About / Team
  const aboutPageId = generateId('page')
  const abNav: Section = { id: generateId('sec'), pageId: aboutPageId, globalSectionId: gNav.id, name: 'Global Nav', description: 'Header', type: 'navbar', isGlobal: true, position: 0 }
  const abHero: Section = { id: generateId('sec'), pageId: aboutPageId, name: 'Agency Manifesto', description: 'Our philosophy, values, and history', type: 'hero', isGlobal: false, position: 1 }
  const abTeam: Section = { id: generateId('sec'), pageId: aboutPageId, name: 'Leadership & Team', description: 'Grid of studio partners, directors, and creatives', type: 'team', isGlobal: false, position: 2 }
  const abFoot: Section = { id: generateId('sec'), pageId: aboutPageId, globalSectionId: gFoot.id, name: 'Global Footer', description: 'Footer', type: 'footer', isGlobal: true, position: 3 }

  const aboutPage: Page = {
    id: aboutPageId,
    name: 'About Studio',
    slug: '/about',
    description: 'Agency culture, leadership bios, and creative principles',
    type: 'content',
    parentId: home.id,
    sectionIds: [abNav.id, abHero.id, abTeam.id, abFoot.id],
    position: { x: 380, y: 340 },
    visibility: 'published',
    notes: 'Humanizing the studio',
  }

  // Contact
  const contPageId = generateId('page')
  const ctNav: Section = { id: generateId('sec'), pageId: contPageId, globalSectionId: gNav.id, name: 'Global Nav', description: 'Header', type: 'navbar', isGlobal: true, position: 0 }
  const ctForm: Section = { id: generateId('sec'), pageId: contPageId, name: 'Project Inquiry Form', description: 'Budget selection, timeline, scope definition', type: 'contact', isGlobal: false, position: 1 }
  const ctFoot: Section = { id: generateId('sec'), pageId: contPageId, globalSectionId: gFoot.id, name: 'Global Footer', description: 'Footer', type: 'footer', isGlobal: true, position: 2 }

  const contPage: Page = {
    id: contPageId,
    name: 'Start a Project (Contact)',
    slug: '/contact',
    description: 'Inquiry questionnaire and office locations',
    type: 'content',
    parentId: home.id,
    sectionIds: [ctNav.id, ctForm.id, ctFoot.id],
    position: { x: 700, y: 340 },
    visibility: 'published',
    notes: 'High-touch enterprise leads',
  }

  p.sections.push(wNav, wHero, wFoot, abNav, abHero, abTeam, abFoot, ctNav, ctForm, ctFoot)
  p.pages.push(workPage, aboutPage, contPage)

  p.edges = [
    { id: generateId('edge'), source: home.id, target: workPage.id },
    { id: generateId('edge'), source: home.id, target: aboutPage.id },
    { id: generateId('edge'), source: home.id, target: contPage.id },
  ]

  p.wireframes[workPageId] = {
    pageId: workPageId,
    components: [
      { id: generateId('wf'), sectionId: wNav.id, type: 'navbar', name: 'Header', props: { headline: 'STUDIO' } },
      { id: generateId('wf'), sectionId: wHero.id, type: 'features', name: 'Projects Grid', props: { headline: 'Award Winning Work', subtext: 'Digital products, brand identities, and design systems.' } },
      { id: generateId('wf'), sectionId: wFoot.id, type: 'footer', name: 'Footer', props: { headline: 'Studio' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  p.wireframes[aboutPageId] = {
    pageId: aboutPageId,
    components: [
      { id: generateId('wf'), sectionId: abNav.id, type: 'navbar', name: 'Header', props: { headline: 'STUDIO' } },
      { id: generateId('wf'), sectionId: abHero.id, type: 'hero', name: 'Manifesto', props: { headline: 'We Build Digital Futures', subtext: 'A cross-disciplinary team obsessed with quality and craftsmanship.' } },
      { id: generateId('wf'), sectionId: abTeam.id, type: 'team', name: 'Team Grid', props: { headline: 'The Minds Behind the Work' } },
      { id: generateId('wf'), sectionId: abFoot.id, type: 'footer', name: 'Footer', props: { headline: 'Studio' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  p.wireframes[contPageId] = {
    pageId: contPageId,
    components: [
      { id: generateId('wf'), sectionId: ctNav.id, type: 'navbar', name: 'Header', props: { headline: 'STUDIO' } },
      { id: generateId('wf'), sectionId: ctForm.id, type: 'contact', name: 'Inquiry Form', props: { headline: 'Let’s Create Something Great', subtext: 'Tell us about your project vision, timeline, and goals.', buttonText: 'Send Project Brief' } },
      { id: generateId('wf'), sectionId: ctFoot.id, type: 'footer', name: 'Footer', props: { headline: 'Studio' } },
    ],
    viewport: 'desktop',
    layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
  }

  const layoutedAgency = getLayoutedElements(p.pages, p.edges, 'TB', p.sections)
  p.pages = layoutedAgency.pages
  p.edges = layoutedAgency.edges

  return p
}

export function createKLConnectTemplate(): Project {
  const p = createBlankProject('KLConnect')
  p.description = 'Student portal information architecture and academic schedule planner.'

  // Global header & footer
  const globalNav = p.globalSections[0]
  const globalFooter = p.globalSections[1]

  p.pages = []
  p.sections = []
  p.edges = []
  p.wireframes = {}

  interface PageDef {
    name: string
    slug: string
    category: string
    color: string
    type: Page['type']
    parentIdx: number | null
    description: string
    sections: Array<{ name: string; description?: string; type: Section['type']; isFeatured?: boolean }>
  }

  const pageDefs: PageDef[] = [
    {
      name: 'Home Page',
      slug: '/',
      category: '01 / DASHBOARD',
      color: 'cobalt',
      type: 'dashboard',
      parentIdx: null,
      description: 'Main dashboard for students. Shows today’s timetable, next class, attendance and quick actions.',
      sections: [
        { name: 'Navbar', type: 'navbar' },
        { name: 'Hero Section', description: 'Your academic overview at a glance', type: 'hero', isFeatured: true },
        { name: "Today's Timetable", description: 'Next class and countdown', type: 'content' },
        { name: 'Quick Actions', description: 'Shortcuts to important features', type: 'features' },
        { name: 'Feature Section', description: 'Core benefits for students', type: 'features' },
        { name: 'Testimonials', description: 'What students say', type: 'testimonials' },
        { name: 'CTA Section', description: 'Get started now', type: 'cta' },
        { name: 'Footer', type: 'footer' },
      ],
    },
    {
      name: 'Timetable',
      slug: '/timetable',
      category: '02 / ACADEMICS',
      color: 'red',
      type: 'content',
      parentIdx: 0,
      description: 'Weekly schedule and daily classroom lecture timetable.',
      sections: [
        { name: 'Navbar', type: 'navbar' },
        { name: 'Weekly Calendar', description: 'View your class schedule', type: 'content' },
        { name: 'Daily View', type: 'content' },
        { name: 'Subject Details', type: 'content' },
        { name: 'Faculty & Classroom', type: 'content' },
        { name: 'Filters & Search', type: 'content' },
        { name: 'Footer', type: 'footer' },
      ],
    },
    {
      name: 'Attendance',
      slug: '/attendance',
      category: '03 / TRACKING',
      color: 'yellow',
      type: 'content',
      parentIdx: 0,
      description: 'Attendance tracking, target percentage calculators, and insights.',
      sections: [
        { name: 'Navbar', type: 'navbar' },
        { name: 'Overall Attendance', description: 'Your current percentage', type: 'statistics' },
        { name: 'Subject-wise Attendance', type: 'content' },
        { name: 'Target Calculator', type: 'form' },
        { name: 'LTPS Breakdown', type: 'statistics' },
        { name: 'Charts & Insights', type: 'chart' },
        { name: 'Footer', type: 'footer' },
      ],
    },
    {
      name: 'Grades',
      slug: '/grades',
      category: '04 / RESULTS',
      color: 'purple',
      type: 'content',
      parentIdx: 0,
      description: 'Semester results, CGPA overview, and grade reports.',
      sections: [
        { name: 'Navbar', type: 'navbar' },
        { name: 'Semester Results', type: 'content' },
        { name: 'Subject Performance', type: 'statistics' },
        { name: 'CGPA Overview', type: 'statistics' },
        { name: 'Academic History', type: 'content' },
        { name: 'Download Reports', type: 'cta' },
        { name: 'Footer', type: 'footer' },
      ],
    },
    {
      name: 'Friends',
      slug: '/friends',
      category: '05 / SOCIAL',
      color: 'teal',
      type: 'content',
      parentIdx: 0,
      description: 'Connect with peers, compare timetables, and find free periods.',
      sections: [
        { name: 'Navbar', type: 'navbar' },
        { name: 'My Friends', type: 'team' },
        { name: 'Compare Timetables', type: 'features' },
        { name: 'Common Free Periods', type: 'content' },
        { name: 'Share Schedule', type: 'cta' },
        { name: 'Friend Requests', type: 'form' },
        { name: 'Footer', type: 'footer' },
      ],
    },
    {
      name: 'Notifications',
      slug: '/notifications',
      category: '06 / ALERTS',
      color: 'pink',
      type: 'utility',
      parentIdx: 0,
      description: 'Real-time class reminders, schedule changes, and exam announcements.',
      sections: [
        { name: 'Navbar', type: 'navbar' },
        { name: 'Class Reminders', type: 'content' },
        { name: 'Timetable Changes', type: 'content' },
        { name: 'Exam Announcements', type: 'content' },
        { name: 'Attendance Warnings', type: 'content' },
        { name: 'General Notifications', type: 'content' },
        { name: 'Footer', type: 'footer' },
      ],
    },
    {
      name: 'Profile',
      slug: '/profile',
      category: '07 / ACCOUNT',
      color: 'cream',
      type: 'custom',
      parentIdx: 3, // Connected under Grades in tree
      description: 'User preferences, account details, and security settings.',
      sections: [
        { name: 'Navbar', type: 'navbar' },
        { name: 'Personal Information', type: 'form' },
        { name: 'Preferences', type: 'content' },
        { name: 'Privacy & Security', type: 'content' },
        { name: 'Connected Accounts', type: 'content' },
        { name: 'Footer', type: 'footer' },
      ],
    },
    {
      name: 'Login / Sign Up',
      slug: '/auth',
      category: '08 / AUTH',
      color: 'cobalt',
      type: 'auth',
      parentIdx: 3, // Connected under Grades in tree
      description: 'Authentication and student registration gateway.',
      sections: [
        { name: 'Navbar', type: 'navbar' },
        { name: 'Login Form', type: 'form' },
        { name: 'Registration', type: 'form' },
        { name: 'University Verification', type: 'content' },
        { name: 'Forgot Password', type: 'form' },
        { name: 'Footer', type: 'footer' },
      ],
    },
  ]

  const createdPageIds: string[] = []

  pageDefs.forEach((def, pIdx) => {
    const pageId = generateId('page')
    createdPageIds.push(pageId)

    const sectionIds: string[] = []
    def.sections.forEach((sDef, sIdx) => {
      const secId = generateId('sec')
      sectionIds.push(secId)

      let gSecId: string | null = null
      if (sDef.name === 'Navbar') gSecId = globalNav.id
      if (sDef.name === 'Footer') gSecId = globalFooter.id

      p.sections.push({
        id: secId,
        pageId,
        globalSectionId: gSecId,
        name: sDef.name,
        description: sDef.description || '',
        type: sDef.type,
        color: sDef.isFeatured ? '#F9E52B' : undefined,
        isGlobal: !!gSecId,
        position: sIdx,
        notes: sDef.isFeatured ? 'featured' : '',
      })
    })

    const parentId = def.parentIdx !== null ? createdPageIds[def.parentIdx] : null

    p.pages.push({
      id: pageId,
      name: def.name,
      slug: def.slug,
      description: def.description,
      type: def.type,
      parentId,
      sectionIds,
      position: { x: 0, y: 0 },
      visibility: 'published',
      notes: def.category,
      color: def.color,
    })

    if (parentId) {
      p.edges.push({
        id: generateId('edge'),
        source: parentId,
        target: pageId,
      })
    }

    p.wireframes[pageId] = {
      pageId,
      components: sectionIds.map((secId, i) => ({
        id: generateId('wf'),
        sectionId: secId,
        type: def.sections[i].type,
        name: def.sections[i].name,
        props: {
          headline: def.sections[i].name,
          subtext: def.sections[i].description,
        },
      })),
      viewport: 'desktop',
      layoutConfiguration: { spacing: 'comfortable', showWireframeLabels: true, theme: 'wireframe-clean' },
    }
  })

  const layouted = getLayoutedElements(p.pages, p.edges, 'TB', p.sections)
  p.pages = layouted.pages
  p.edges = layouted.edges

  return p
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'klconnect',
    name: 'KLConnect (Neo-Brutalist)',
    category: 'Education & Student Portal',
    description: 'Vibrant neo-brutalist student portal with colorful cards, cream sections, and clean tree hierarchy.',
    tags: ['Neo-Brutalist', 'Dashboard', 'Academics', 'Poster'],
    createProject: createKLConnectTemplate,
  },
  {
    id: 'saas',
    name: 'SaaS Platform & App',
    category: 'Software & Technology',
    description: 'Complete architecture for modern web applications: marketing, pricing, auth, and dashboard.',
    tags: ['SaaS', 'B2B', 'Dashboard', 'Pricing'],
    createProject: createSaaSTemplate,
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Storefront',
    category: 'Retail & Commerce',
    description: 'High-converting online store with categories, product details, cart, and checkout.',
    tags: ['E-Commerce', 'Shop', 'Checkout', 'Catalog'],
    createProject: createECommerceTemplate,
  },
  {
    id: 'agency',
    name: 'Design Agency / Portfolio',
    category: 'Creative & Services',
    description: 'Polished portfolio for design studios, agencies, and consultancies.',
    tags: ['Agency', 'Portfolio', 'Case Studies', 'Creative'],
    createProject: createAgencyTemplate,
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    category: 'Custom',
    description: 'Start from scratch with a basic homepage and reusable global header and footer.',
    tags: ['Minimal', 'Custom', 'Clean'],
    createProject: () => createBlankProject('New Sitemap Project'),
  },
]

