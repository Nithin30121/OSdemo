import React, { useState, useRef, useEffect } from 'react'
import {
  Layers,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Upload,
  Diamond,
  Frame,
  Square,
  Circle,
  Triangle,
  Minus,
  MoveRight,
  Pen,
  Type,
  Plus,
  Folder,
} from 'lucide-react'
import { useStudioStore, MIN_LEFT_SIDEBAR_WIDTH, MAX_LEFT_SIDEBAR_WIDTH, MIN_CANVAS_WIDTH } from '../../store/useStudioStore'
import { StudioNode, StudioFrame, StudioAsset } from '../../types/studio'

export const StudioLeftSidebar: React.FC = () => {
  const isOpen = useStudioStore((s) => s.isLeftSidebarOpen)
  const toggleOpen = useStudioStore((s) => s.toggleLeftSidebar)
  const leftTab = useStudioStore((s) => s.leftTab)
  const setLeftTab = useStudioStore((s) => s.setLeftTab)
  const width = useStudioStore((s) => s.leftSidebarWidth)
  const setWidth = useStudioStore((s) => s.setLeftSidebarWidth)
  const [isDragging, setIsDragging] = useState(false)

  const document = useStudioStore((s) => s.document)
  const selectedIds = useStudioStore((s) => s.selectedIds)
  const setSelectedIds = useStudioStore((s) => s.setSelectedIds)
  const toggleSelectId = useStudioStore((s) => s.toggleSelectId)
  const toggleLock = useStudioStore((s) => s.toggleLock)
  const toggleHide = useStudioStore((s) => s.toggleHide)
  const deleteNode = useStudioStore((s) => s.deleteNode)
  const deleteFrame = useStudioStore((s) => s.deleteFrame)
  const updateNode = useStudioStore((s) => s.updateNode)
  const updateFrame = useStudioStore((s) => s.updateFrame)
  const addNode = useStudioStore((s) => s.addNode)

  const assets = useStudioStore((s) => s.assets)
  const uploadAsset = useStudioStore((s) => s.uploadAsset)
  const deleteAsset = useStudioStore((s) => s.deleteAsset)
  const openAssetPreview = useStudioStore((s) => s.openAssetPreview)
  const createInstanceFromMaster = useStudioStore((s) => s.createInstanceFromMaster)
  const reparentNode = useStudioStore((s) => s.reparentNode)

  const [collapsedFrames, setCollapsedFrames] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag-and-drop layers reparenting state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [layerDropTarget, setLayerDropTarget] = useState<{
    type: 'frame' | 'root' | 'node'
    id?: string
    position?: 'before' | 'after'
  } | null>(null)

  const extractNodeIdFromEvent = (e: React.DragEvent) => {
    try {
      const json = e.dataTransfer.getData('application/json')
      if (json) {
        const parsed = JSON.parse(json)
        if (parsed.type === 'studio-node' && parsed.nodeId) {
          return parsed.nodeId
        }
      }
    } catch {}
    const plain = e.dataTransfer.getData('text/plain')
    if (plain && document.nodes.some((n) => n.id === plain)) {
      return plain
    }
    return null
  }

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.document.body.style.cursor = ''
        window.document.body.style.userSelect = ''
      }
    }
  }, [])

  const toggleFrameCollapse = (frameId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCollapsedFrames((prev) => ({ ...prev, [frameId]: !prev[frameId] }))
  }

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(id)
    setEditingName(currentName)
  }

  const handleFinishRename = (id: string, isFrame: boolean) => {
    if (editingName.trim()) {
      if (isFrame) {
        updateFrame(id, { name: editingName.trim() })
      } else {
        updateNode(id, { name: editingName.trim() })
      }
    }
    setEditingId(null)
  }

  const getNodeIcon = (node: StudioNode) => {
    if (node.type === 'component') return <Diamond className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
    if (node.type === 'instance') return <Diamond className="w-3.5 h-3.5 text-purple-400" />
    if (node.type === 'group') return <Folder className="w-3.5 h-3.5 text-amber-400" />
    if (node.type === 'text') return <Type className="w-3.5 h-3.5 text-blue-400" />
    if (node.type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
    if (node.type === 'ellipse') return <Circle className="w-3.5 h-3.5 text-pink-400" />
    if (node.type === 'polygon') return <Triangle className="w-3.5 h-3.5 text-yellow-400" />
    if (node.type === 'line') return <Minus className="w-3.5 h-3.5 text-slate-400" />
    if (node.type === 'arrow') return <MoveRight className="w-3.5 h-3.5 text-cyan-400" />
    if (node.type === 'drawing') return <Pen className="w-3.5 h-3.5 text-violet-400" />
    return <Square className="w-3.5 h-3.5 text-blue-400" />
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    for (let i = 0; i < files.length; i++) {
      await uploadAsset(files[i])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleInsertAsset = (asset: StudioAsset) => {
    const naturalWidth = asset.width || 320
    const naturalHeight = asset.height || 240
    let width = naturalWidth
    let height = naturalHeight

    const maxW = 400
    const maxH = 300
    if (width > maxW || height > maxH) {
      const ratio = Math.min(maxW / width, maxH / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    const newNode = addNode({
      type: 'image',
      name: asset.name.replace(/\.[^/.]+$/, ''),
      width,
      height,
      fill: { type: 'none', color: 'transparent' },
      image: {
        assetId: asset.id,
        src: asset.dataUrl,
        fit: 'fill',
        aspectRatioLocked: true,
        naturalWidth: asset.width,
        naturalHeight: asset.height,
      },
    })
    setSelectedIds([newNode.id])
  }

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
      const deltaX = ev.clientX - startX
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
      const rightPanelWidth = useStudioStore.getState().isRightSidebarOpen
        ? useStudioStore.getState().rightSidebarWidth
        : 40
      const maxAvailable = Math.max(MIN_LEFT_SIDEBAR_WIDTH, windowWidth - rightPanelWidth - MIN_CANVAS_WIDTH)
      const effectiveMax = Math.min(MAX_LEFT_SIDEBAR_WIDTH, maxAvailable)

      const nextWidth = Math.max(MIN_LEFT_SIDEBAR_WIDTH, Math.min(effectiveMax, Math.round(initialWidth + deltaX)))
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
      <aside className="w-10 h-full flex flex-col items-center py-3 bg-[#292929] border-r border-[#424242] z-20 select-none">
        <button
          onClick={toggleOpen}
          title="Expand Left Panel"
          className="p-1.5 rounded-lg text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </aside>
    )
  }

  // Find all component masters for the components library
  const componentMasters = document.nodes.filter((n) => n.component?.isMaster)

  return (
    <aside
      style={{ width: `${width}px` }}
      className="h-full flex flex-col bg-[#292929] border-r border-[#424242] z-20 flex-shrink-0 select-none text-[#F2F2F2] overflow-hidden relative"
    >
      {/* 1. Header: Switcher between Layers & Assets with Collapse button */}
      <div className="p-2.5 border-b border-[#424242] flex items-center justify-between">
        <div className="flex items-center bg-[#303030] border border-[#424242] p-0.5 rounded-lg text-xs w-full mr-2">
          <button
            onClick={() => setLeftTab('layers')}
            id="tab-layers-btn"
            className={`flex-1 py-1 rounded-md transition-colors flex items-center justify-center gap-1.5 font-semibold text-[11px] ${
              leftTab === 'layers'
                ? 'selected-glass text-white font-semibold'
                : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]/50'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Layers</span>
          </button>
          <button
            onClick={() => setLeftTab('assets')}
            id="tab-assets-btn"
            className={`flex-1 py-1 rounded-md transition-colors flex items-center justify-center gap-1.5 font-semibold text-[11px] ${
              leftTab === 'assets'
                ? 'selected-glass text-white font-semibold'
                : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]/50'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Assets</span>
          </button>
        </div>

        <button
          onClick={toggleOpen}
          title="Collapse Panel"
          className="p-1.5 rounded-lg text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535] transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Body: Layers Tree or Assets & Components */}
      {leftTab === 'layers' ? (
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {/* Frames & their Child Nodes */}
          {document.frames.map((frame: StudioFrame) => {
            const isFrameSelected = selectedIds.includes(frame.id)
            const isCollapsed = collapsedFrames[frame.id]
            const frameChildren = document.nodes.filter((n) => n.frameId === frame.id)
            const isFrameTargeted = layerDropTarget?.type === 'frame' && layerDropTarget?.id === frame.id

            return (
              <div key={frame.id} className="rounded-lg overflow-hidden">
                {/* Frame Row */}
                <div
                  onClick={(e) => toggleSelectId(frame.id, e.shiftKey)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.dataTransfer.dropEffect = 'move'
                    if (layerDropTarget?.type !== 'frame' || layerDropTarget?.id !== frame.id) {
                      setLayerDropTarget({ type: 'frame', id: frame.id })
                      if (collapsedFrames[frame.id]) {
                        setCollapsedFrames((prev) => ({ ...prev, [frame.id]: false }))
                      }
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (layerDropTarget?.id === frame.id) {
                      setLayerDropTarget(null)
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const nodeId = draggedNodeId || extractNodeIdFromEvent(e)
                    if (nodeId) {
                      reparentNode(nodeId, frame.id)
                    }
                    setDraggedNodeId(null)
                    setLayerDropTarget(null)
                  }}
                  className={`group px-2 py-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-all ${
                    isFrameTargeted
                      ? 'ring-2 ring-[#1769E8] bg-[#1769E8]/25 border border-blue-500 font-semibold text-white'
                      : isFrameSelected
                      ? 'selected-glass text-white font-semibold'
                      : 'hover:bg-[#353535] text-[#F2F2F2]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      onClick={(e) => toggleFrameCollapse(frame.id, e)}
                      className="text-[#A8A8A8] hover:text-[#F2F2F2] p-0.5"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    <Frame className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />

                    {editingId === frame.id ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleFinishRename(frame.id, true)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(frame.id, true)}
                        className="bg-[#353535] border border-[#424242] rounded px-1 text-xs text-[#F2F2F2] outline-none w-28"
                      />
                    ) : (
                      <span
                        onDoubleClick={(e) => handleStartRename(frame.id, frame.name, e)}
                        className="truncate text-xs font-semibold"
                        title={frame.name}
                      >
                        {frame.name}
                      </span>
                    )}

                    {isFrameTargeted && (
                      <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-semibold ml-2 shadow">
                        Drop into frame
                      </span>
                    )}
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleHide(frame.id)
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title={frame.isHidden ? 'Show frame' : 'Hide frame'}
                    >
                      {frame.isHidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLock(frame.id)
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title={frame.isLocked ? 'Unlock frame' : 'Lock frame'}
                    >
                      {frame.isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFrame(frame.id)
                      }}
                      className="p-1 text-slate-400 hover:text-red-400"
                      title="Delete frame"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Child Nodes inside Frame */}
                {!isCollapsed && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.dataTransfer.dropEffect = 'move'
                      if (layerDropTarget?.type !== 'frame' || layerDropTarget?.id !== frame.id) {
                        setLayerDropTarget({ type: 'frame', id: frame.id })
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const nodeId = draggedNodeId || extractNodeIdFromEvent(e)
                      if (nodeId) {
                        reparentNode(nodeId, frame.id)
                      }
                      setDraggedNodeId(null)
                      setLayerDropTarget(null)
                    }}
                    className="pl-5 space-y-0.5 mt-0.5 border-l border-[#424242] ml-3"
                  >
                    {frameChildren.length === 0 ? (
                      <div
                        className={`py-1.5 px-2 text-[10px] rounded transition-all ${
                          isFrameTargeted
                            ? 'bg-blue-500/20 text-blue-300 border border-dashed border-blue-400 font-medium'
                            : 'text-[#707070] italic'
                        }`}
                      >
                        {isFrameTargeted ? 'Drop element here' : 'No elements in frame'}
                      </div>
                    ) : (
                      frameChildren.map((node) => {
                        const isNodeSelected = selectedIds.includes(node.id)
                        const isTargeted = layerDropTarget?.type === 'node' && layerDropTarget?.id === node.id

                        return (
                          <div
                            key={node.id}
                            draggable={editingId !== node.id}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('application/json', JSON.stringify({ type: 'studio-node', nodeId: node.id }))
                              e.dataTransfer.setData('text/plain', node.id)
                              e.dataTransfer.effectAllowed = 'move'
                              setDraggedNodeId(node.id)
                            }}
                            onDragEnd={() => {
                              setDraggedNodeId(null)
                              setLayerDropTarget(null)
                            }}
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              e.dataTransfer.dropEffect = 'move'
                              const rect = e.currentTarget.getBoundingClientRect()
                              const isTop = e.clientY < rect.top + rect.height / 2
                              setLayerDropTarget({
                                type: 'node',
                                id: node.id,
                                position: isTop ? 'before' : 'after',
                              })
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (layerDropTarget?.id === node.id) {
                                setLayerDropTarget(null)
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              const draggedId = draggedNodeId || extractNodeIdFromEvent(e)
                              if (draggedId && draggedId !== node.id) {
                                if (layerDropTarget?.position === 'before') {
                                  reparentNode(draggedId, node.frameId, node.id)
                                } else {
                                  const childIdx = frameChildren.findIndex((n) => n.id === node.id)
                                  const nextSibling = frameChildren[childIdx + 1]
                                  reparentNode(draggedId, node.frameId, nextSibling ? nextSibling.id : null)
                                }
                              }
                              setDraggedNodeId(null)
                              setLayerDropTarget(null)
                            }}
                            onClick={(e) => toggleSelectId(node.id, e.shiftKey)}
                            className={`group px-2 py-1 rounded-md flex items-center justify-between text-xs cursor-pointer transition-all ${
                              isNodeSelected
                                ? 'selected-glass text-white font-medium'
                                : 'hover:bg-[#353535] text-[#A8A8A8] hover:text-[#F2F2F2]'
                            } ${
                              isTargeted
                                ? layerDropTarget.position === 'before'
                                  ? 'border-t-2 border-[#1769E8]'
                                  : 'border-b-2 border-[#1769E8]'
                                : ''
                            } ${draggedNodeId === node.id ? 'opacity-40' : ''}`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {getNodeIcon(node)}

                              {editingId === node.id ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onBlur={() => handleFinishRename(node.id, false)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(node.id, false)}
                                  className="bg-[#353535] border border-[#424242] rounded px-1 text-xs text-[#F2F2F2] outline-none w-24"
                                />
                              ) : (
                                <span
                                  onDoubleClick={(e) => handleStartRename(node.id, node.name, e)}
                                  className="truncate text-[11px]"
                                  title={node.name}
                                >
                                  {node.name}
                                </span>
                              )}
                            </div>

                            {/* Node Actions */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleHide(node.id)
                                }}
                                className="p-0.5 text-slate-400 hover:text-white"
                                title={node.isHidden ? 'Show' : 'Hide'}
                              >
                                {node.isHidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleLock(node.id)
                                }}
                                className="p-0.5 text-slate-400 hover:text-white"
                                title={node.isLocked ? 'Unlock' : 'Lock'}
                              >
                                {node.isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNode(node.id)
                                }}
                                className="p-0.5 text-slate-400 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Root Canvas Nodes Dropzone (Always available for reparenting out of frames) */}
          {(() => {
            const rootNodes = document.nodes.filter((n) => !n.frameId)
            const isRootTargeted = layerDropTarget?.type === 'root'

            return (
              <div
                id="layers-root-canvas-dropzone"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'move'
                  if (layerDropTarget?.type !== 'root') {
                    setLayerDropTarget({ type: 'root' })
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (layerDropTarget?.type === 'root') {
                    setLayerDropTarget(null)
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const nodeId = draggedNodeId || extractNodeIdFromEvent(e)
                  if (nodeId) {
                    reparentNode(nodeId, null)
                  }
                  setDraggedNodeId(null)
                  setLayerDropTarget(null)
                }}
                className={`pt-2 border-t border-[#424242] rounded-lg transition-all ${
                  isRootTargeted
                    ? 'bg-blue-500/10 ring-2 ring-blue-500/40 p-1.5'
                    : ''
                }`}
              >
                <div className="px-2 py-1 flex items-center justify-between text-[10px] uppercase font-bold text-[#A8A8A8] tracking-wider">
                  <span>Root Canvas Elements</span>
                  {isRootTargeted && (
                    <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-semibold normal-case">
                      Move to Root
                    </span>
                  )}
                </div>

                {rootNodes.length === 0 ? (
                  <div
                    className={`py-2 px-3 text-[10px] rounded text-center transition-all ${
                      isRootTargeted
                        ? 'bg-blue-500/20 text-blue-300 border border-dashed border-blue-400 font-medium'
                        : 'text-[#707070] italic border border-dashed border-[#424242]'
                    }`}
                  >
                    {isRootTargeted ? 'Drop here to move out of frame' : 'Drag layers here to move out of frames'}
                  </div>
                ) : (
                  rootNodes.map((node) => {
                    const isNodeSelected = selectedIds.includes(node.id)
                    const isTargeted = layerDropTarget?.type === 'node' && layerDropTarget?.id === node.id

                    return (
                      <div
                        key={node.id}
                        draggable={editingId !== node.id}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify({ type: 'studio-node', nodeId: node.id }))
                          e.dataTransfer.setData('text/plain', node.id)
                          e.dataTransfer.effectAllowed = 'move'
                          setDraggedNodeId(node.id)
                        }}
                        onDragEnd={() => {
                          setDraggedNodeId(null)
                          setLayerDropTarget(null)
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          e.dataTransfer.dropEffect = 'move'
                          const rect = e.currentTarget.getBoundingClientRect()
                          const isTop = e.clientY < rect.top + rect.height / 2
                          setLayerDropTarget({
                            type: 'node',
                            id: node.id,
                            position: isTop ? 'before' : 'after',
                          })
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (layerDropTarget?.id === node.id) {
                            setLayerDropTarget(null)
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const draggedId = draggedNodeId || extractNodeIdFromEvent(e)
                          if (draggedId && draggedId !== node.id) {
                            if (layerDropTarget?.position === 'before') {
                              reparentNode(draggedId, null, node.id)
                            } else {
                              const rootIdx = rootNodes.findIndex((n) => n.id === node.id)
                              const nextSibling = rootNodes[rootIdx + 1]
                              reparentNode(draggedId, null, nextSibling ? nextSibling.id : null)
                            }
                          }
                          setDraggedNodeId(null)
                          setLayerDropTarget(null)
                        }}
                        onClick={(e) => toggleSelectId(node.id, e.shiftKey)}
                        className={`group px-2 py-1 rounded-md flex items-center justify-between text-xs cursor-pointer transition-all ${
                          isNodeSelected
                            ? 'selected-glass text-white font-medium'
                            : 'hover:bg-[#353535] text-[#A8A8A8] hover:text-[#F2F2F2]'
                        } ${
                          isTargeted
                            ? layerDropTarget.position === 'before'
                              ? 'border-t-2 border-[#1769E8]'
                              : 'border-b-2 border-[#1769E8]'
                            : ''
                        } ${draggedNodeId === node.id ? 'opacity-40' : ''}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {getNodeIcon(node)}
                          <span className="truncate text-[11px]">{node.name}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNode(node.id)
                            }}
                            className="p-0.5 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )
          })()}
        </div>
      ) : (
        /* ASSETS & COMPONENTS TAB */
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Image Assets Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200">Image Assets</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                id="assets-panel-import-btn"
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-white transition-colors bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 px-2.5 py-1 rounded-md"
                title="Import images from your Mac"
              >
                <Upload className="w-3 h-3 text-purple-300" />
                <span>Import Assets</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.avif,image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {assets.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                id="assets-empty-state"
                className="border-2 border-dashed border-[#424242] hover:border-purple-500/50 rounded-xl p-5 text-center cursor-pointer transition-all group bg-[#303030]/50"
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-[#A8A8A8] group-hover:text-purple-400 transition-colors" />
                <p className="text-xs text-[#F2F2F2] font-medium leading-relaxed">
                  Your canvas starts here. Import images from your Mac or drag files onto the canvas.
                </p>
                <p className="text-[10px] text-[#A8A8A8] mt-2 font-mono">
                  PNG, JPEG, WebP, GIF, SVG, AVIF
                </p>
                <button
                  type="button"
                  className="mt-3 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Images…</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    id={`asset-thumb-${asset.id}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'asset', assetId: asset.id }))
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="group relative bg-[#303030] border border-[#424242] rounded-lg overflow-hidden hover:border-slate-400 transition-all cursor-pointer"
                    onClick={() => openAssetPreview(asset.id)}
                    title={`Click to preview "${asset.name}" in full-screen, or drag onto canvas`}
                  >
                    <div className="h-20 w-full bg-[#242424] flex items-center justify-center overflow-hidden relative">
                      <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] bg-black/80 px-2 py-0.5 rounded text-white font-medium shadow">Preview</span>
                      </div>
                    </div>
                    <div className="p-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-[#F2F2F2] truncate" title={asset.name}>{asset.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInsertAsset(asset)
                          }}
                          className="text-[#A8A8A8] hover:text-[#F2F2F2] p-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[#353535]"
                          title="Place on Canvas"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteAsset(asset.id)
                          }}
                          className="text-[#A8A8A8] hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-[#353535]"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reusable Components Library */}
          <div className="pt-3 border-t border-[#424242]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#F2F2F2]">Components</span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded">
                {componentMasters.length} master{componentMasters.length === 1 ? '' : 's'}
              </span>
            </div>

            {componentMasters.length === 0 ? (
              <p className="text-[11px] text-[#707070] italic">
                No components created yet. Select an element on canvas and press <kbd className="bg-[#353535] px-1 rounded">⌥⌘K</kbd> to make it a component.
              </p>
            ) : (
              <div className="space-y-1.5">
                {componentMasters.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => createInstanceFromMaster(comp.id)}
                    className="p-2 rounded-lg bg-[#303030] hover:bg-[#353535] border border-[#424242] hover:border-purple-500/50 cursor-pointer flex items-center justify-between transition-all group"
                    title={`Click to instantiate ${comp.component?.componentName || comp.name}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Diamond className="w-4 h-4 text-purple-400 fill-purple-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-[#F2F2F2] truncate">
                          {comp.component?.componentName || comp.name}
                        </div>
                        <div className="text-[10px] text-[#A8A8A8]">
                          Variant: {comp.component?.variant || 'Default'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      + Insert
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Draggable Vertical Resize Handle on Right Edge */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={width}
        aria-valuemin={MIN_LEFT_SIDEBAR_WIDTH}
        aria-valuemax={MAX_LEFT_SIDEBAR_WIDTH}
        tabIndex={0}
        id="left-sidebar-resize-handle"
        title="Drag to resize Layers & Assets panel"
        onPointerDown={handleResizePointerDown}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            setWidth(width - 10)
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            setWidth(width + 10)
          }
        }}
        className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-40 transition-colors duration-150 select-none group touch-none ${
          isDragging ? 'bg-[#1769E8]' : 'hover:bg-[#1769E8] bg-transparent'
        }`}
      >
        <div
          className={`w-[1px] h-full mx-auto transition-colors duration-150 ${
            isDragging ? 'bg-[#1769E8]' : 'bg-[#424242] group-hover:bg-[#1769E8]'
          }`}
        />
      </div>
    </aside>
  )
}
