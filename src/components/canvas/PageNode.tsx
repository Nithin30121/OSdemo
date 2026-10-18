import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Globe,
  Settings,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Page, Section } from '../../types'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'

export interface PageNodeData {
  page: Page
  sections: Section[]
  isSelected: boolean
}

export const PageNode = memo(({ data }: NodeProps<any>) => {
  const { page, sections, isSelected } = data as PageNodeData
  const addPage = useProjectStore((s) => s.addPage)
  const duplicatePage = useProjectStore((s) => s.duplicatePage)
  const deletePage = useProjectStore((s) => s.deletePage)
  const setSelectedPageId = useUIStore((s) => s.setSelectedPageId)
  const setPropertiesActiveTab = useUIStore((s) => s.setPropertiesActiveTab)
  const openSectionLibraryForPage = useUIStore((s) => s.openSectionLibraryForPage)

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    addPage(
      {
        name: `Child of ${page.name}`,
        slug: `${page.slug === '/' ? '' : page.slug}/new-page`,
      },
      page.id,
    )
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicatePage(page.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete page "${page.name}" and any child subpages?`)) {
      deletePage(page.id)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPageId(page.id)
  }

  const handleAddSection = (e: React.MouseEvent) => {
    e.stopPropagation()
    openSectionLibraryForPage(page.id)
  }

  const handleOpenPageEditor = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPageId(page.id)
    setPropertiesActiveTab('page')
  }

  const accentColor = page.color || '#3b82f6'

  return (
    <div
      onClick={handleCardClick}
      className={`group relative w-[280px] rounded-xl bg-white dark:bg-slate-900 border transition-all duration-150 shadow-md hover:shadow-xl cursor-pointer ${
        isSelected
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20 shadow-blue-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Target connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !-top-1.5 !bg-blue-500 !border-2 !border-white dark:!border-slate-900"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !-left-1.5 !bg-blue-500 !border-2 !border-white dark:!border-slate-900"
      />

      {/* Top accent color bar */}
      <div
        className="h-1.5 w-full rounded-t-xl transition-colors"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-3.5">
        {/* Header row: Page Type Badge & Quick Section Count */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <FileText className="w-2.5 h-2.5 opacity-70" />
            {page.type}
          </span>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {sections.length} {sections.length === 1 ? 'section' : 'sections'}
            </span>

            {/* Quick action buttons on card */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
              <button
                onClick={handleDuplicate}
                title="Duplicate Page"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                title="Delete Page"
                className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Title & Slug */}
        <div className="mb-2.5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
            {page.name}
            {page.visibility === 'draft' && (
              <span className="text-[9px] font-normal px-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                Draft
              </span>
            )}
          </h3>
          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate flex items-center gap-1 mt-0.5">
            <span className="opacity-60">URL:</span>
            {page.slug}
          </p>
        </div>

        {/* Section List Preview */}
        <div className="space-y-1 mb-2.5 bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
          {sections.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic text-center py-1">No sections yet</p>
          ) : (
            sections.slice(0, 4).map((sec) => (
              <div
                key={sec.id}
                className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 py-0.5 truncate"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sec.color || '#94a3b8' }}
                  />
                  <span className="truncate">{sec.name}</span>
                </div>
                {sec.isGlobal && (
                  <span
                    title="Global Synchronized Section"
                    className="flex-shrink-0 text-blue-500 dark:text-blue-400 ml-1"
                  >
                    <Globe className="w-3 h-3" />
                  </span>
                )}
              </div>
            ))
          )}
          {sections.length > 4 && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-0.5 pl-3">
              +{sections.length - 4} more sections
            </p>
          )}
        </div>

        {/* Bottom Card Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <button
            onClick={handleAddSection}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Section
          </button>

          <button
            onClick={handleOpenPageEditor}
            className="inline-flex items-center gap-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Edit
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Quick Add Child button at bottom edge */}
      <button
        onClick={handleAddChild}
        title="Add Child Subpage"
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:scale-110 z-10"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Source connection handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !-bottom-1.5 !bg-blue-500 !border-2 !border-white dark:!border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !-right-1.5 !bg-blue-500 !border-2 !border-white dark:!border-slate-900"
      />
    </div>
  )
})

PageNode.displayName = 'PageNode'
