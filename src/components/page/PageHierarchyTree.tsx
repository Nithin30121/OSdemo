import React from 'react'
import {
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Layers,
} from 'lucide-react'
import { Page } from '../../types'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'

interface PageHierarchyTreeProps {
  parentId: string | null
  depth?: number
}

export const PageHierarchyTree: React.FC<PageHierarchyTreeProps> = ({
  parentId,
  depth = 0,
}) => {
  const project = useProjectStore((s) => s.project)
  const addPage = useProjectStore((s) => s.addPage)
  const duplicatePage = useProjectStore((s) => s.duplicatePage)
  const deletePage = useProjectStore((s) => s.deletePage)
  const selectedPageId = useUIStore((s) => s.selectedPageId)
  const setSelectedPageId = useUIStore((s) => s.setSelectedPageId)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const filterGroupId = useUIStore((s) => s.filterGroupId)

  if (!project) return null

  // Get children of current parent
  const children = project.pages.filter((p) => p.parentId === parentId)

  if (children.length === 0) return null

  const q = searchQuery.toLowerCase().trim()

  return (
    <div className="space-y-0.5">
      {children.map((page) => {
        const isSelected = selectedPageId === page.id
        const sectionCount = project.sections.filter((s) => s.pageId === page.id).length
        const hasChildren = project.pages.some((p) => p.parentId === page.id)

        // Search and filter match
        const matchesSearch =
          !q ||
          page.name.toLowerCase().includes(q) ||
          page.slug.toLowerCase().includes(q)
        const matchesType = filterType === 'all' || page.type === filterType
        const matchesGroup = filterGroupId === 'all' || page.groupId === filterGroupId

        const isDimmed = !matchesSearch || !matchesType || !matchesGroup

        return (
          <div key={page.id} className={isDimmed ? 'opacity-40' : ''}>
            <div
              onClick={() => setSelectedPageId(page.id)}
              style={{ paddingLeft: `${Math.max(8, depth * 16 + 8)}px` }}
              className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: page.color || '#3b82f6' }}
                />
                <span className="truncate">{page.name}</span>
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  {page.slug}
                </span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] text-slate-400 opacity-60 group-hover:opacity-100">
                  {sectionCount}
                </span>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addPage(
                        {
                          name: `Subpage of ${page.name}`,
                          slug: `${page.slug === '/' ? '' : page.slug}/sub`,
                        },
                        page.id,
                      )
                    }}
                    title="Add Subpage"
                    className="p-0.5 hover:text-blue-600 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Delete page "${page.name}"?`)) deletePage(page.id)
                    }}
                    title="Delete Page"
                    className="p-0.5 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recursively render child pages */}
            {hasChildren && <PageHierarchyTree parentId={page.id} depth={depth + 1} />}
          </div>
        )
      })}
    </div>
  )
}
