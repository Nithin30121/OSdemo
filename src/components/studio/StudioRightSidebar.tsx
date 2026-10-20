import React, { useRef, useState, useEffect } from 'react'
import {
  Sliders,
  Workflow,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Diamond,
  Trash2,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
} from 'lucide-react'
import { useStudioStore, MIN_RIGHT_SIDEBAR_WIDTH, MAX_RIGHT_SIDEBAR_WIDTH, MIN_CANVAS_WIDTH } from '../../store/useStudioStore'
import {
  FRAME_PRESETS,
  StudioFramePreset,
  PrototypeTransition,
} from '../../types/studio'
import { CanvasBackgroundSection } from './CanvasBackgroundSection'

const FONT_FAMILIES = ['Inter', 'Outfit', 'Roboto', 'Playfair Display', 'Fira Code', 'sans-serif']
const FONT_WEIGHTS = [
  { label: 'Regular (400)', value: 400 },
  { label: 'Medium (500)', value: 500 },
  { label: 'SemiBold (600)', value: 600 },
  { label: 'Bold (700)', value: 700 },
  { label: 'Black (900)', value: 900 },
]

export const StudioRightSidebar: React.FC = () => {
  const isOpen = useStudioStore((s) => s.isRightSidebarOpen)
  const toggleOpen = useStudioStore((s) => s.toggleRightSidebar)
  const rightTab = useStudioStore((s) => s.rightTab)
  const setRightTab = useStudioStore((s) => s.setRightTab)
  const width = useStudioStore((s) => s.rightSidebarWidth)
  const setWidth = useStudioStore((s) => s.setRightSidebarWidth)
  const [isDragging, setIsDragging] = useState(false)

  const document = useStudioStore((s) => s.document)
  const selectedIds = useStudioStore((s) => s.selectedIds)
  const updateNode = useStudioStore((s) => s.updateNode)
  const updateFrame = useStudioStore((s) => s.updateFrame)
  const toggleLock = useStudioStore((s) => s.toggleLock)
  const toggleHide = useStudioStore((s) => s.toggleHide)
  const deleteSelected = useStudioStore((s) => s.deleteSelected)
  const detachInstance = useStudioStore((s) => s.detachInstance)
  const uploadAsset = useStudioStore((s) => s.uploadAsset)
  const alignSelected = useStudioStore((s) => s.alignSelected)
  const distributeSelected = useStudioStore((s) => s.distributeSelected)

  const prototypes = useStudioStore((s) => s.document.prototypes)
  const addPrototype = useStudioStore((s) => s.addPrototype)
  const updatePrototype = useStudioStore((s) => s.updatePrototype)
  const deletePrototype = useStudioStore((s) => s.deletePrototype)

  const replaceImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.document.body.style.cursor = ''
        window.document.body.style.userSelect = ''
      }
    }
  }, [])

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const target = e.currentTarget
    try {
      target.setPointerCapture(e.pointerId)
    } catch {}
    setIsDragging(true)
    if (typeof window !== 'undefined') {
      window.document.body.style.cursor = 'col-resize'
      window.document.body.style.userSelect = 'none'
    }

    const startX = e.clientX
    const initialWidth = width

    const handlePointerMove = (ev: PointerEvent) => {
      ev.preventDefault()
      const deltaX = startX - ev.clientX
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
      const leftPanelWidth = useStudioStore.getState().isLeftSidebarOpen
        ? useStudioStore.getState().leftSidebarWidth
        : 40
      const maxAvailable = Math.max(MIN_RIGHT_SIDEBAR_WIDTH, windowWidth - leftPanelWidth - MIN_CANVAS_WIDTH)
      const effectiveMax = Math.min(MAX_RIGHT_SIDEBAR_WIDTH, maxAvailable)

      const nextWidth = Math.max(MIN_RIGHT_SIDEBAR_WIDTH, Math.min(effectiveMax, Math.round(initialWidth + deltaX)))
      setWidth(nextWidth)
    }

    const handlePointerUp = (ev: PointerEvent) => {
      try {
        if (target.hasPointerCapture?.(ev.pointerId)) {
          target.releasePointerCapture(ev.pointerId)
        } else if (target.hasPointerCapture?.(e.pointerId)) {
          target.releasePointerCapture(e.pointerId)
        }
      } catch {}
      setIsDragging(false)
      if (typeof window !== 'undefined') {
        window.document.body.style.cursor = ''
        window.document.body.style.userSelect = ''
      }
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  if (!isOpen) {
    return (
      <aside className="w-10 h-full flex flex-col items-center py-3 bg-[#292929] border-l border-[#424242] z-20 select-none">
        <button
          onClick={toggleOpen}
          title="Expand Properties Panel"
          className="p-1.5 rounded-lg text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </aside>
    )
  }

  // Determine active selection: Node or Frame
  const selectedNodes = document.nodes.filter((n) => selectedIds.includes(n.id))
  const selectedFrames = document.frames.filter((f) => selectedIds.includes(f.id))

  const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null
  const selectedFrame = selectedFrames.length > 0 ? selectedFrames[0] : null

  let collectiveBounds: { minX: number; minY: number; width: number; height: number } | null = null
  if (selectedIds.length > 1) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    selectedFrames.forEach((f) => {
      minX = Math.min(minX, f.x)
      minY = Math.min(minY, f.y)
      maxX = Math.max(maxX, f.x + f.width)
      maxY = Math.max(maxY, f.y + f.height)
    })
    selectedNodes.forEach((n) => {
      const parent = n.frameId ? document.frames.find((f) => f.id === n.frameId) : null
      const fx = parent ? parent.x : 0
      const fy = parent ? parent.y : 0
      const cx = fx + n.x
      const cy = fy + n.y
      minX = Math.min(minX, cx)
      minY = Math.min(minY, cy)
      maxX = Math.max(maxX, cx + n.width)
      maxY = Math.max(maxY, cy + n.height)
    })
    if (minX !== Infinity) {
      collectiveBounds = {
        minX: Math.round(minX),
        minY: Math.round(minY),
        width: Math.round(maxX - minX),
        height: Math.round(maxY - minY),
      }
    }
  }

  // If an element or frame is selected
  const currentFrame = selectedFrame

  // Prototype connection for current selected element
  const currentPrototype = selectedNode
    ? prototypes.find((p) => p.sourceNodeId === selectedNode.id)
    : null

  const handleReplaceImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedNode) return
    const asset = await uploadAsset(file)
    if (asset) {
      updateNode(selectedNode.id, {
        image: {
          ...selectedNode.image,
          assetId: asset.id,
          src: asset.dataUrl,
          fit: selectedNode.image?.fit || 'fill',
        },
      })
    }
  }

  return (
    <aside
      style={{ width: `${width}px` }}
      className="h-full flex flex-col bg-[#292929] border-l border-[#424242] z-20 flex-shrink-0 select-none text-[#F2F2F2] overflow-hidden relative"
    >
      {/* Draggable Vertical Resize Handle on Left Edge */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={width}
        aria-valuemin={MIN_RIGHT_SIDEBAR_WIDTH}
        aria-valuemax={MAX_RIGHT_SIDEBAR_WIDTH}
        tabIndex={0}
        id="right-sidebar-resize-handle"
        title="Drag to resize Design & Prototype panel"
        onPointerDown={handleResizePointerDown}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            setWidth(width + 10)
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            setWidth(width - 10)
          }
        }}
        className={`absolute top-0 left-0 w-1.5 h-full cursor-col-resize z-40 transition-colors duration-150 select-none group touch-none ${
          isDragging ? 'bg-[#1769E8]' : 'hover:bg-[#1769E8] bg-transparent'
        }`}
      >
        <div
          className={`w-[1px] h-full mx-auto transition-colors duration-150 ${
            isDragging ? 'bg-[#1769E8]' : 'bg-[#424242] group-hover:bg-[#1769E8]'
          }`}
        />
      </div>

      {/* Hidden file input for Replace Image */}
      <input
        ref={replaceImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceImageFile}
        className="hidden"
      />

      {/* 1. Top Tabs: Design vs Prototype */}
      <div className="p-2.5 border-b border-[#424242] flex items-center justify-between">
        <div className="flex items-center bg-[#303030] border border-[#424242] p-0.5 rounded-lg text-xs w-full mr-2">
          <button
            onClick={() => setRightTab('design')}
            id="tab-design-btn"
            className={`flex-1 py-1 rounded-md transition-colors flex items-center justify-center gap-1.5 font-semibold text-[11px] ${
              rightTab === 'design'
                ? 'selected-glass text-white font-semibold'
                : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]/50'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Design</span>
          </button>
          <button
            onClick={() => setRightTab('prototype')}
            id="tab-prototype-btn"
            className={`flex-1 py-1 rounded-md transition-colors flex items-center justify-center gap-1.5 font-semibold text-[11px] ${
              rightTab === 'prototype'
                ? 'selected-glass text-white font-semibold'
                : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]/50'
            }`}
          >
            <Workflow className="w-3 h-3" />
            <span>Prototype</span>
          </button>
        </div>

        <button
          onClick={toggleOpen}
          title="Collapse Panel"
          className="p-1.5 rounded-lg text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535] transition-colors flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Body Content */}
      {rightTab === 'design' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Canvas Settings View (when no element is selected) */}
          {!(selectedNode || selectedFrame) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#424242]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <LayoutGrid className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-[#F2F2F2] truncate text-xs">
                    Canvas & Workspace
                  </span>
                </div>
                <span className="text-[10px] text-[#A8A8A8] font-mono">
                  {document.frames.length} {document.frames.length === 1 ? 'frame' : 'frames'}
                </span>
              </div>

              {/* Canvas Background Section */}
              <CanvasBackgroundSection />

              {/* Document Overview Stats */}
              <div className="bg-[#303030] border border-[#424242] rounded-xl p-3 space-y-2">
                <span className="text-[10px] text-[#A8A8A8] uppercase tracking-wider font-semibold block">
                  Document Overview
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#242424] p-2 rounded border border-[#424242]">
                    <div className="text-[10px] text-[#A8A8A8]">Frames</div>
                    <div className="font-semibold text-sm text-[#F2F2F2]">{document.frames.length}</div>
                  </div>
                  <div className="bg-[#242424] p-2 rounded border border-[#424242]">
                    <div className="text-[10px] text-[#A8A8A8]">Elements</div>
                    <div className="font-semibold text-sm text-[#F2F2F2]">{document.nodes.length}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header Title with Lock/Hide/Delete */}
          {(selectedNode || selectedFrame) && (
            <div className="flex items-center justify-between pb-2 border-b border-[#424242]">
              <div className="flex items-center gap-1.5 min-w-0">
                {selectedIds.length > 1 ? (
                  <>
                    <LayoutGrid className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="font-bold text-[#F2F2F2] truncate text-xs">
                      {selectedIds.length} Objects Selected
                    </span>
                  </>
                ) : (
                  <>
                    {selectedNode?.component?.isMaster && (
                      <Diamond className="w-3.5 h-3.5 text-purple-400 fill-purple-400 flex-shrink-0" />
                    )}
                    <span className="font-bold text-[#F2F2F2] truncate text-xs">
                      {selectedNode?.name || selectedFrame?.name}
                    </span>
                    <span className="text-[10px] text-[#A8A8A8] font-mono uppercase">
                      ({selectedNode?.type || 'Frame'})
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    selectedIds.forEach((id) => toggleLock(id))
                  }}
                  className="p-1 rounded text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535] transition-colors"
                  title="Lock / Unlock"
                >
                  {(selectedNode || selectedFrame)?.isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    selectedIds.forEach((id) => toggleHide(id))
                  }}
                  className="p-1 rounded text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535] transition-colors"
                  title="Hide / Show"
                >
                  {(selectedNode || selectedFrame)?.isHidden ? (
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={deleteSelected}
                  className="p-1 rounded text-[#A8A8A8] hover:text-red-400 hover:bg-[#353535] transition-colors"
                  title="Delete element"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Alignment & Distribution Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-[#303030] border border-[#424242] rounded-lg p-1 flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <button
                  id="studio-align-left-btn"
                  onClick={() => alignSelected('left')}
                  title="Align Left (relative to selection/parent frame)"
                  className="p-1 rounded text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  id="studio-align-center-h-btn"
                  onClick={() => alignSelected('center-h')}
                  title="Align Horizontal Center"
                  className="p-1 rounded text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
                >
                  <AlignCenterHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  id="studio-align-right-btn"
                  onClick={() => alignSelected('right')}
                  title="Align Right"
                  className="p-1 rounded text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-[1px] h-4 bg-[#424242]" />

              <div className="flex items-center gap-0.5">
                <button
                  id="studio-align-top-btn"
                  onClick={() => alignSelected('top')}
                  title="Align Top"
                  className="p-1 rounded text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
                >
                  <AlignStartVertical className="w-3.5 h-3.5" />
                </button>
                <button
                  id="studio-align-center-v-btn"
                  onClick={() => alignSelected('center-v')}
                  title="Align Vertical Center"
                  className="p-1 rounded text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
                >
                  <AlignCenterVertical className="w-3.5 h-3.5" />
                </button>
                <button
                  id="studio-align-bottom-btn"
                  onClick={() => alignSelected('bottom')}
                  title="Align Bottom"
                  className="p-1 rounded text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
                >
                  <AlignEndVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-[1px] h-4 bg-[#424242]" />

              <div className="flex items-center gap-0.5">
                <button
                  id="studio-distribute-h-btn"
                  onClick={() => distributeSelected('horizontal')}
                  disabled={selectedIds.length < 3}
                  title={
                    selectedIds.length >= 3
                      ? "Distribute Horizontal Spacing"
                      : "Select 3 or more objects to distribute horizontally"
                  }
                  className={`p-1 rounded transition-colors ${
                    selectedIds.length >= 3
                      ? 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]'
                      : 'text-[#606060] cursor-not-allowed opacity-40'
                  }`}
                >
                  <AlignHorizontalDistributeCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  id="studio-distribute-v-btn"
                  onClick={() => distributeSelected('vertical')}
                  disabled={selectedIds.length < 3}
                  title={
                    selectedIds.length >= 3
                      ? "Distribute Vertical Spacing"
                      : "Select 3 or more objects to distribute vertically"
                  }
                  className={`p-1 rounded transition-colors ${
                    selectedIds.length >= 3
                      ? 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]'
                      : 'text-[#606060] cursor-not-allowed opacity-40'
                  }`}
                >
                  <AlignVerticalDistributeCenter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Component Master / Instance Banner */}
          {selectedNode?.type === 'component' && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Diamond className="w-4 h-4 text-purple-400 fill-purple-400" />
                <div>
                  <div className="font-bold text-[11px] text-purple-200">Component Master</div>
                  <div className="text-[10px] text-purple-300/80">Changes update all instances</div>
                </div>
              </div>
            </div>
          )}

          {selectedNode?.type === 'instance' && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Diamond className="w-4 h-4 text-purple-400" />
                <div className="min-w-0">
                  <div className="font-bold text-[11px] text-purple-200">Component Instance</div>
                  <div className="text-[10px] text-purple-300/80 truncate">
                    Linked to {selectedNode.component?.componentName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => detachInstance(selectedNode.id)}
                className="text-[10px] bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-semibold px-2 py-1 rounded transition-colors"
                title="Detach from master component"
              >
                Detach
              </button>
            </div>
          )}

          {/* 1. Position & Dimensions */}
          {(selectedNode || selectedFrame) && (
            <div>
              <label className="block text-[11px] font-bold text-[#A8A8A8] uppercase tracking-wider mb-2">
                {selectedIds.length > 1 ? 'Selection Dimensions & Position' : 'Dimensions & Position'}
              </label>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#A8A8A8] block mb-1">X</span>
                  <input
                    type="number"
                    value={collectiveBounds ? collectiveBounds.minX : Math.round((selectedNode || selectedFrame)!.x)}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (collectiveBounds) {
                        const deltaX = val - collectiveBounds.minX
                        selectedNodes.forEach((n) => updateNode(n.id, { x: n.x + deltaX }))
                        selectedFrames.forEach((f) => updateFrame(f.id, { x: f.x + deltaX }))
                      } else if (selectedNode) {
                        updateNode(selectedNode.id, { x: val })
                      } else if (selectedFrame) {
                        updateFrame(selectedFrame.id, { x: val })
                      }
                    }}
                    className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-[#F2F2F2] outline-none focus:border-[#A8A8A8]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#A8A8A8] block mb-1">Y</span>
                  <input
                    type="number"
                    value={collectiveBounds ? collectiveBounds.minY : Math.round((selectedNode || selectedFrame)!.y)}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (collectiveBounds) {
                        const deltaY = val - collectiveBounds.minY
                        selectedNodes.forEach((n) => updateNode(n.id, { y: n.y + deltaY }))
                        selectedFrames.forEach((f) => updateFrame(f.id, { y: f.y + deltaY }))
                      } else if (selectedNode) {
                        updateNode(selectedNode.id, { y: val })
                      } else if (selectedFrame) {
                        updateFrame(selectedFrame.id, { y: val })
                      }
                    }}
                    className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-[#F2F2F2] outline-none focus:border-[#A8A8A8]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#A8A8A8] block mb-1">W (Width)</span>
                  <input
                    type="number"
                    value={collectiveBounds ? collectiveBounds.width : Math.round((selectedNode || selectedFrame)!.width)}
                    onChange={(e) => {
                      const val = Math.max(10, Number(e.target.value))
                      if (collectiveBounds) {
                        const scaleX = val / Math.max(1, collectiveBounds.width)
                        selectedNodes.forEach((n) => updateNode(n.id, { width: Math.max(1, Math.round(n.width * scaleX)) }))
                        selectedFrames.forEach((f) => updateFrame(f.id, { width: Math.max(1, Math.round(f.width * scaleX)) }))
                      } else if (selectedNode) {
                        updateNode(selectedNode.id, { width: val })
                      } else if (selectedFrame) {
                        updateFrame(selectedFrame.id, { width: val })
                      }
                    }}
                    className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-[#F2F2F2] outline-none focus:border-[#A8A8A8]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#A8A8A8] block mb-1">H (Height)</span>
                  <input
                    type="number"
                    value={collectiveBounds ? collectiveBounds.height : Math.round((selectedNode || selectedFrame)!.height)}
                    onChange={(e) => {
                      const val = Math.max(10, Number(e.target.value))
                      if (collectiveBounds) {
                        const scaleY = val / Math.max(1, collectiveBounds.height)
                        selectedNodes.forEach((n) => updateNode(n.id, { height: Math.max(1, Math.round(n.height * scaleY)) }))
                        selectedFrames.forEach((f) => updateFrame(f.id, { height: Math.max(1, Math.round(f.height * scaleY)) }))
                      } else if (selectedNode) {
                        updateNode(selectedNode.id, { height: val })
                      } else if (selectedFrame) {
                        updateFrame(selectedFrame.id, { height: val })
                      }
                    }}
                    className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-[#F2F2F2] outline-none focus:border-[#A8A8A8]"
                  />
                </div>
              </div>

              {selectedNode && (
                <div className="grid grid-cols-2 gap-2 font-mono text-xs mt-2">
                  <div>
                    <span className="text-[10px] text-[#A8A8A8] block mb-1">Rotation (°)</span>
                    <input
                      type="number"
                      min={0}
                      max={360}
                      value={Math.round(selectedNode.rotation || 0)}
                      onChange={(e) => updateNode(selectedNode.id, { rotation: Number(e.target.value) })}
                      className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-[#F2F2F2] outline-none focus:border-[#A8A8A8]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A8A8A8] block mb-1">Radius (px)</span>
                    <input
                      type="number"
                      min={0}
                      value={selectedNode.cornerRadius || 0}
                      onChange={(e) => updateNode(selectedNode.id, { cornerRadius: Number(e.target.value) })}
                      className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-[#F2F2F2] outline-none focus:border-[#A8A8A8]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Frame-Specific Properties: Presets & Auto-Layout & Clipping */}
          {currentFrame && !selectedNode && (
            <div className="space-y-3 pt-3 border-t border-[#424242]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#A8A8A8] uppercase tracking-wider">
                  Frame Presets
                </span>
                <select
                  value={currentFrame.preset}
                  onChange={(e) => {
                    const presetId = e.target.value as StudioFramePreset
                    const p = FRAME_PRESETS.find((item) => item.id === presetId)
                    if (p) {
                      updateFrame(currentFrame.id, {
                        preset: presetId,
                        width: p.width,
                        height: p.height,
                      })
                    }
                  }}
                  className="bg-[#353535] border border-[#424242] rounded px-2 py-1 text-xs text-[#F2F2F2] outline-none focus:border-[#A8A8A8]"
                >
                  {FRAME_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.width}×{p.height})
                    </option>
                  ))}
                  <option value="custom">Custom Dimensions</option>
                </select>
              </div>

              {/* Frame Background */}
              <div>
                <span className="text-[10px] text-[#A8A8A8] block mb-1">Background Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentFrame.background || '#0F172A'}
                    onChange={(e) => updateFrame(currentFrame.id, { background: e.target.value })}
                    className="w-8 h-8 rounded border border-[#424242] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={currentFrame.background || '#0F172A'}
                    onChange={(e) => updateFrame(currentFrame.id, { background: e.target.value })}
                    className="flex-1 bg-[#353535] border border-[#424242] rounded px-2.5 py-1 text-xs text-[#F2F2F2] font-mono outline-none"
                  />
                </div>
              </div>

              {/* Clip Content Checkbox */}
              <label className="flex items-center gap-2 text-xs text-[#F2F2F2] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={currentFrame.clipsContent !== false}
                  onChange={(e) => updateFrame(currentFrame.id, { clipsContent: e.target.checked })}
                  className="rounded border-[#424242] text-[#1769E8] focus:ring-0"
                />
                <span>Clip content to frame bounds</span>
              </label>

              {/* Basic Auto-Layout Options */}
              <div className="pt-2 border-t border-[#424242]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#F2F2F2]">
                    <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
                    <span>Auto Layout</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentFrame.autoLayout?.enabled || false}
                    onChange={(e) =>
                      updateFrame(currentFrame.id, {
                        autoLayout: {
                          enabled: e.target.checked,
                          direction: currentFrame.autoLayout?.direction || 'vertical',
                          gap: currentFrame.autoLayout?.gap ?? 16,
                          padding: currentFrame.autoLayout?.padding ?? { top: 24, right: 24, bottom: 24, left: 24 },
                          alignment: currentFrame.autoLayout?.alignment || 'start',
                          hugContents: currentFrame.autoLayout?.hugContents || false,
                        },
                      })
                    }
                    className="rounded border-[#424242] text-purple-500"
                  />
                </div>

                {currentFrame.autoLayout?.enabled && (
                  <div className="space-y-2 bg-[#303030] p-2 rounded-lg border border-[#424242]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#A8A8A8]">Direction</span>
                      <div className="flex rounded border border-[#424242] overflow-hidden text-[10px] bg-[#303030] p-0.5 gap-0.5">
                        <button
                          onClick={() =>
                            updateFrame(currentFrame.id, {
                              autoLayout: { ...currentFrame.autoLayout!, direction: 'horizontal' },
                            })
                          }
                          className={`px-2 py-0.5 rounded transition-all ${
                            currentFrame.autoLayout?.direction === 'horizontal'
                              ? 'selected-glass text-white font-medium'
                              : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]'
                          }`}
                        >
                          Row (→)
                        </button>
                        <button
                          onClick={() =>
                            updateFrame(currentFrame.id, {
                              autoLayout: { ...currentFrame.autoLayout!, direction: 'vertical' },
                            })
                          }
                          className={`px-2 py-0.5 rounded transition-all ${
                            currentFrame.autoLayout?.direction === 'vertical'
                              ? 'selected-glass text-white font-medium'
                              : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]'
                          }`}
                        >
                          Col (↓)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[#A8A8A8] block mb-1">Item Gap (px)</span>
                        <input
                          type="number"
                          value={currentFrame.autoLayout?.gap ?? 16}
                          onChange={(e) =>
                            updateFrame(currentFrame.id, {
                              autoLayout: { ...currentFrame.autoLayout!, gap: Number(e.target.value) },
                            })
                          }
                          className="w-full bg-[#353535] border border-[#424242] rounded px-2 py-1 text-[#F2F2F2] font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#A8A8A8] block mb-1">Padding (px)</span>
                        <input
                          type="number"
                          value={currentFrame.autoLayout?.padding.top ?? 24}
                          onChange={(e) => {
                            const p = Number(e.target.value)
                            updateFrame(currentFrame.id, {
                              autoLayout: {
                                ...currentFrame.autoLayout!,
                                padding: { top: p, right: p, bottom: p, left: p },
                              },
                            })
                          }}
                          className="w-full bg-[#353535] border border-[#424242] rounded px-2 py-1 text-[#F2F2F2] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Typography Properties (if Text element is selected) */}
          {selectedNode?.type === 'text' && selectedNode.text && (
            <div className="space-y-2.5 pt-3 border-t border-[#424242]">
              <span className="text-[11px] font-bold text-[#A8A8A8] uppercase tracking-wider block">
                Typography
              </span>

              {/* Text Content */}
              <div>
                <span className="text-[10px] text-[#A8A8A8] block mb-1">Content</span>
                <textarea
                  rows={3}
                  value={selectedNode.text.content}
                  onChange={(e) =>
                    updateNode(selectedNode.id, {
                      text: { ...selectedNode.text!, content: e.target.value },
                    })
                  }
                  className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-[#F2F2F2] outline-none focus:border-[#707070] text-xs resize-none"
                />
              </div>

              {/* Font Family & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#A8A8A8] block mb-1">Font Family</span>
                  <select
                    value={selectedNode.text.fontFamily}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        text: { ...selectedNode.text!, fontFamily: e.target.value },
                      })
                    }
                    className="w-full bg-[#353535] border border-[#424242] rounded px-2 py-1 text-xs text-[#F2F2F2] outline-none"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-[#A8A8A8] block mb-1">Weight</span>
                  <select
                    value={selectedNode.text.fontWeight}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        text: { ...selectedNode.text!, fontWeight: Number(e.target.value) || e.target.value },
                      })
                    }
                    className="w-full bg-[#353535] border border-[#424242] rounded px-2 py-1 text-xs text-[#F2F2F2] outline-none"
                  >
                    {FONT_WEIGHTS.map((w) => (
                      <option key={w.label} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Font Size, Line Height, Letter Spacing */}
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#A8A8A8] block mb-1">Size</span>
                  <input
                    type="number"
                    value={selectedNode.text.fontSize}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        text: { ...selectedNode.text!, fontSize: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#353535] border border-[#424242] rounded px-2 py-1 text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#A8A8A8] block mb-1">Line</span>
                  <input
                    type="number"
                    step={0.1}
                    value={Number(selectedNode.text.lineHeight) || 1.4}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        text: { ...selectedNode.text!, lineHeight: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#353535] border border-[#424242] rounded px-2 py-1 text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#A8A8A8] block mb-1">Track</span>
                  <input
                    type="number"
                    step={0.5}
                    value={Number(selectedNode.text.letterSpacing) || 0}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        text: { ...selectedNode.text!, letterSpacing: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#353535] border border-[#424242] rounded px-2 py-1 text-[#F2F2F2]"
                  />
                </div>
              </div>

              {/* Text Alignment & Color */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 bg-[#303030] p-0.5 rounded border border-[#424242]">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        updateNode(selectedNode.id, {
                          text: { ...selectedNode.text!, textAlign: align },
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                        selectedNode.text?.textAlign === align
                          ? 'selected-glass text-white'
                          : 'text-[#A8A8A8] hover:text-[#F2F2F2]'
                      }`}
                    >
                      {align[0]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={selectedNode.text.color || '#FFFFFF'}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        text: { ...selectedNode.text!, color: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded border border-[#424242] bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-[#F2F2F2]">
                    {selectedNode.text.color || '#FFFFFF'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Image Properties (if Image element is selected) */}
          {selectedNode?.type === 'image' && (
            <div className="space-y-3 pt-3 border-t border-[#424242]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#A8A8A8] uppercase tracking-wider">
                  Image Properties
                </span>
                <button
                  onClick={() => replaceImageInputRef.current?.click()}
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300"
                >
                  Replace Image
                </button>
              </div>

              {selectedNode.image?.src && (
                <div className="h-28 w-full bg-[#242424] rounded-lg border border-[#424242] overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedNode.image.src}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              <div>
                <span className="text-[10px] text-[#A8A8A8] block mb-1">Fit Mode</span>
                <div className="grid grid-cols-3 gap-1 bg-[#303030] p-0.5 rounded border border-[#424242]">
                  {(['fill', 'fit', 'crop'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() =>
                        updateNode(selectedNode.id, {
                          image: { ...selectedNode.image!, fit: mode },
                        })
                      }
                      className={`py-1 rounded text-[11px] font-medium capitalize transition-all ${
                        selectedNode.image?.fit === mode
                          ? 'selected-glass text-white shadow-sm'
                          : 'text-[#A8A8A8] hover:text-[#F2F2F2]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. Fill & Stroke & Appearance (for all shapes & components) */}
          {selectedNode && selectedNode.type !== 'text' && (
            <div className="space-y-3 pt-3 border-t border-[#424242]">
              <span className="text-[11px] font-bold text-[#A8A8A8] uppercase tracking-wider block">
                Fill & Appearance
              </span>

              {/* Fill Type: Solid vs Gradient */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedNode.fill?.color || '#1769E8'}
                  onChange={(e) =>
                    updateNode(selectedNode.id, {
                      fill: {
                        type: 'solid',
                        color: e.target.value,
                      },
                    })
                  }
                  className="w-8 h-8 rounded border border-[#424242] cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={selectedNode.fill?.color || '#1769E8'}
                  onChange={(e) =>
                    updateNode(selectedNode.id, {
                      fill: { ...selectedNode.fill, color: e.target.value },
                    })
                  }
                  className="flex-1 bg-[#353535] border border-[#424242] rounded px-2.5 py-1 text-xs text-[#F2F2F2] font-mono outline-none"
                />
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex justify-between text-[10px] text-[#A8A8A8] mb-1">
                  <span>Opacity</span>
                  <span className="font-mono text-[#F2F2F2]">{Math.round((selectedNode.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedNode.opacity ?? 1}
                  onChange={(e) => updateNode(selectedNode.id, { opacity: Number(e.target.value) })}
                  className="w-full accent-[#707070]"
                />
              </div>

              {/* Stroke */}
              <div className="pt-2 border-t border-[#424242]">
                <span className="text-[10px] text-[#A8A8A8] block mb-1">Stroke (Border)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedNode.stroke?.color || '#334155'}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        stroke: {
                          color: e.target.value,
                          width: selectedNode.stroke?.width || 1,
                          style: selectedNode.stroke?.style || 'solid',
                        },
                      })
                    }
                    className="w-6 h-6 rounded border border-[#424242] bg-transparent cursor-pointer"
                  />
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={selectedNode.stroke?.width || 0}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        stroke: {
                          color: selectedNode.stroke?.color || '#334155',
                          width: Number(e.target.value),
                          style: selectedNode.stroke?.style || 'solid',
                        },
                      })
                    }
                    className="w-16 bg-[#353535] border border-[#424242] rounded px-2 py-1 text-[#F2F2F2] font-mono text-xs"
                  />
                  <select
                    value={selectedNode.stroke?.style || 'solid'}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        stroke: {
                          color: selectedNode.stroke?.color || '#334155',
                          width: selectedNode.stroke?.width || 1,
                          style: e.target.value as any,
                        },
                      })
                    }
                    className="flex-1 bg-[#353535] border border-[#424242] rounded px-2 py-1 text-xs text-[#F2F2F2]"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>

              {/* Shadow */}
              <div className="pt-2 border-t border-[#424242]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#A8A8A8]">Drop Shadow</span>
                  <input
                    type="checkbox"
                    checked={!!selectedNode.shadow}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        shadow: e.target.checked
                          ? { x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(0,0,0,0.4)' }
                          : undefined,
                      })
                    }
                    className="rounded border-[#424242] text-[#1769E8]"
                  />
                </div>
                {selectedNode.shadow && (
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#A8A8A8]">Blur: {selectedNode.shadow.blur}px</span>
                      <input
                        type="range"
                        min={0}
                        max={64}
                        value={selectedNode.shadow.blur}
                        onChange={(e) =>
                          updateNode(selectedNode.id, {
                            shadow: { ...selectedNode.shadow!, blur: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-[#707070]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A8A8A8]">Y Offset: {selectedNode.shadow.y}px</span>
                      <input
                        type="range"
                        min={0}
                        max={32}
                        value={selectedNode.shadow.y}
                        onChange={(e) =>
                          updateNode(selectedNode.id, {
                            shadow: { ...selectedNode.shadow!, y: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-[#707070]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Workspace Canvas Background (available also when element is selected) */}
          {(selectedNode || selectedFrame) && (
            <div className="pt-2 border-t border-[#424242]">
              <CanvasBackgroundSection />
            </div>
          )}
        </div>
      ) : (
        /* PROTOTYPE TAB */
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          <div>
            <span className="font-bold text-[#F2F2F2] text-xs block mb-1">Interactive Connections</span>
            <p className="text-[11px] text-[#A8A8A8]">
              Link canvas elements to target frames to create clickable interactive prototypes.
            </p>
          </div>

          {selectedNode ? (
            <div className="bg-[#303030] border border-[#424242] rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between border-b border-[#424242] pb-2">
                <span className="font-semibold text-[#F2F2F2] truncate">{selectedNode.name}</span>
                {currentPrototype && (
                  <button
                    onClick={() => deletePrototype(currentPrototype.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Remove connection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Destination Frame */}
              <div>
                <label className="text-[10px] text-[#A8A8A8] block mb-1">Navigate To Frame</label>
                <select
                  value={currentPrototype?.destinationFrameId || ''}
                  onChange={(e) => {
                    const destId = e.target.value
                    if (!destId) {
                      if (currentPrototype) deletePrototype(currentPrototype.id)
                    } else {
                      addPrototype({
                        sourceNodeId: selectedNode.id,
                        destinationFrameId: destId,
                        trigger: currentPrototype?.trigger || 'click',
                        action: 'navigate',
                        transition: currentPrototype?.transition || 'slide-left',
                        durationMs: currentPrototype?.durationMs || 300,
                      })
                    }
                  }}
                  className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-xs text-[#F2F2F2] outline-none focus:border-[#707070]"
                >
                  <option value="">-- No Connection --</option>
                  {document.frames.map((frame) => (
                    <option key={frame.id} value={frame.id}>
                      {frame.name} ({frame.preset})
                    </option>
                  ))}
                </select>
              </div>

              {currentPrototype && (
                <>
                  {/* Trigger */}
                  <div>
                    <label className="text-[10px] text-[#A8A8A8] block mb-1">Trigger</label>
                    <div className="grid grid-cols-2 gap-1 bg-[#242424] p-0.5 rounded border border-[#424242]">
                      {(['click', 'hover'] as const).map((trig) => (
                        <button
                          key={trig}
                          onClick={() => updatePrototype(currentPrototype.id, { trigger: trig })}
                          className={`py-1 rounded text-[11px] capitalize font-medium transition-all ${
                            currentPrototype.trigger === trig
                              ? 'selected-glass text-white'
                              : 'text-[#A8A8A8] hover:text-[#F2F2F2]'
                          }`}
                        >
                          On {trig}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transition Animation */}
                  <div>
                    <label className="text-[10px] text-[#A8A8A8] block mb-1">Transition</label>
                    <select
                      value={currentPrototype.transition}
                      onChange={(e) =>
                        updatePrototype(currentPrototype.id, {
                          transition: e.target.value as PrototypeTransition,
                        })
                      }
                      className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-xs text-[#F2F2F2] outline-none"
                    >
                      <option value="instant">Instant</option>
                      <option value="dissolve">Dissolve</option>
                      <option value="slide-left">Slide Left</option>
                      <option value="slide-right">Slide Right</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-[#303030] border border-[#424242] rounded-xl p-4 text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="text-xs text-[#F2F2F2] font-medium">Select an element</p>
              <p className="text-[10px] text-[#A8A8A8] mt-0.5">
                Click any button, card, or element on canvas to attach prototype navigation interactions.
              </p>
            </div>
          )}

          {/* List of existing prototype connections */}
          {prototypes.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-[#A8A8A8] tracking-wider block mb-2">
                All Prototype Connections ({prototypes.length})
              </span>
              <div className="space-y-1.5">
                {prototypes.map((proto) => {
                  const source = document.nodes.find((n) => n.id === proto.sourceNodeId)
                  const dest = document.frames.find((f) => f.id === proto.destinationFrameId)
                  return (
                    <div
                      key={proto.id}
                      className="p-2 rounded-lg bg-[#303030] border border-[#424242] flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-purple-300 truncate max-w-[90px]">
                          {source?.name || 'Unknown'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#A8A8A8] flex-shrink-0" />
                        <span className="text-[#F2F2F2] truncate max-w-[90px]">
                          {dest?.name || 'Frame'}
                        </span>
                      </div>
                      <button
                        onClick={() => deletePrototype(proto.id)}
                        className="text-[#A8A8A8] hover:text-red-400 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
