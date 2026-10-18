import React from 'react'
import {
  FileText,
  Link,
  FolderTree,
  Eye,
  Trash2,
  Copy,
  Plus,
  Palette,
  ExternalLink,
} from 'lucide-react'
import { Page, PageType, PageVisibility } from '../../types'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'

interface PageEditorProps {
  page: Page
}

const PAGE_TYPE_OPTIONS: Array<{ value: PageType; label: string }> = [
  { value: 'landing', label: 'Landing Page' },
  { value: 'content', label: 'Content / Standard Page' },
  { value: 'product', label: 'Product / Store Listing' },
  { value: 'checkout', label: 'Checkout / Transaction' },
  { value: 'dashboard', label: 'Dashboard / Application UI' },
  { value: 'auth', label: 'Authentication / Login' },
  { value: 'blog', label: 'Blog / Editorial Article' },
  { value: 'legal', label: 'Legal / Policy Disclosure' },
  { value: 'utility', label: 'Utility / 404 / Error' },
  { value: 'custom', label: 'Custom Page Type' },
]

const VISIBILITY_OPTIONS: Array<{ value: PageVisibility; label: string; color: string }> = [
  { value: 'published', label: 'Published / Live', color: '#10b981' },
  { value: 'draft', label: 'Draft / Work in Progress', color: '#f59e0b' },
  { value: 'archived', label: 'Archived / Inactive', color: '#64748b' },
  { value: 'hidden', label: 'Hidden from Navigation', color: '#8b5cf6' },
]

const COLOR_PALETTE = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#64748b', // slate
]

export const PageEditor: React.FC<PageEditorProps> = ({ page }) => {
  const project = useProjectStore((s) => s.project)
  const updatePage = useProjectStore((s) => s.updatePage)
  const reparentPage = useProjectStore((s) => s.reparentPage)
  const duplicatePage = useProjectStore((s) => s.duplicatePage)
  const deletePage = useProjectStore((s) => s.deletePage)
  const setSelectedPageId = useUIStore((s) => s.setSelectedPageId)
  const addToast = useUIStore((s) => s.addToast)

  if (!project) return null

  // Potential parent pages: all pages except self and its descendants
  const candidateParents = project.pages.filter((p) => p.id !== page.id)

  const handleSlugChange = (raw: string) => {
    let formatted = raw.toLowerCase().trim()
    if (!formatted.startsWith('/')) formatted = `/${formatted}`
    formatted = formatted.replace(/\s+/g, '-').replace(/[^a-z0-9\-_/:]/g, '')
    updatePage(page.id, { slug: formatted })
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete page "${page.name}"?`)) {
      deletePage(page.id)
      setSelectedPageId(null)
      addToast({
        title: 'Page Deleted',
        description: `Removed "${page.name}" from sitemap`,
        type: 'info',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Title & Slug */}
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Page Title *
          </label>
          <input
            type="text"
            value={page.name}
            onChange={(e) => updatePage(page.id, { name: e.target.value })}
            placeholder="e.g. Features & Pricing"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            URL Route Slug
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-400">/</span>
            <input
              type="text"
              value={page.slug.replace(/^\//, '')}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g. pricing/enterprise"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Page Type & Visibility */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Page Type
          </label>
          <select
            value={page.type}
            onChange={(e) => updatePage(page.id, { type: e.target.value as PageType })}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
          >
            {PAGE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Visibility Status
          </label>
          <select
            value={page.visibility}
            onChange={(e) => updatePage(page.id, { visibility: e.target.value as PageVisibility })}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
          >
            {VISIBILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Parent Page Picker */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
          <span>Parent Page (Hierarchy)</span>
          {page.parentId && (
            <button
              onClick={() => reparentPage(page.id, null)}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              Make Top-Level
            </button>
          )}
        </label>
        <select
          value={page.parentId || ''}
          onChange={(e) => reparentPage(page.id, e.target.value || null)}
          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="">None (Top-Level Root Page)</option>
          {candidateParents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.slug})
            </option>
          ))}
        </select>
      </div>

      {/* Page Group Assignment */}
      {project.groups.length > 0 && (
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Page Group
          </label>
          <select
            value={page.groupId || ''}
            onChange={(e) => updatePage(page.id, { groupId: e.target.value || null })}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="">No Group</option>
            {project.groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Page Description & Strategic Goals
        </label>
        <textarea
          rows={3}
          value={page.description}
          onChange={(e) => updatePage(page.id, { description: e.target.value })}
          placeholder="What is the objective of this page? Target conversion or user outcome?"
          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 resize-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Color Accent */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" /> Color Tag (Visual Organization)
        </label>
        <div className="flex items-center gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updatePage(page.id, { color })}
              className={`w-6 h-6 rounded-full transition-transform ${
                page.color === color ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          {page.color && (
            <button
              type="button"
              onClick={() => updatePage(page.id, { color: undefined })}
              className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Page Notes */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Internal Notes & Team Checklist
        </label>
        <textarea
          rows={2}
          value={page.notes}
          onChange={(e) => updatePage(page.id, { notes: e.target.value })}
          placeholder="SEO meta descriptions, analytics tracking tags, wireframe notes..."
          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 resize-none"
        />
      </div>

      {/* Quick Bottom Actions */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={() => duplicatePage(page.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Duplicate Page
        </button>

        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Page
        </button>
      </div>
    </div>
  )
}
