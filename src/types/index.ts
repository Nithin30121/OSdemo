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

export interface ElementStroke {
  color: string
  width: number
  style?: 'solid' | 'dashed' | 'dotted'
  position?: 'inside' | 'center' | 'outside'
}

export interface ElementShadow {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset?: boolean
}

export interface ElementTypography {
  fontFamily?: string
  fontWeight?: number | string
  fontSize?: number
  lineHeight?: number | string
  letterSpacing?: number | string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  color?: string
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
}

export interface ElementLayout {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  isLocked?: boolean
  isHidden?: boolean
  zIndex?: number
  aspectRatioLocked?: boolean
}

export interface ElementStyle {
  fill?: string
  opacity?: number
  cornerRadius?: number
  stroke?: ElementStroke
  shadow?: ElementShadow
  typography?: ElementTypography
  textStyleId?: string
}

export type VisualElementType =
  | 'frame'
  | 'text'
  | 'button'
  | 'shape'
  | 'image'
  | 'container'
  | 'card'
  | 'input'
  | 'table'
  | 'navbar'
  | 'badge'
  | 'custom'

export interface VisualElement {
  id: string
  name: string
  type: VisualElementType
  layout: ElementLayout
  style: ElementStyle
  content?: string
  props?: Record<string, any>
  parentId?: string | null
  sectionId?: string
}

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
  layout?: ElementLayout
  style?: ElementStyle
  elements?: VisualElement[]
  isLocked?: boolean
  isHidden?: boolean
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
  elements?: VisualElement[]
}

export interface ColorToken {
  id: string
  name: string
  hex: string
  category: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic'
}

export interface TextStyleToken {
  id: string
  name: string
  fontFamily: string
  fontSize: number
  fontWeight: number | string
  lineHeight: number | string
  letterSpacing: number | string
  color?: string
}

export interface DesignSystemToken {
  id: string
  name: string
  type: 'color' | 'typography' | 'spacing' | 'shadow' | 'radius'
  value: string | number | Record<string, any>
  description?: string
}

export interface DesignSystem {
  colors: ColorToken[]
  typography: TextStyleToken[]
  tokens?: DesignSystemToken[]
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
  designSystem?: DesignSystem
  studio?: import('./studio').StudioDocument
}

export * from './studio'

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
