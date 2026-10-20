import React, { useState } from 'react'
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Type,
  Square,
  Image as ImageIcon,
  Layout,
  CreditCard,
  Table as TableIcon,
  Compass,
  MoveUp,
  MoveDown,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { VisualElement } from '../../types'

interface LayersPanelProps {
  pageId: string
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ pageId }) => {
  const project = useProjectStore((s) => s.project)
  const selectedElementIds = useUIStore((s) => s.selectedElementIds)
  const toggleElementSelection = useUIStore((s) => s.toggleElementSelection)
  const addVisualElement = useProjectStore((s) => s.addVisualElement)
  const updateVisualElement = useProjectStore((s) => s.updateVisualElement)
  const deleteVisualElement = useProjectStore((s) => s.deleteVisualElement)
  const duplicateVisualElement = useProjectStore((s) => s.duplicateVisualElement)
  const reorderVisualElements = useProjectStore((s) => s.reorderVisualElements)
  const toggleLockVisualElement = useProjectStore((s) => s.toggleLockVisualElement)
  const toggleHideVisualElement = useProjectStore((s) => s.toggleHideVisualElement)

  const updateWireframeComponentDetails = useProjectStore((s) => s.updateWireframeComponentDetails)
  const deleteWireframeComponent = useProjectStore((s) => s.deleteWireframeComponent)
  const duplicateWireframeComponent = useProjectStore((s) => s.duplicateWireframeComponent)
  const toggleLockWireframeComponent = useProjectStore((s) => s.toggleLockWireframeComponent)
  const toggleHideWireframeComponent = useProjectStore((s) => s.toggleHideWireframeComponent)
  const reorderWireframeComponents = useProjectStore((s) => s.reorderWireframeComponents)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const activePage = project?.pages.find((p) => p.id === pageId)
  const wireframe = project?.wireframes[pageId]
  const components = wireframe?.components || []
  const elements = wireframe?.elements || []

  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [secId]: !prev[secId] }))
  }

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(id)
    setEditingName(currentName)
  }

  const handleSaveRename = (id: string, isComponent: boolean) => {
    if (editingName.trim()) {
      if (isComponent) {
        updateWireframeComponentDetails(pageId, id, { name: editingName.trim() })
      } else {
        updateVisualElement(pageId, id, { name: editingName.trim() })
      }
    }
    setEditingId(null)
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-blue-400" />
      case 'button':
        return <Square className="w-3.5 h-3.5 text-purple-400" />
      case 'shape':
        return <Square className="w-3.5 h-3.5 text-cyan-400" />
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
      case 'card':
        return <CreditCard className="w-3.5 h-3.5 text-amber-400" />
      case 'table':
        return <TableIcon className="w-3.5 h-3.5 text-rose-400" />
      case 'navbar':
        return <Compass className="w-3.5 h-3.5 text-indigo-400" />
      default:
        return <Layout className="w-3.5 h-3.5 text-slate-400" />
    }
  }

  const handleMoveComp = (idx: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation()
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= components.length) return
    const ids = components.map((c) => c.id)
    const temp = ids[idx]
    ids[idx] = ids[targetIdx]
    ids[targetIdx] = temp
    reorderWireframeComponents(pageId, ids)
  }

  const handleMoveElem = (idx: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation()
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= elements.length) return
    const ids = elements.map((el) => el.id)
    const temp = ids[idx]
    ids[idx] = ids[targetIdx]
    ids[targetIdx] = temp
    reorderVisualElements(pageId, ids)
  }

  const handleQuickAddElement = (type: VisualElement['type'], sectionId?: string) => {
    addVisualElement(
      pageId,
      {
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
        content: type === 'shape' ? 'Shape' : type === 'text' ? 'Headline Text' : type === 'button' ? 'Action Button' : undefined,
        layout: {
          x: 40,
          y: (elements.length * 50) + 40,
          width: type === 'button' ? 140 : type === 'text' ? 260 : type === 'shape' ? 240 : 320,
          height: type === 'button' ? 44 : type === 'text' ? 40 : type === 'shape' ? 160 : 180,
          rotation: 0,
          isLocked: false,
          isHidden: false,
          zIndex: elements.length + 1,
        },
        style: {
          fill: type === 'shape' ? '#1E293B' : type === 'button' ? '#1769E8' : undefined,
          cornerRadius: type === 'shape' || type === 'button' ? 8 : undefined,
        },
      },
      sectionId,
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#252525] text-[#F3F3F3] select-none text-xs overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#3B3B3B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#873FF0]" />
          <span className="font-bold text-[#F3F3F3] text-xs">Layers Hierarchy</span>
        </div>

        {/* Quick Add Visual Element Dropdown Button */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleQuickAddElement('text')}
            title="Add Text Layer"
            className="p-1 rounded text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030]"
          >
            <Type className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleQuickAddElement('shape')}
            title="Add Shape / Rectangle Layer"
            className="p-1 rounded text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030]"
          >
            <Square className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={() => handleQuickAddElement('button')}
            title="Add Button Layer"
            className="p-1 rounded text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030]"
          >
            <Square className="w-3.5 h-3.5 text-purple-400" />
          </button>
          <button
            onClick={() => handleQuickAddElement('card')}
            title="Add Card Layer"
            className="p-1 rounded text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030]"
          >
            <CreditCard className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layers Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* Root Page Node */}
        <div className="px-2 py-1.5 rounded-lg bg-[#2B2B2B] border border-[#3B3B3B] flex items-center justify-between text-[#F3F3F3] font-semibold mb-2">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate">{activePage?.name || 'Current Page'} Frame</span>
          </div>
          <span className="text-[10px] text-[#B0B0B0] font-mono">
            {components.length + elements.length} layers
          </span>
        </div>

        {/* Section Frames */}
        {components.map((comp, compIdx) => {
          const isSelected = selectedElementIds.includes(comp.id)
          const isCollapsed = collapsedSections[comp.id]
          const isEditing = editingId === comp.id
          const compElements = elements.filter((el) => el.sectionId === comp.id)

          return (
            <div key={comp.id} className="space-y-0.5">
              <div
                onClick={(e) => {
                  toggleElementSelection(comp.id, e.shiftKey || e.metaKey || e.ctrlKey)
                }}
                className={`group px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'selected-glass text-[#F3F3F3] font-bold shadow-sm'
                    : 'hover:bg-[#303030]/60 text-[#B0B0B0] hover:text-[#F3F3F3]'
                } ${comp.isHidden ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSectionCollapse(comp.id)
                    }}
                    className="p-0.5 hover:text-white text-slate-500 rounded"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  <Layout className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />

                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(comp.id, true)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={() => handleSaveRename(comp.id, true)}
                      className="px-1 py-0.5 rounded bg-black/60 border border-purple-500 text-white text-xs font-semibold focus:outline-none flex-1 min-w-0"
                      autoFocus
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => handleStartRename(comp.id, comp.name, e)}
                      className="truncate text-xs"
                      title="Double click to rename"
                    >
                      {comp.name}
                    </span>
                  )}
                </div>

                {/* Quick Layer Controls on Hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleMoveComp(compIdx, 'up', e)}
                    disabled={compIdx === 0}
                    title="Move Layer Up"
                    className="p-1 hover:text-white text-slate-400 disabled:opacity-20"
                  >
                    <MoveUp className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => handleMoveComp(compIdx, 'down', e)}
                    disabled={compIdx === components.length - 1}
                    title="Move Layer Down"
                    className="p-1 hover:text-white text-slate-400 disabled:opacity-20"
                  >
                    <MoveDown className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleHideWireframeComponent(pageId, comp.id)
                    }}
                    title={comp.isHidden ? 'Show Layer' : 'Hide Layer'}
                    className="p-1 hover:text-white text-slate-400"
                  >
                    {comp.isHidden ? <EyeOff className="w-3 h-3 text-slate-500" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLockWireframeComponent(pageId, comp.id)
                    }}
                    title={comp.isLocked ? 'Unlock Layer' : 'Lock Layer'}
                    className="p-1 hover:text-white text-slate-400"
                  >
                    {comp.isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateWireframeComponent(pageId, comp.id)
                    }}
                    title="Duplicate Layer"
                    className="p-1 hover:text-white text-slate-400"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteWireframeComponent(pageId, comp.id)
                    }}
                    title="Delete Layer"
                    className="p-1 hover:text-rose-400 text-slate-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sub-elements inside Section */}
              {!isCollapsed && compElements.length > 0 && (
                <div className="pl-4 space-y-0.5 border-l border-[#3B3B3B] ml-3">
                  {compElements.map((el) => {
                    const isElSelected = selectedElementIds.includes(el.id)
                    const isElEditing = editingId === el.id

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleElementSelection(el.id, e.shiftKey || e.metaKey || e.ctrlKey)
                        }}
                        className={`group px-2 py-1 rounded flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isElSelected
                            ? 'selected-glass text-[#F3F3F3] font-semibold'
                            : 'hover:bg-[#303030]/50 text-[#B0B0B0] hover:text-[#F3F3F3]'
                        } ${el.layout.isHidden ? 'opacity-40' : ''}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          {getElementIcon(el.type)}
                          {isElEditing ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(el.id, false)
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                              onBlur={() => handleSaveRename(el.id, false)}
                              className="px-1 py-0.5 rounded bg-[#303030] border border-purple-500 text-white text-[11px] focus:outline-none flex-1 min-w-0"
                              autoFocus
                            />
                          ) : (
                            <span
                              onDoubleClick={(e) => handleStartRename(el.id, el.name, e)}
                              className="truncate text-[11px]"
                            >
                              {el.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleHideVisualElement(pageId, el.id)
                            }}
                            className="p-1 hover:text-[#F3F3F3] text-[#B0B0B0]"
                          >
                            {el.layout.isHidden ? <EyeOff className="w-2.5 h-2.5 text-[#777777]" /> : <Eye className="w-2.5 h-2.5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLockVisualElement(pageId, el.id)
                            }}
                            className="p-1 hover:text-[#F3F3F3] text-[#B0B0B0]"
                          >
                            {el.layout.isLocked ? <Lock className="w-2.5 h-2.5 text-amber-400" /> : <Unlock className="w-2.5 h-2.5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteVisualElement(pageId, el.id)
                            }}
                            className="p-1 hover:text-rose-400 text-[#B0B0B0]"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Freeform / Page-level Elements */}
        {elements
          .filter((el) => !el.sectionId)
          .map((el, elIdx) => {
            const isElSelected = selectedElementIds.includes(el.id)
            const isElEditing = editingId === el.id

            return (
              <div
                key={el.id}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleElementSelection(el.id, e.shiftKey || e.metaKey || e.ctrlKey)
                }}
                className={`group px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isElSelected
                    ? 'selected-glass text-[#F3F3F3] font-bold shadow-sm'
                    : 'hover:bg-[#303030]/60 text-[#B0B0B0] hover:text-[#F3F3F3]'
                } ${el.layout.isHidden ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {getElementIcon(el.type)}
                  {isElEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(el.id, false)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={() => handleSaveRename(el.id, false)}
                      className="px-1 py-0.5 rounded bg-[#303030] border border-purple-500 text-[#F3F3F3] text-xs font-semibold focus:outline-none flex-1 min-w-0"
                      autoFocus
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => handleStartRename(el.id, el.name, e)}
                      className="truncate text-xs"
                    >
                      {el.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleMoveElem(elIdx, 'up', e)}
                    disabled={elIdx === 0}
                    title="Move Up"
                    className="p-1 hover:text-[#F3F3F3] text-[#B0B0B0] disabled:opacity-20"
                  >
                    <MoveUp className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => handleMoveElem(elIdx, 'down', e)}
                    disabled={elIdx === elements.length - 1}
                    title="Move Down"
                    className="p-1 hover:text-[#F3F3F3] text-[#B0B0B0] disabled:opacity-20"
                  >
                    <MoveDown className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleHideVisualElement(pageId, el.id)
                    }}
                    title={el.layout.isHidden ? 'Show Layer' : 'Hide Layer'}
                    className="p-1 hover:text-[#F3F3F3] text-[#B0B0B0]"
                  >
                    {el.layout.isHidden ? <EyeOff className="w-3 h-3 text-[#777777]" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLockVisualElement(pageId, el.id)
                    }}
                    title={el.layout.isLocked ? 'Unlock Layer' : 'Lock Layer'}
                    className="p-1 hover:text-[#F3F3F3] text-[#B0B0B0]"
                  >
                    {el.layout.isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateVisualElement(pageId, el.id)
                    }}
                    title="Duplicate Layer"
                    className="p-1 hover:text-[#F3F3F3] text-[#B0B0B0]"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteVisualElement(pageId, el.id)
                    }}
                    title="Delete Layer"
                    className="p-1 hover:text-rose-400 text-[#B0B0B0]"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}

        {components.length === 0 && elements.length === 0 && (
          <div className="py-8 text-center text-[#777777] text-xs">
            No layers on this page yet.
          </div>
        )}
      </div>
    </div>
  )
}
