import { z } from 'zod'

export const SectionTypeSchema = z.enum([
  'navbar',
  'hero',
  'features',
  'statistics',
  'content',
  'testimonials',
  'faq',
  'pricing',
  'contact',
  'footer',
  'dashboard',
  'table',
  'form',
  'chart',
  'cta',
  'team',
  'custom',
])

export const PageTypeSchema = z.enum([
  'landing',
  'content',
  'product',
  'checkout',
  'dashboard',
  'auth',
  'legal',
  'utility',
  'blog',
  'custom',
])

export const PageVisibilitySchema = z.enum(['published', 'draft', 'archived', 'hidden'])

export const SectionSchema = z.object({
  id: z.string().min(1),
  pageId: z.string().min(1),
  globalSectionId: z.string().nullable().optional(),
  name: z.string().min(1),
  description: z.string().default(''),
  type: SectionTypeSchema,
  customTypeName: z.string().optional(),
  color: z.string().optional(),
  isGlobal: z.boolean().default(false),
  position: z.number().default(0),
  notes: z.string().optional(),
})

export const GlobalSectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  type: SectionTypeSchema,
  color: z.string().optional(),
  notes: z.string().optional(),
  linkedPageCount: z.number().optional(),
})

export const PageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().default('/'),
  description: z.string().default(''),
  type: PageTypeSchema.default('content'),
  customTypeName: z.string().optional(),
  parentId: z.string().nullable().default(null),
  groupId: z.string().nullable().optional(),
  sectionIds: z.array(z.string()).default([]),
  position: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
  }),
  visibility: PageVisibilitySchema.default('published'),
  notes: z.string().default(''),
  color: z.string().optional(),
})

export const PageGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().default('#64748b'),
  collapsed: z.boolean().default(false),
})

export const CanvasEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
  type: z.string().optional(),
})

export const WireframeComponentSchema = z.object({
  id: z.string().min(1),
  sectionId: z.string().min(1),
  type: SectionTypeSchema,
  name: z.string().min(1),
  props: z
    .object({
      headline: z.string().optional(),
      subtext: z.string().optional(),
      buttonText: z.string().optional(),
      secondaryButtonText: z.string().optional(),
      badgeText: z.string().optional(),
      itemsCount: z.number().optional(),
      columns: z.number().optional(),
      layoutVariant: z.string().optional(),
      placeholderItems: z
        .array(
          z.object({
            title: z.string(),
            desc: z.string(),
            meta: z.string().optional(),
          }),
        )
        .optional(),
      customNotes: z.string().optional(),
    })
    .default({}),
})

export const WireframePageDataSchema = z.object({
  pageId: z.string().min(1),
  components: z.array(WireframeComponentSchema).default([]),
  viewport: z.enum(['desktop', 'tablet', 'mobile']).default('desktop'),
  layoutConfiguration: z
    .object({
      spacing: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
      showWireframeLabels: z.boolean().default(true),
      theme: z.enum(['wireframe-classic', 'wireframe-clean']).default('wireframe-clean'),
    })
    .default({
      spacing: 'comfortable',
      showWireframeLabels: true,
      theme: 'wireframe-clean',
    }),
})

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
  pages: z.array(PageSchema).default([]),
  sections: z.array(SectionSchema).default([]),
  globalSections: z.array(GlobalSectionSchema).default([]),
  edges: z.array(CanvasEdgeSchema).default([]),
  groups: z.array(PageGroupSchema).default([]),
  wireframes: z.record(z.string(), WireframePageDataSchema).default({}),
  settings: z
    .object({
      defaultTheme: z.enum(['light', 'dark', 'system']).default('system'),
      canvasOrientation: z.enum(['TB', 'LR']).default('TB'),
    })
    .optional(),
})

export type ProjectInput = z.infer<typeof ProjectSchema>

export function validateProjectData(data: unknown): { success: true; data: ProjectInput } | { success: false; error: string } {
  const result = ProjectSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
  return { success: false, error: issues }
}
