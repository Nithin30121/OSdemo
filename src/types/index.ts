export type PageType =
  | 'landing'
  | 'content'
  | 'product'
  | 'checkout'
  | 'dashboard'
  | 'auth'
  | 'legal'
  | 'utility'
  | 'blog'
  | 'custom'

export type SectionType =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'statistics'
  | 'content'
  | 'testimonials'
  | 'faq'
  | 'pricing'
  | 'contact'
  | 'footer'
  | 'dashboard'
  | 'table'
  | 'form'
  | 'chart'
  | 'cta'
  | 'team'
  | 'custom'

export type PageVisibility = 'published' | 'draft' | 'archived' | 'hidden'

export interface Section {
  id: string
  pageId: string
  globalSectionId?: string | null
  name: string
  description: string
  type: SectionType
  customTypeName?: string
  color?: string
  isGlobal: boolean
  position: number
  notes?: string
}

export interface GlobalSection {
  id: string
  name: string
  description: string
  type: SectionType
  color?: string
  notes?: string
  linkedPageCount?: number
}

export interface Page {
  id: string
  name: string
  slug: string
  description: string
  type: PageType
  customTypeName?: string
  parentId: string | null
  groupId?: string | null
  sectionIds: string[]
  position: { x: number; y: number }
  visibility: PageVisibility
  notes: string
  color?: string
}

export interface PageGroup {
  id: string
  name: string
  description?: string
  color: string
  collapsed: boolean
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  label?: string
  type?: string
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile'

export interface WireframeComponent {
  id: string
  sectionId: string
  type: SectionType
  name: string
  props: {
    headline?: string
    subtext?: string
    buttonText?: string
    secondaryButtonText?: string
    badgeText?: string
    itemsCount?: number
    columns?: number
    layoutVariant?: string
    placeholderItems?: Array<{ title: string; desc: string; meta?: string }>
    customNotes?: string
  }
}

export interface WireframePageData {
  pageId: string
  components: WireframeComponent[]
  viewport: ViewportMode
  layoutConfiguration: {
    spacing: 'compact' | 'comfortable' | 'spacious'
    showWireframeLabels: boolean
    theme: 'wireframe-classic' | 'wireframe-clean'
  }
}

export interface ProjectSettings {
  defaultTheme: 'light' | 'dark' | 'system'
  canvasOrientation: 'TB' | 'LR'
}

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  pages: Page[]
  sections: Section[]
  globalSections: GlobalSection[]
  edges: CanvasEdge[]
  groups: PageGroup[]
  wireframes: Record<string, WireframePageData>
  settings?: ProjectSettings
}

export interface GeneratorPromptInput {
  description: string
  targetAudience: string
  websiteGoals: string
  websiteType: string
  pageCount: number
  requirements: string[]
  useAI?: boolean
  ollamaEndpoint?: string
  ollamaModel?: string
}
