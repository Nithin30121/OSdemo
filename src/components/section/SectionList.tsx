import React from 'react'
import { Plus, Sparkles, Layers } from 'lucide-react'
import { Page, Section } from '../../types'
import { SectionCard } from './SectionCard'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'

interface SectionListProps {
  page: Page
}

export const SectionList: React.FC<SectionListProps> = ({ page }) => {
  const project = useProjectStore((s) => s.project)
  const reorderSections = useProjectStore((s) => s.reorderSections)
  const openSectionLibraryForPage = useUIStore((s) => s.openSectionLibraryForPage)

  if (!project) return null

  const pageSections = project.sections
    .filter((s) => s.pageId === page.id)
    .sort((a, b) => a.position - b.position)

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= pageSections.length) return

    const reordered = [...pageSections]
    const temp = reordered[index]
    reordered[index] = reordered[targetIndex]
    reordered[targetIndex] = temp

    reorderSections(
      page.id,
      reordered.map((s) => s.id),
    )
  }

  return (
    <div className="space-y-3">
      {/* Header and Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Page Sections ({pageSections.length})
          </h4>
          <p className="text-[11px] text-slate-400">Drag or use arrows to rearrange display order</p>
        </div>

        <button
          onClick={() => openSectionLibraryForPage(page.id)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Section
        </button>
      </div>

      {/* Sections list */}
      {pageSections.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">No sections added yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
            Add sections from presets like Navbar, Hero, Features, or FAQ.
          </p>
          <button
            onClick={() => openSectionLibraryForPage(page.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Browse Section Library
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {pageSections.map((sec, idx) => (
            <SectionCard
              key={sec.id}
              section={sec}
              index={idx}
              totalSections={pageSections.length}
              onMoveUp={() => handleMove(idx, 'up')}
              onMoveDown={() => handleMove(idx, 'down')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
