import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import {
  Plus,
  MoreVertical,
  Copy,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Globe,
} from 'lucide-react'
import { Page, Section } from '../../types'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'

export interface PageNodeData {
  page: Page
  sections: Section[]
  isSelected: boolean
}

// Neo-brutalist card color palette
export const NEO_CARD_PALETTE: Record<string, { bg: string; text: string; catText: string }> = {
  cobalt: { bg: '#1769E8', text: '#050B17', catText: '#0B215E' },
  blue: { bg: '#1769E8', text: '#050B17', catText: '#0B215E' },
  red: { bg: '#F04444', text: '#050B17', catText: '#5C0E0E' },
  yellow: { bg: '#F9E52B', text: '#050B17', catText: '#633903' },
  purple: { bg: '#873FF0', text: '#050B17', catText: '#340B6B' },
  teal: { bg: '#29C7A3', text: '#050B17', catText: '#074536' },
  pink: { bg: '#F45AA8', text: '#050B17', catText: '#5C0B36' },
  cream: { bg: '#F4E8D6', text: '#050B17', catText: '#44403C' },
}

export function getCardTheme(color?: string, pageType?: string) {
  if (color && NEO_CARD_PALETTE[color.toLowerCase()]) {
    return NEO_CARD_PALETTE[color.toLowerCase()]
  }
  const c = (color || '').toLowerCase()
  if (c.includes('red') || c === '#f04444') return NEO_CARD_PALETTE.red
  if (c.includes('yellow') || c === '#f9e52b') return NEO_CARD_PALETTE.yellow
  if (c.includes('purple') || c === '#873ff0') return NEO_CARD_PALETTE.purple
  if (c.includes('teal') || c.includes('cyan') || c === '#29c7a3') return NEO_CARD_PALETTE.teal
  if (c.includes('pink') || c === '#f45aa8') return NEO_CARD_PALETTE.pink
  if (c.includes('cream') || c === '#f4e8d6') return NEO_CARD_PALETTE.cream
  if (c.includes('blue') || c === '#1769e8') return NEO_CARD_PALETTE.cobalt

  switch (pageType) {
    case 'landing':
    case 'dashboard':
      return NEO_CARD_PALETTE.cobalt
    case 'product':
    case 'content':
      return NEO_CARD_PALETTE.yellow
    case 'checkout':
    case 'auth':
      return NEO_CARD_PALETTE.red
    case 'blog':
      return NEO_CARD_PALETTE.purple
    default:
      return NEO_CARD_PALETTE.cobalt
  }
}

export const PageNode = memo(({ data }: NodeProps<any>) => {
  const { page, sections, isSelected } = data as PageNodeData
  const addPage = useProjectStore((s) => s.addPage)
  const duplicatePage = useProjectStore((s) => s.duplicatePage)
  const deletePage = useProjectStore((s) => s.deletePage)
  const updateSection = useProjectStore((s) => s.updateSection)
  const deleteSection = useProjectStore((s) => s.deleteSection)
  const duplicateSection = useProjectStore((s) => s.duplicateSection)
  const reorderSections = useProjectStore((s) => s.reorderSections)
  const setSelectedPageId = useUIStore((s) => s.setSelectedPageId)
  const setPropertiesActiveTab = useUIStore((s) => s.setPropertiesActiveTab)
  const openSectionLibraryForPage = useUIStore((s) => s.openSectionLibraryForPage)

  const [menuOpen, setMenuOpen] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Sort sections by position
  const sortedSections = [...sections].sort((a, b) => a.position - b.position)

  const theme = getCardTheme(page.color, page.type)
  const categoryLabel = page.notes && page.notes.includes('/') ? page.notes : `${page.type.toUpperCase()}`

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPageId(page.id)
    setMenuOpen(false)
  }

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
    setMenuOpen(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete page "${page.name}" and any child subpages?`)) {
      deletePage(page.id)
    }
    setMenuOpen(false)
  }

  const handleOpenPageEditor = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPageId(page.id)
    setPropertiesActiveTab('page')
    setMenuOpen(false)
  }

  const handleAddSection = (e: React.MouseEvent) => {
    e.stopPropagation()
    openSectionLibraryForPage(page.id)
  }

  const handleStartEditSection = (sec: Section, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSectionId(sec.id)
    setEditName(sec.name)
    setEditDesc(sec.description || '')
  }

  const handleSaveSection = (secId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (editName.trim()) {
      updateSection(secId, {
        name: editName.trim(),
        description: editDesc.trim(),
      })
    }
    setEditingSectionId(null)
  }

  const handleCancelEditSection = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSectionId(null)
  }

  const handleMoveSection = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation()
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sortedSections.length) return

    const reordered = [...sortedSections]
    const temp = reordered[index]
    reordered[index] = reordered[targetIndex]
    reordered[targetIndex] = temp

    reorderSections(page.id, reordered.map((s) => s.id))
  }

  const handleDragStart = (index: number, e: React.DragEvent) => {
    e.stopPropagation()
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (dropIndex: number, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const reordered = [...sortedSections]
    const [removed] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, removed)

    reorderSections(page.id, reordered.map((s) => s.id))
    setDraggedIndex(null)
  }

  return (
    <div
      onClick={handleCardClick}
      style={{ backgroundColor: theme.bg }}
      className={`group relative w-[245px] rounded-2xl transition-all duration-150 shadow-[0_4px_14px_rgba(0,0,0,0.35)] cursor-pointer border border-black/20 ${
        isSelected
          ? 'ring-4 ring-white/90 ring-offset-2 ring-offset-[#030817] shadow-2xl'
          : 'hover:shadow-2xl hover:scale-[1.01]'
      }`}
    >
      {/* Top Tree Connection Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !-top-1.5 !bg-white !border !border-black"
      />

      {/* 1. NEO-BRUTALIST CARD HEADER */}
      <div className="px-3.5 pt-3 pb-1.5">
        <div className="flex items-center justify-between gap-1">
          <span
            style={{ color: theme.catText }}
            className="text-[10px] font-extrabold tracking-wider uppercase truncate"
          >
            {categoryLabel}
          </span>

          {/* Overflow Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              title="Page Options"
              className="p-1 rounded-md text-[#050B17] opacity-60 hover:opacity-100 hover:bg-black/10 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-40 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl z-30 py-1 text-xs text-white"
              >
                <button
                  onClick={handleOpenPageEditor}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={handleAddChild}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Add Subpage</span>
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate Page</span>
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Page</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BOLD CONDENSED PAGE TITLE */}
        <h2 className="font-display font-black text-2xl uppercase tracking-tight text-[#050B17] leading-none mt-0.5 truncate">
          {page.name}
        </h2>
      </div>

      {/* 2. VERTICALLY STACKED WARM CREAM SECTION ROWS */}
      <div className="px-2.5 pb-2.5 pt-1 space-y-1.5">
        {sortedSections.length === 0 ? (
          <div className="py-2.5 px-2 text-center rounded-lg border border-dashed border-black/20 bg-[#F4E8D6]/60">
            <p className="text-[10px] text-[#050B17]/60 font-semibold italic">No sections yet</p>
          </div>
        ) : (
          sortedSections.map((sec, idx) => {
            const isEditingThis = editingSectionId === sec.id
            const isFeatured = sec.color === '#F9E52B' || sec.notes === 'featured'

            if (isEditingThis) {
              return (
                <div
                  key={sec.id}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg border border-black/30 bg-[#F4E8D6] space-y-1.5 text-xs shadow-md"
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Section Title"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSection(sec.id)}
                    className="w-full px-2 py-1 rounded border border-black/20 bg-white text-[#0F172A] text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-600"
                    autoFocus
                  />
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Short description (optional)..."
                    className="w-full px-2 py-1 rounded border border-black/20 bg-white text-[#0F172A] text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  <div className="flex items-center justify-end gap-1.5 pt-0.5">
                    <button
                      onClick={handleCancelEditSection}
                      className="px-2 py-0.5 rounded text-[11px] text-[#475569] hover:bg-black/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => handleSaveSection(sec.id, e)}
                      className="px-2.5 py-0.5 rounded text-[11px] bg-[#050B17] text-white font-bold hover:bg-black"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={sec.id}
                draggable
                onDragStart={(e) => handleDragStart(idx, e)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(idx, e)}
                className={`group/row relative px-3 py-1.5 rounded-lg border border-black/15 transition-all text-left shadow-sm ${
                  isFeatured
                    ? 'bg-[#FEF08A] hover:bg-[#FDE047]'
                    : 'bg-[#F4E8D6] hover:bg-[#ECE0CD]'
                }`}
              >
                {/* Section Title and Quick Actions */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="font-bold text-xs text-[#0F172A] leading-tight truncate">
                      {sec.name}
                    </span>

                    {sec.isGlobal && (
                      <span
                        title="Global Synchronized Section"
                        className="text-blue-600 flex-shrink-0"
                      >
                        <Globe className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Hover Secondary Actions Toolbar */}
                  <div className="opacity-0 group-hover/row:opacity-100 flex items-center gap-0.5 flex-shrink-0 transition-opacity bg-black/5 rounded px-1 py-0.5">
                    <button
                      onClick={(e) => handleStartEditSection(sec, e)}
                      title="Edit Section Content"
                      className="p-0.5 rounded text-[#475569] hover:text-[#0F172A] hover:bg-black/10 transition-colors"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateSection(sec.id)
                      }}
                      title="Duplicate Section"
                      className="p-0.5 rounded text-[#475569] hover:text-[#0F172A] hover:bg-black/10 transition-colors"
                    >
                      <Copy className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => handleMoveSection(idx, 'up', e)}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-0.5 rounded text-[#475569] hover:text-[#0F172A] hover:bg-black/10 disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => handleMoveSection(idx, 'down', e)}
                      disabled={idx === sortedSections.length - 1}
                      title="Move Down"
                      className="p-0.5 rounded text-[#475569] hover:text-[#0F172A] hover:bg-black/10 disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSection(sec.id)
                      }}
                      title="Delete Section"
                      className="p-0.5 rounded text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Section Description (Wraps naturally) */}
                {sec.description && (
                  <p className="text-[10px] text-[#475569] leading-snug mt-0.5 break-words">
                    {sec.description}
                  </p>
                )}
              </div>
            )
          })
        )}

        {/* Add section control at card bottom on hover / selection */}
        <button
          onClick={handleAddSection}
          className="w-full py-1.5 px-2 rounded-lg border border-dashed border-black/25 hover:border-black/50 bg-black/5 hover:bg-black/10 text-[#050B17]/70 hover:text-[#050B17] text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
        >
          <Plus className="w-3 h-3" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Bottom Tree Connection Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !-bottom-1.5 !bg-white !border !border-black"
      />
    </div>
  )
})

PageNode.displayName = 'PageNode'
