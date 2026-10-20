import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Plus,
  Layers,
  ArrowLeft,
  MousePointer,
  Type,
  Square,
  CreditCard,
  Image as ImageIcon,
  Table as TableIcon,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { VisualElementRenderer } from './VisualElementRenderer'
import { BoundingBox } from '../design/BoundingBox'
import { AlignmentGuides, AlignmentGuide } from '../design/AlignmentGuides'
import { Page, ViewportMode, WireframePageData, VisualElement } from '../../types'

interface WireframeEditorProps {
  activePage: Page
}

const WireframeEditor: React.FC<WireframeEditorProps> = ({ activePage }) => {
  const project = useProjectStore((s) => s.project)
  const setSelectedPageId = useUIStore((s) => s.setSelectedPageId)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const updateWireframe = useProjectStore((s) => s.updateWireframe)
  const syncWireframeFromSections = useProjectStore((s) => s.syncWireframeFromSections)
  const addVisualElement = useProjectStore((s) => s.addVisualElement)
  const updateVisualElement = useProjectStore((s) => s.updateVisualElement)
  const batchUpdateVisualElements = useProjectStore((s) => s.batchUpdateVisualElements)
  const deleteVisualElement = useProjectStore((s) => s.deleteVisualElement)
  const duplicateVisualElement = useProjectStore((s) => s.duplicateVisualElement)

  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const canUndo = useProjectStore((s) => s.canUndo())
  const canRedo = useProjectStore((s) => s.canRedo())

  const selectedElementIds = useUIStore((s) => s.selectedElementIds)
  const setSelectedElementIds = useUIStore((s) => s.setSelectedElementIds)
  const toggleElementSelection = useUIStore((s) => s.toggleElementSelection)
  const clearElementSelection = useUIStore((s) => s.clearElementSelection)
  const activeWireframeTool = useUIStore((s) => s.activeWireframeTool)
  const setActiveWireframeTool = useUIStore((s) => s.setActiveWireframeTool)
  const setPropertiesActiveTab = useUIStore((s) => s.setPropertiesActiveTab)
  const setPropertiesPanelOpen = useUIStore((s) => s.setPropertiesPanelOpen)
  const setSidebarActiveTab = useUIStore((s) => s.setSidebarActiveTab)
  const addToast = useUIStore((s) => s.addToast)

  const containerRef = useRef<HTMLDivElement>(null)
  const [guides, setGuides] = useState<AlignmentGuide[]>([])

  const currentWf: WireframePageData = project?.wireframes[activePage.id] || {
    pageId: activePage.id,
    components: [],
    viewport: 'desktop',
    layoutConfiguration: {
      spacing: 'comfortable',
      showWireframeLabels: true,
      theme: 'wireframe-clean',
    },
    elements: [],
  }

  const viewport = currentWf.viewport || 'desktop'
  const visualElements: VisualElement[] = useMemo(() => currentWf.elements || [], [currentWf.elements])
  const selectedElements = useMemo(() => visualElements.filter((el) => selectedElementIds.includes(el.id)), [visualElements, selectedElementIds])

  // Automatically seed visual elements from sections if empty
  useEffect(() => {
    if (visualElements.length === 0) {
      syncWireframeFromSections(activePage.id)
    }
  }, [activePage.id, visualElements.length, syncWireframeFromSections])

  const setViewport = (mode: ViewportMode) => {
    updateWireframe(activePage.id, {
      ...currentWf,
      viewport: mode,
    })
  }

  const handleSyncFromSections = () => {
    syncWireframeFromSections(activePage.id)
    addToast({
      title: 'Canvas Synchronized',
      description: `Generated Figma visual editing layers to match sitemap sections for ${activePage.name}`,
      type: 'success',
    })
  }

  // Direct Creation Handlers
  const handleAddText = useCallback(() => {
    const created = addVisualElement(activePage.id, {
      type: 'text',
      name: 'Headline Text',
      content: 'Headline Text',
      layout: {
        x: 60,
        y: Math.max(80, visualElements.length * 50 + 40),
        width: 360,
        height: 48,
        rotation: 0,
        isLocked: false,
        isHidden: false,
        zIndex: visualElements.length + 1,
      },
      style: {
        typography: { fontFamily: 'Inter', fontSize: 28, fontWeight: 700, color: '#FFFFFF' },
      },
    })
    setSelectedElementIds([created.id])
    setPropertiesPanelOpen(true)
    setPropertiesActiveTab('design')
    addToast({ title: 'Text Layer Added', description: 'Placed new text layer.', type: 'info' })
  }, [activePage.id, visualElements.length, addVisualElement, setSelectedElementIds, setPropertiesPanelOpen, setPropertiesActiveTab, addToast])

  const handleAddShape = useCallback(() => {
    const created = addVisualElement(activePage.id, {
      type: 'shape',
      name: 'Rectangle Shape',
      content: 'Shape',
      layout: {
        x: 60,
        y: Math.max(80, visualElements.length * 50 + 40),
        width: 280,
        height: 180,
        rotation: 0,
        isLocked: false,
        isHidden: false,
        zIndex: visualElements.length + 1,
      },
      style: {
        fill: '#1E293B',
        stroke: { color: '#334155', width: 1, style: 'solid' },
        cornerRadius: 8,
      },
    })
    setSelectedElementIds([created.id])
    setPropertiesPanelOpen(true)
    setPropertiesActiveTab('design')
    addToast({ title: 'Shape Added', description: 'Placed new rectangle shape.', type: 'info' })
  }, [activePage.id, visualElements.length, addVisualElement, setSelectedElementIds, setPropertiesPanelOpen, setPropertiesActiveTab, addToast])

  const handleAddButton = useCallback(() => {
    const created = addVisualElement(activePage.id, {
      type: 'button',
      name: 'Action Button',
      content: 'Action Button',
      layout: {
        x: 60,
        y: Math.max(80, visualElements.length * 50 + 40),
        width: 150,
        height: 44,
        rotation: 0,
        isLocked: false,
        isHidden: false,
        zIndex: visualElements.length + 1,
      },
      style: {
        fill: '#1769E8',
        cornerRadius: 8,
        typography: { color: '#FFFFFF', fontWeight: 600, fontSize: 14 },
      },
    })
    setSelectedElementIds([created.id])
    setPropertiesPanelOpen(true)
    setPropertiesActiveTab('design')
    addToast({ title: 'Button Added', description: 'Placed new button component.', type: 'info' })
  }, [activePage.id, visualElements.length, addVisualElement, setSelectedElementIds, setPropertiesPanelOpen, setPropertiesActiveTab, addToast])

  const handleAddCard = useCallback(() => {
    const created = addVisualElement(activePage.id, {
      type: 'card',
      name: 'Feature Card',
      content: 'Card Feature Title',
      layout: {
        x: 60,
        y: Math.max(80, visualElements.length * 50 + 40),
        width: 320,
        height: 180,
        rotation: 0,
        isLocked: false,
        isHidden: false,
        zIndex: visualElements.length + 1,
      },
      style: {
        fill: '#0E1526',
        stroke: { color: '#1E293B', width: 1, style: 'solid' },
        cornerRadius: 12,
      },
    })
    setSelectedElementIds([created.id])
    setPropertiesPanelOpen(true)
    setPropertiesActiveTab('design')
    addToast({ title: 'Card Container Added', description: 'Placed card container.', type: 'info' })
  }, [activePage.id, visualElements.length, addVisualElement, setSelectedElementIds, setPropertiesPanelOpen, setPropertiesActiveTab, addToast])

  const handleDuplicateSelected = useCallback(() => {
    if (selectedElementIds.length === 0) return
    const newIds: string[] = []
    selectedElementIds.forEach((id) => {
      const dup = duplicateVisualElement(activePage.id, id)
      if (dup) newIds.push(dup.id)
    })
    if (newIds.length > 0) {
      setSelectedElementIds(newIds)
      addToast({ title: 'Duplicated', description: `Duplicated ${newIds.length} element(s).`, type: 'info' })
    }
  }, [activePage.id, selectedElementIds, duplicateVisualElement, setSelectedElementIds, addToast])

  const handleDeleteSelected = useCallback(() => {
    if (selectedElementIds.length === 0) return
    const count = selectedElementIds.length
    selectedElementIds.forEach((id) => deleteVisualElement(activePage.id, id))
    clearElementSelection()
    addToast({ title: 'Deleted', description: `Deleted ${count} element(s).`, type: 'info' })
  }, [activePage.id, selectedElementIds, deleteVisualElement, clearElementSelection, addToast])

  // Canvas Click: Deselect or Place Element
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName !== 'SECTION') {
      return
    }

    if (activeWireframeTool !== 'select' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(20, Math.round((e.clientX - rect.left) / 8) * 8)
      const y = Math.max(20, Math.round((e.clientY - rect.top) / 8) * 8)

      let width = 200
      let height = 48
      let name = 'Text Element'
      let content = 'Heading Text'

      if (activeWireframeTool === 'shape') {
        width = 280
        height = 180
        name = 'Rectangle Shape'
        content = 'Shape'
      } else if (activeWireframeTool === 'button') {
        width = 140
        height = 44
        name = 'Action Button'
        content = 'Click Me'
      } else if (activeWireframeTool === 'card') {
        width = 320
        height = 180
        name = 'Feature Card'
        content = 'Card Title'
      } else if (activeWireframeTool === 'image') {
        width = 300
        height = 200
        name = 'Media Image'
        content = '[ Image ]'
      } else if (activeWireframeTool === 'input') {
        width = 280
        height = 54
        name = 'Form Input'
        content = 'Enter value...'
      } else if (activeWireframeTool === 'table') {
        width = 400
        height = 160
        name = 'Data Table'
        content = 'Data Table'
      }

      const created = addVisualElement(activePage.id, {
        type: activeWireframeTool,
        name,
        content,
        layout: {
          x,
          y,
          width,
          height,
          rotation: 0,
          isLocked: false,
          isHidden: false,
        },
      })

      setSelectedElementIds([created.id])
      setActiveWireframeTool('select')
      setPropertiesPanelOpen(true)
      setPropertiesActiveTab('design')
      addToast({
        title: 'Element Added',
        description: `Placed ${name} on canvas.`,
        type: 'info',
      })
      return
    }

    clearElementSelection()
  }

  // Move Elements with Grid Snapping & Guides
  const handleMoveElements = useCallback(
    (elementIds: string[], deltaX: number, deltaY: number) => {
      const activeGuides: AlignmentGuide[] = []
      const containerWidth = viewport === 'mobile' ? 375 : viewport === 'tablet' ? 768 : 1100
      const centerX = containerWidth / 2

      const updates = elementIds.map((id) => {
        const el = visualElements.find((e) => e.id === id)
        if (!el || el.layout.isLocked) return { id }

        let newX = Math.max(0, el.layout.x + deltaX)
        let newY = Math.max(0, el.layout.y + deltaY)

        // Snapping checks against other sibling elements
        const siblings = visualElements.filter((s) => !elementIds.includes(s.id))
        siblings.forEach((s) => {
          if (Math.abs(newY - s.layout.y) < 6) {
            newY = s.layout.y
            activeGuides.push({ type: 'horizontal', position: newY })
          } else if (Math.abs(newY + el.layout.height - (s.layout.y + s.layout.height)) < 6) {
            newY = s.layout.y + s.layout.height - el.layout.height
            activeGuides.push({ type: 'horizontal', position: newY + el.layout.height })
          }

          if (Math.abs(newX - s.layout.x) < 6) {
            newX = s.layout.x
            activeGuides.push({ type: 'vertical', position: newX })
          } else if (Math.abs(newX + el.layout.width - (s.layout.x + s.layout.width)) < 6) {
            newX = s.layout.x + s.layout.width - el.layout.width
            activeGuides.push({ type: 'vertical', position: newX + el.layout.width })
          }
        })

        if (Math.abs(newX + el.layout.width / 2 - centerX) < 8) {
          newX = centerX - el.layout.width / 2
          activeGuides.push({ type: 'vertical', position: centerX, label: 'Center' })
        }

        return {
          id,
          layout: { x: newX, y: newY },
        }
      })

      batchUpdateVisualElements(activePage.id, updates as any)
      setGuides(activeGuides)
      setTimeout(() => setGuides([]), 800)
    },
    [visualElements, viewport, batchUpdateVisualElements, activePage.id],
  )

  // Resize Element Handler
  const handleResizeElement = useCallback(
    (elementId: string, bounds: { x: number; y: number; width: number; height: number }) => {
      updateVisualElement(activePage.id, elementId, {
        layout: bounds as any,
      })
    },
    [updateVisualElement, activePage.id],
  )

  // Keyboard Shortcuts for Visual Elements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName
      if (['INPUT', 'TEXTAREA'].includes(targetTag)) return

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedElementIds.length > 0) {
          e.preventDefault()
          handleDeleteSelected()
        }
      }

      if (modifier && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        handleDuplicateSelected()
      }

      if (modifier && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        if (e.shiftKey) {
          if (canRedo) redo()
        } else {
          if (canUndo) undo()
        }
      }

      if (modifier && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        setSelectedElementIds(visualElements.map((el) => el.id))
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElementIds.length > 0) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        let deltaX = 0
        let deltaY = 0
        if (e.key === 'ArrowUp') deltaY = -step
        if (e.key === 'ArrowDown') deltaY = step
        if (e.key === 'ArrowLeft') deltaX = -step
        if (e.key === 'ArrowRight') deltaX = step
        handleMoveElements(selectedElementIds, deltaX, deltaY)
      }

      if (!modifier) {
        if (e.key === 'v' || e.key === 'V') setActiveWireframeTool('select')
        if (e.key === 't' || e.key === 'T') setActiveWireframeTool('text')
        if (e.key === 'r' || e.key === 'R') setActiveWireframeTool('shape')
        if (e.key === 'b' || e.key === 'B') setActiveWireframeTool('button')
        if (e.key === 'c' || e.key === 'C') setActiveWireframeTool('card')
        if (e.key === 'i' || e.key === 'I') setActiveWireframeTool('image')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedElementIds,
    activePage.id,
    handleDeleteSelected,
    handleDuplicateSelected,
    clearElementSelection,
    setSelectedElementIds,
    visualElements,
    handleMoveElements,
    setActiveWireframeTool,
    undo,
    redo,
    canUndo,
    canRedo,
  ])

  const containerWidthClass =
    viewport === 'mobile'
      ? 'w-[375px]'
      : viewport === 'tablet'
      ? 'w-[768px]'
      : 'w-full max-w-[1100px]'

  const maxElementY = useMemo(() => {
    if (visualElements.length === 0) return 900
    return Math.max(900, ...visualElements.map((el) => el.layout.y + el.layout.height + 120))
  }, [visualElements])

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-100 dark:bg-[#030817] overflow-hidden select-none">
      {/* 1. Top Figma-inspired Visual Editor Toolbar */}
      <div className="h-12 bg-white dark:bg-[#080D19] border-b border-slate-200 dark:border-[#151F32] px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-20 gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveView('canvas')}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sitemap</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Page Switcher */}
          <select
            value={activePage.id}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            {project?.pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Direct Creation Actions & Tool Selection */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Quick Insert Actions */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0D1527] p-0.5 rounded-lg border border-slate-200 dark:border-[#1E293B] text-xs">
            <button
              onClick={handleAddText}
              title="Add Text Layer (T)"
              className="px-2 py-1 rounded-md flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Type className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-semibold">+ Text</span>
            </button>

            <button
              onClick={handleAddShape}
              title="Add Rectangle Shape (R)"
              className="px-2 py-1 rounded-md flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Square className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-semibold">+ Shape</span>
            </button>

            <button
              onClick={handleAddButton}
              title="Add Button Component (B)"
              className="px-2 py-1 rounded-md flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Square className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
              <span className="text-[11px] font-semibold">+ Button</span>
            </button>

            <button
              onClick={handleAddCard}
              title="Add Card Container (C)"
              className="px-2 py-1 rounded-md flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold">+ Card</span>
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0D1527] p-0.5 rounded-lg border border-slate-200 dark:border-[#1E293B] text-xs">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (⌘Z)"
              className="p-1.5 rounded-md text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (⌘⇧Z)"
              className="p-1.5 rounded-md text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Duplicate / Delete Selection Actions */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0D1527] p-0.5 rounded-lg border border-slate-200 dark:border-[#1E293B] text-xs">
            <button
              onClick={handleDuplicateSelected}
              disabled={selectedElementIds.length === 0}
              title="Duplicate Selected (⌘D)"
              className="p-1.5 rounded-md text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedElementIds.length === 0}
              title="Delete Selected (Del)"
              className="p-1.5 rounded-md text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Device Viewports & Sync */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewport('desktop')}
              title="Desktop View (1100px)"
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'desktop'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'tablet'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'mobile'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleSyncFromSections}
            title="Sync Visual Layers from Sitemap Sections"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1769E8] hover:bg-[#155ECC] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Sync Sections</span>
          </button>
        </div>
      </div>

      {/* 2. Main Visual Canvas Scroll Area */}
      <div
        onClick={handleCanvasClick}
        className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center relative cursor-default bg-[#030817]"
      >
        <div
          ref={containerRef}
          style={{ minHeight: `${maxElementY}px` }}
          className={`${containerWidthClass} transition-all duration-200 flex flex-col bg-[#070D1D] border border-slate-800 rounded-2xl shadow-2xl relative select-none`}
        >
          {/* Device Browser Header Bar */}
          <div className="py-2.5 px-4 bg-[#0A1226] border-b border-slate-800 flex items-center justify-between select-none rounded-t-2xl">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="flex-1 max-w-sm mx-4 bg-[#050914] border border-slate-800 py-1 px-3 rounded-full text-center text-[10px] font-mono text-slate-400 truncate shadow-inner">
              https://yoursite.com{activePage.slug}
            </div>

            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {viewport}
            </div>
          </div>

          {/* Visual Elements Canvas Artboard (Freeform placed elements with BoundingBox & Guides) */}
          <div className="relative flex-1 w-full" style={{ minHeight: `${maxElementY - 45}px` }}>
            {visualElements.map((el) => {
              const isSelected = selectedElementIds.includes(el.id)
              return (
                <VisualElementRenderer
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  onSelect={(e) => {
                    e.stopPropagation()
                    toggleElementSelection(el.id, e.shiftKey || e.metaKey || e.ctrlKey)
                    setPropertiesPanelOpen(true)
                    setPropertiesActiveTab('design')
                    setSidebarActiveTab('layers')
                  }}
                  onUpdateContent={(content) => {
                    updateVisualElement(activePage.id, el.id, { content })
                  }}
                />
              )
            })}

            {/* Bounding Box for Selected Elements */}
            {selectedElements.length > 0 && (
              <BoundingBox
                selectedElements={selectedElements}
                containerRef={containerRef}
                onMoveElements={handleMoveElements}
                onResizeElement={handleResizeElement}
              />
            )}

            {/* Alignment Snapping Guides */}
            <AlignmentGuides guides={guides} />

            {/* Empty State if No Elements */}
            {visualElements.length === 0 && (
              <div className="py-24 text-center space-y-3">
                <Layers className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
                <h4 className="text-sm font-semibold text-slate-200">
                  Empty Design Canvas
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click below to generate visual wireframe components from your sitemap sections, or click any tool above to design from scratch.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleSyncFromSections}
                    className="px-4 py-2 rounded-xl bg-[#1769E8] hover:bg-[#155ECC] text-white text-xs font-semibold shadow transition-colors"
                  >
                    Sync from Sitemap Sections
                  </button>
                  <button
                    onClick={handleAddShape}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow transition-colors"
                  >
                    + Add Shape
                  </button>
                  <button
                    onClick={handleAddText}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow transition-colors"
                  >
                    + Add Text
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const WireframeWorkspace: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const selectedPageId = useUIStore((s) => s.selectedPageId)
  const setActiveView = useUIStore((s) => s.setActiveView)

  if (!project || project.pages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#080D19]">
        <Layers className="w-12 h-12 text-slate-400 mb-3" />
        <h3 className="text-base font-semibold text-slate-200">
          No pages to wireframe yet
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
          Create pages on the Sitemap Canvas or generate a full architecture with AI first.
        </p>
        <button
          onClick={() => setActiveView('canvas')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
        >
          Return to Sitemap Canvas
        </button>
      </div>
    )
  }

  const activePage = project.pages.find((p) => p.id === selectedPageId) || project.pages[0]

  return <WireframeEditor activePage={activePage} />
}
