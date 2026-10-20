import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Sliders,
  Layout,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { Page, Section, PageType } from '../../types'
import { DesignPropertiesPanel } from '../design/DesignPropertiesPanel'

const COLOR_OPTIONS = [
  { id: 'cobalt', name: 'Blue', hex: '#1769E8' },
  { id: 'yellow', name: 'Yellow', hex: '#F9E52B' },
  { id: 'red', name: 'Red', hex: '#F04444' },
  { id: 'purple', name: 'Purple', hex: '#873FF0' },
  { id: 'teal', name: 'Teal', hex: '#29C7A3' },
  { id: 'pink', name: 'Pink', hex: '#F45AA8' },
  { id: 'cream', name: 'Cream', hex: '#F4E8D6' },
]

export const PropertiesPanel: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const updatePage = useProjectStore((s) => s.updatePage)
  const reparentPage = useProjectStore((s) => s.reparentPage)
  const addSection = useProjectStore((s) => s.addSection)
  const updateSection = useProjectStore((s) => s.updateSection)
  const deleteSection = useProjectStore((s) => s.deleteSection)
  const reorderSections = useProjectStore((s) => s.reorderSections)

  const isPropertiesPanelOpen = useUIStore((s) => s.isPropertiesPanelOpen)
  const setPropertiesPanelOpen = useUIStore((s) => s.setPropertiesPanelOpen)
  const selectedPageId = useUIStore((s) => s.selectedPageId)
  const activeView = useUIStore((s) => s.activeView)
  const selectedElementIds = useUIStore((s) => s.selectedElementIds)
  const propertiesActiveTab = useUIStore((s) => s.propertiesActiveTab)
  const setPropertiesActiveTab = useUIStore((s) => s.setPropertiesActiveTab)

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionName, setEditingSectionName] = useState('')
  const [draggedSecIndex, setDraggedSecIndex] = useState<number | null>(null)

  // Context-sensitive active tab selection
  useEffect(() => {
    if (activeView === 'wireframe' || selectedElementIds.length > 0) {
      setPropertiesActiveTab('design')
    } else {
      setPropertiesActiveTab('page')
    }
  }, [activeView, selectedElementIds.length, setPropertiesActiveTab])

  if (!isPropertiesPanelOpen || !project) return null

  // If a page is selected, use it; otherwise default to the first page (e.g. Home Page)
  const page: Page | undefined =
    project.pages.find((p) => p.id === selectedPageId) || project.pages[0]

  if (!page) {
    return (
      <aside className="w-80 h-full flex flex-col bg-[#252525] border-l border-[#3B3B3B] p-4 text-[#B0B0B0] select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#3B3B3B]">
          <h3 className="text-sm font-bold text-[#F3F3F3]">Properties</h3>
          <button
            onClick={() => setPropertiesPanelOpen(false)}
            className="text-[#B0B0B0] hover:text-[#F3F3F3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs mt-4">No pages available.</p>
      </aside>
    )
  }

  const pageSections = project.sections
    .filter((s) => s.pageId === page.id)
    .sort((a, b) => a.position - b.position)

  const candidateParents = project.pages.filter((p) => p.id !== page.id)

  const handleSlugChange = (raw: string) => {
    let formatted = raw.trim()
    if (!formatted.startsWith('/')) formatted = `/${formatted}`
    updatePage(page.id, { slug: formatted })
  }

  const handleAddNewSection = () => {
    addSection(page.id, {
      name: `New Section`,
      type: 'content',
    })
  }

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
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

  const handleSecDragStart = (index: number) => {
    setDraggedSecIndex(index)
  }

  const handleSecDrop = (dropIndex: number) => {
    if (draggedSecIndex === null || draggedSecIndex === dropIndex) return
    const reordered = [...pageSections]
    const [removed] = reordered.splice(draggedSecIndex, 1)
    reordered.splice(dropIndex, 0, removed)

    reorderSections(
      page.id,
      reordered.map((s) => s.id),
    )
    setDraggedSecIndex(null)
  }

  const getSectionDotColor = (sec: Section) => {
    if (sec.color) return sec.color
    if (sec.type === 'navbar') return '#873FF0'
    if (sec.type === 'hero') return '#F9E52B'
    if (sec.type === 'content') return '#1769E8'
    if (sec.type === 'features') return '#873FF0'
    if (sec.type === 'testimonials') return '#29C7A3'
    if (sec.type === 'cta') return '#F04444'
    if (sec.type === 'footer') return '#F8F5EF'
    return '#1769E8'
  }

  return (
    <aside className="w-80 h-full flex flex-col bg-[#252525] border-l border-[#3B3B3B] z-20 flex-shrink-0 select-none text-[#F3F3F3] overflow-hidden">
      {/* 1. Header: Tab Switcher (Design vs Page/Sections) with close X */}
      <div className="p-3 border-b border-[#3B3B3B] flex items-center justify-between">
        <div className="flex items-center bg-[#202020] border border-[#3B3B3B] p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setPropertiesActiveTab('design')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 font-semibold text-[11px] ${
              propertiesActiveTab === 'design'
                ? 'selected-glass text-[#F3F3F3] shadow-sm'
                : 'text-[#B0B0B0] hover:text-[#F3F3F3]'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Design</span>
          </button>
          <button
            onClick={() => setPropertiesActiveTab('page')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 font-semibold text-[11px] ${
              propertiesActiveTab === 'page'
                ? 'selected-glass text-[#F3F3F3] shadow-sm'
                : 'text-[#B0B0B0] hover:text-[#F3F3F3]'
            }`}
          >
            <Layout className="w-3 h-3" />
            <span>Page & Sections</span>
          </button>
        </div>

        <button
          onClick={() => setPropertiesPanelOpen(false)}
          title="Close Properties Panel"
          className="text-[#B0B0B0] hover:text-[#F3F3F3] p-1 rounded hover:bg-[#303030] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Body: Either Design Properties or Page & Sections */}
      {propertiesActiveTab === 'design' ? (
        <DesignPropertiesPanel />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Page Name */}
        <div>
          <label className="block text-xs font-medium text-[#B0B0B0] mb-1.5">
            Page Name
          </label>
          <input
            type="text"
            value={page.name}
            onChange={(e) => updatePage(page.id, { name: e.target.value })}
            className="w-full bg-[#303030] border border-[#3B3B3B] rounded-lg px-3 py-2 text-xs text-[#F3F3F3] focus:outline-none focus:border-[#777777] transition-colors"
          />
        </div>

        {/* URL Slug */}
        <div>
          <label className="block text-xs font-medium text-[#B0B0B0] mb-1.5">
            URL Slug
          </label>
          <input
            type="text"
            value={page.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full bg-[#303030] border border-[#3B3B3B] rounded-lg px-3 py-2 text-xs text-[#F3F3F3] focus:outline-none focus:border-[#777777] font-mono transition-colors"
          />
        </div>

        {/* Page Type */}
        <div>
          <label className="block text-xs font-medium text-[#B0B0B0] mb-1.5">
            Page Type
          </label>
          <select
            value={page.type}
            onChange={(e) => updatePage(page.id, { type: e.target.value as PageType })}
            className="w-full bg-[#303030] border border-[#3B3B3B] rounded-lg px-3 py-2 text-xs text-[#F3F3F3] focus:outline-none focus:border-[#777777] transition-colors"
          >
            <option value="dashboard">Main Page</option>
            <option value="landing">Landing Page</option>
            <option value="content">Content Page</option>
            <option value="product">Product Page</option>
            <option value="checkout">Checkout Page</option>
            <option value="auth">Auth / Sign In</option>
            <option value="utility">Utility / Alerts</option>
            <option value="blog">Blog</option>
            <option value="custom">Account / Profile</option>
          </select>
        </div>

        {/* Parent Page */}
        <div>
          <label className="block text-xs font-medium text-[#B0B0B0] mb-1.5">
            Parent Page
          </label>
          <select
            value={page.parentId || 'none'}
            onChange={(e) => {
              const val = e.target.value === 'none' ? null : e.target.value
              reparentPage(page.id, val)
            }}
            className="w-full bg-[#303030] border border-[#3B3B3B] rounded-lg px-3 py-2 text-xs text-[#F3F3F3] focus:outline-none focus:border-[#777777] transition-colors"
          >
            <option value="none">None</option>
            {candidateParents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-medium text-[#B0B0B0] mb-1.5">
            Color
          </label>
          <div className="flex items-center gap-2">
            <select
              value={page.color || 'cobalt'}
              onChange={(e) => updatePage(page.id, { color: e.target.value })}
              className="flex-1 bg-[#303030] border border-[#3B3B3B] rounded-lg px-3 py-2 text-xs text-[#F3F3F3] focus:outline-none focus:border-[#777777] transition-colors"
            >
              {COLOR_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <div
              className="w-8 h-8 rounded-lg border border-[#3B3B3B] flex-shrink-0 shadow-sm"
              style={{
                backgroundColor:
                  COLOR_OPTIONS.find((c) => c.id === (page.color || 'cobalt'))?.hex ||
                  '#1769E8',
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[#B0B0B0] mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={page.description || ''}
            onChange={(e) => updatePage(page.id, { description: e.target.value })}
            placeholder="Main dashboard for students. Shows today's timetable, next class, attendance and quick actions."
            className="w-full bg-[#303030] border border-[#3B3B3B] rounded-lg px-3 py-2 text-xs text-[#F3F3F3] placeholder:text-[#777777] resize-none focus:outline-none focus:border-[#777777] transition-colors leading-relaxed"
          />
        </div>

        <div className="border-t border-[#3B3B3B] pt-4" />

        {/* Sections Header with Purple Plus Button */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#F3F3F3]">
            Sections ({pageSections.length})
          </h4>

          <button
            onClick={handleAddNewSection}
            title="Add Section to Page"
            className="w-6 h-6 rounded bg-[#873FF0] hover:bg-[#7834E0] active:scale-95 text-white flex items-center justify-center font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Vertically Stacked Sections List with Color Dots and Drag Handles */}
        <div className="space-y-1.5 pt-1">
          {pageSections.map((sec, idx) => {
            const isEditing = editingSectionId === sec.id
            const dotColor = getSectionDotColor(sec)

            if (isEditing) {
              return (
                <div
                  key={sec.id}
                  className="p-2 rounded-lg bg-[#202020] border border-[#873FF0] space-y-1.5 text-xs shadow-md"
                >
                  <input
                    type="text"
                    value={editingSectionName}
                    onChange={(e) => setEditingSectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingSectionName.trim()) {
                          updateSection(sec.id, { name: editingSectionName.trim() })
                        }
                        setEditingSectionId(null)
                      }
                    }}
                    className="w-full px-2 py-1 rounded bg-[#303030] border border-[#3B3B3B] text-[#F3F3F3] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setEditingSectionId(null)}
                      className="px-2 py-0.5 rounded text-[11px] text-[#B0B0B0] hover:text-[#F3F3F3]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (editingSectionName.trim()) {
                          updateSection(sec.id, { name: editingSectionName.trim() })
                        }
                        setEditingSectionId(null)
                      }}
                      className="px-2.5 py-0.5 rounded text-[11px] bg-[#873FF0] text-white font-bold hover:bg-[#7834E0]"
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
                onDragStart={() => handleSecDragStart(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleSecDrop(idx)}
                className="group px-3 py-2.5 rounded-lg bg-[#2B2B2B] border border-[#3B3B3B] hover:border-[#4B4B4B] hover:bg-[#303030] flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    style={{ backgroundColor: dotColor }}
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                  />
                  <span className="font-semibold text-[#F3F3F3] truncate">
                    {sec.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Hover Quick Actions */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingSectionId(sec.id)
                        setEditingSectionName(sec.name)
                      }}
                      title="Rename Section"
                      className="p-1 rounded text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#353535]"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1 rounded text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#353535] disabled:opacity-20"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(idx, 'down')}
                      disabled={idx === pageSections.length - 1}
                      title="Move Down"
                      className="p-1 rounded text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#353535] disabled:opacity-20"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteSection(sec.id)}
                      title="Delete Section"
                      className="p-1 rounded text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Grip Vertical Drag Handle */}
                  <div
                    title="Drag to reorder"
                    className="cursor-grab active:cursor-grabbing p-1 text-[#777777] group-hover:text-[#B0B0B0]"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      )}
    </aside>
  )
}

