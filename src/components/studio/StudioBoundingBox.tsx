import React, { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { StudioNode, StudioFrame } from '../../types/studio'
import { useStudioStore } from '../../store/useStudioStore'
import { calculateSnapping } from '../../services/studio/snappingEngine'

export interface StudioBoundingBoxProps {
  selectedNode: StudioNode | null
  selectedFrame: StudioFrame | null
  parentFrame: StudioFrame | null
  selectedNodes?: StudioNode[]
  selectedFrames?: StudioFrame[]
  selectedIds?: string[]
  zoom: number
}

type ResizeDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface ItemLayoutState {
  id: string
  isFrame: boolean
  frameId: string | null
  x: number
  y: number
  canvasX: number
  canvasY: number
  width: number
  height: number
  frameOffsetX: number
  frameOffsetY: number
}

export const StudioBoundingBox: React.FC<StudioBoundingBoxProps> = ({
  selectedNode,
  selectedFrame,
  parentFrame,
  selectedNodes = [],
  selectedFrames = [],
  zoom,
}) => {
  const updateNode = useStudioStore((s) => s.updateNode)
  const updateFrame = useStudioStore((s) => s.updateFrame)
  const commitNodeMove = useStudioStore((s) => s.commitNodeMove)
  const commitFrameMove = useStudioStore((s) => s.commitFrameMove)
  const commitBatchMove = useStudioStore((s) => s.commitBatchMove)
  const duplicateSelectedForDrag = useStudioStore((s) => s.duplicateSelectedForDrag)
  const reparentNode = useStudioStore((s) => s.reparentNode)
  const setCanvasDropTargetFrameId = useStudioStore((s) => s.setCanvasDropTargetFrameId)
  const isSnappingEnabled = useStudioStore((s) => s.isSnappingEnabled)
  const snappingThreshold = useStudioStore((s) => s.snappingThreshold)
  const setSmartGuides = useStudioStore((s) => s.setSmartGuides)
  const pan = useStudioStore((s) => s.pan)

  // Consolidate all active selections
  const allNodes = selectedNodes.length > 0 ? selectedNodes : selectedNode ? [selectedNode] : []
  const allFrames = selectedFrames.length > 0 ? selectedFrames : selectedFrame ? [selectedFrame] : []

  const totalCount = allNodes.length + allFrames.length
  if (totalCount === 0) return null

  const isMultiSelection = totalCount > 1
  const isSingleNode = allNodes.length === 1 && allFrames.length === 0
  const primaryNode = isSingleNode ? allNodes[0] : null
  const isComponentMaster = primaryNode?.type === 'component'
  const boxColor = isComponentMaster ? '#873FF0' : '#1769E8'

  // Dragging, resizing, rotating local state
  const [isDraggingMove, setIsDraggingMove] = useState(false)
  const [resizingDir, setResizingDir] = useState<ResizeDirection | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  // Layout snapshots taken at mouse down
  const [initialItems, setInitialItems] = useState<ItemLayoutState[]>([])
  const [initialCollectiveBounds, setInitialCollectiveBounds] = useState<{
    minX: number
    minY: number
    width: number
    height: number
  } | null>(null)
  const [initialSingleRotation, setInitialSingleRotation] = useState<number>(0)

  // Calculate current bounding box in canvas coordinates
  const currentFramesDoc = useStudioStore.getState().document.frames

  const itemsBounds: Array<{
    id: string
    canvasX: number
    canvasY: number
    width: number
    height: number
  }> = []

  allFrames.forEach((f) => {
    itemsBounds.push({
      id: f.id,
      canvasX: f.x,
      canvasY: f.y,
      width: f.width,
      height: f.height,
    })
  })

  allNodes.forEach((n) => {
    const pFrame = n.frameId ? currentFramesDoc.find((f) => f.id === n.frameId) || parentFrame : null
    const fx = pFrame ? pFrame.x : 0
    const fy = pFrame ? pFrame.y : 0
    itemsBounds.push({
      id: n.id,
      canvasX: fx + n.x,
      canvasY: fy + n.y,
      width: n.width,
      height: n.height,
    })
  })

  const minX = Math.min(...itemsBounds.map((b) => b.canvasX))
  const minY = Math.min(...itemsBounds.map((b) => b.canvasY))
  const maxX = Math.max(...itemsBounds.map((b) => b.canvasX + b.width))
  const maxY = Math.max(...itemsBounds.map((b) => b.canvasY + b.height))
  const boxWidth = Math.max(1, maxX - minX)
  const boxHeight = Math.max(1, maxY - minY)
  const rotation = isSingleNode && primaryNode ? (primaryNode.rotation || 0) : 0
  const isAnyLocked = allNodes.some((n) => n.isLocked) || allFrames.some((f) => f.isLocked)

  // 1. Move Pointer Down Handler (supports Option-drag duplication)
  const handleMoveMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAnyLocked) return

    let nodesToDrag = allNodes
    let framesToDrag = allFrames

    // Option-drag duplication on macOS:
    // Holding Option (⌥ / altKey) while dragging creates a duplicate in-place and moves the duplicate
    if (e.altKey) {
      const duplicatedIds = duplicateSelectedForDrag()
      if (duplicatedIds.length > 0) {
        const docNow = useStudioStore.getState().document
        nodesToDrag = docNow.nodes.filter((n) => duplicatedIds.includes(n.id))
        framesToDrag = docNow.frames.filter((f) => duplicatedIds.includes(f.id))
      }
    }

    setIsDraggingMove(true)
    setDragStart({ x: e.clientX, y: e.clientY })

    if (typeof window !== 'undefined') {
      window.document.body.style.cursor = 'move'
      window.document.body.style.userSelect = 'none'
    }

    const currentDoc = useStudioStore.getState().document
    const snapshotItems: ItemLayoutState[] = []

    nodesToDrag.forEach((n) => {
      const pFrame = n.frameId ? currentDoc.frames.find((f) => f.id === n.frameId) : null
      const fx = pFrame ? pFrame.x : 0
      const fy = pFrame ? pFrame.y : 0
      snapshotItems.push({
        id: n.id,
        isFrame: false,
        frameId: n.frameId,
        x: n.x,
        y: n.y,
        canvasX: fx + n.x,
        canvasY: fy + n.y,
        width: n.width,
        height: n.height,
        frameOffsetX: fx,
        frameOffsetY: fy,
      })
    })

    framesToDrag.forEach((f) => {
      snapshotItems.push({
        id: f.id,
        isFrame: true,
        frameId: null,
        x: f.x,
        y: f.y,
        canvasX: f.x,
        canvasY: f.y,
        width: f.width,
        height: f.height,
        frameOffsetX: 0,
        frameOffsetY: 0,
      })
    })

    setInitialItems(snapshotItems)
    setInitialCollectiveBounds({ minX, minY, width: boxWidth, height: boxHeight })
  }

  // 2. Resize Handle Down Handler
  const handleResizeMouseDown = (dir: ResizeDirection, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAnyLocked) return

    setResizingDir(dir)
    setDragStart({ x: e.clientX, y: e.clientY })

    if (typeof window !== 'undefined') {
      window.document.body.style.cursor = `${dir}-resize`
      window.document.body.style.userSelect = 'none'
    }

    const currentDoc = useStudioStore.getState().document
    const snapshotItems: ItemLayoutState[] = []

    allNodes.forEach((n) => {
      const pFrame = n.frameId ? currentDoc.frames.find((f) => f.id === n.frameId) : null
      const fx = pFrame ? pFrame.x : 0
      const fy = pFrame ? pFrame.y : 0
      snapshotItems.push({
        id: n.id,
        isFrame: false,
        frameId: n.frameId,
        x: n.x,
        y: n.y,
        canvasX: fx + n.x,
        canvasY: fy + n.y,
        width: n.width,
        height: n.height,
        frameOffsetX: fx,
        frameOffsetY: fy,
      })
    })

    allFrames.forEach((f) => {
      snapshotItems.push({
        id: f.id,
        isFrame: true,
        frameId: null,
        x: f.x,
        y: f.y,
        canvasX: f.x,
        canvasY: f.y,
        width: f.width,
        height: f.height,
        frameOffsetX: 0,
        frameOffsetY: 0,
      })
    })

    setInitialItems(snapshotItems)
    setInitialCollectiveBounds({ minX, minY, width: boxWidth, height: boxHeight })
  }

  // 3. Rotate Handle Down Handler
  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAnyLocked || !primaryNode) return

    setIsRotating(true)
    setDragStart({ x: e.clientX, y: e.clientY })

    if (typeof window !== 'undefined') {
      window.document.body.style.cursor = 'crosshair'
      window.document.body.style.userSelect = 'none'
    }

    setInitialSingleRotation(primaryNode.rotation || 0)
  }

  // Global mousemove and mouseup listeners
  useEffect(() => {
    if (!isDraggingMove && !resizingDir && !isRotating) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart || !initialCollectiveBounds || initialItems.length === 0) return

      const deltaX = (e.clientX - dragStart.x) / zoom
      const deltaY = (e.clientY - dragStart.y) / zoom

      // A. Moving with Magnetic Snapping & Smart Guides
      if (isDraggingMove) {
        // Option/Alt bypasses snapping during normal drag
        const isBypassed = !isSnappingEnabled

        const rawBoxX = initialCollectiveBounds.minX + deltaX
        const rawBoxY = initialCollectiveBounds.minY + deltaY

        const currentDoc = useStudioStore.getState().document
        const excludedIds = new Set(initialItems.map((it) => it.id))

        const snapResult = calculateSnapping(
          {
            id: initialItems[0].id,
            x: rawBoxX,
            y: rawBoxY,
            width: initialCollectiveBounds.width,
            height: initialCollectiveBounds.height,
            frameId: initialItems.length === 1 ? initialItems[0].frameId : null,
          },
          currentDoc.nodes.filter((n) => !excludedIds.has(n.id)),
          currentDoc.frames.filter((f) => !excludedIds.has(f.id)),
          {
            zoom,
            screenThreshold: snappingThreshold,
            isBypassed,
          }
        )

        const snappedDeltaX = snapResult.snappedX - initialCollectiveBounds.minX
        const snappedDeltaY = snapResult.snappedY - initialCollectiveBounds.minY

        // Move all selected items synchronously, preserving relative positions
        initialItems.forEach((it) => {
          const newLocalX = Math.round(it.x + snappedDeltaX)
          const newLocalY = Math.round(it.y + snappedDeltaY)

          if (it.isFrame) {
            updateFrame(it.id, { x: newLocalX, y: newLocalY }, true)
          } else {
            updateNode(it.id, { x: newLocalX, y: newLocalY }, true)
          }
        })

        setSmartGuides(snapResult.guides)

        // Drop target frame detection for single node dragging
        if (initialItems.length === 1 && !initialItems[0].isFrame) {
          const canvasEl = window.document.getElementById('studio-canvas-container')
          if (canvasEl) {
            const rect = canvasEl.getBoundingClientRect()
            const pointerCanvasX = (e.clientX - rect.left - pan.x) / zoom
            const pointerCanvasY = (e.clientY - rect.top - pan.y) / zoom

            const targetFrame = currentDoc.frames
              .slice()
              .reverse()
              .find((f) => {
                if (f.isHidden) return false
                return (
                  pointerCanvasX >= f.x &&
                  pointerCanvasX <= f.x + f.width &&
                  pointerCanvasY >= f.y &&
                  pointerCanvasY <= f.y + f.height
                )
              })

            setCanvasDropTargetFrameId(targetFrame ? targetFrame.id : null)
          }
        }
      }

      // B. Resizing (Corner & Edge handles, Proportional with Shift, Center with Alt)
      if (resizingDir) {
        let newX = initialCollectiveBounds.minX
        let newY = initialCollectiveBounds.minY
        let newW = initialCollectiveBounds.width
        let newH = initialCollectiveBounds.height

        if (resizingDir.includes('e')) {
          newW = Math.max(16, initialCollectiveBounds.width + deltaX)
        }
        if (resizingDir.includes('s')) {
          newH = Math.max(16, initialCollectiveBounds.height + deltaY)
        }
        if (resizingDir.includes('w')) {
          const clampedDeltaX = Math.min(deltaX, initialCollectiveBounds.width - 16)
          newX = initialCollectiveBounds.minX + clampedDeltaX
          newW = initialCollectiveBounds.width - clampedDeltaX
        }
        if (resizingDir.includes('n')) {
          const clampedDeltaY = Math.min(deltaY, initialCollectiveBounds.height - 16)
          newY = initialCollectiveBounds.minY + clampedDeltaY
          newH = initialCollectiveBounds.height - clampedDeltaY
        }

        // Proportional resizing (Shift key or image locked aspect ratio)
        const isProportional =
          e.shiftKey || (primaryNode?.image?.aspectRatioLocked && initialItems.length === 1)

        if (isProportional && initialCollectiveBounds.width > 0 && initialCollectiveBounds.height > 0) {
          const aspect = initialCollectiveBounds.width / initialCollectiveBounds.height

          if (resizingDir === 'e' || resizingDir === 'w') {
            newH = Math.max(16, Math.round(newW / aspect))
          } else if (resizingDir === 'n' || resizingDir === 's') {
            newW = Math.max(16, Math.round(newH * aspect))
          } else {
            // Corner handles
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newH = Math.max(16, Math.round(newW / aspect))
              if (resizingDir.includes('n')) {
                newY = initialCollectiveBounds.minY + (initialCollectiveBounds.height - newH)
              }
            } else {
              newW = Math.max(16, Math.round(newH * aspect))
              if (resizingDir.includes('w')) {
                newX = initialCollectiveBounds.minX + (initialCollectiveBounds.width - newW)
              }
            }
          }
        }

        // Center-origin resizing (Alt / Option key)
        if (e.altKey) {
          const centerX = initialCollectiveBounds.minX + initialCollectiveBounds.width / 2
          const centerY = initialCollectiveBounds.minY + initialCollectiveBounds.height / 2
          newX = Math.round(centerX - newW / 2)
          newY = Math.round(centerY - newH / 2)
        }

        // Apply resize transformations
        if (initialItems.length === 1) {
          const it = initialItems[0]
          const localX = Math.round(newX - it.frameOffsetX)
          const localY = Math.round(newY - it.frameOffsetY)
          const roundedW = Math.round(newW)
          const roundedH = Math.round(newH)

          if (it.isFrame) {
            updateFrame(it.id, { x: localX, y: localY, width: roundedW, height: roundedH }, true)
          } else {
            updateNode(it.id, { x: localX, y: localY, width: roundedW, height: roundedH }, true)
          }
        } else {
          // Scale multiple selected items proportionally within collective bounds
          const scaleX = newW / initialCollectiveBounds.width
          const scaleY = newH / initialCollectiveBounds.height

          initialItems.forEach((it) => {
            const itemCanvasX = newX + (it.canvasX - initialCollectiveBounds.minX) * scaleX
            const itemCanvasY = newY + (it.canvasY - initialCollectiveBounds.minY) * scaleY
            const itemW = Math.max(8, Math.round(it.width * scaleX))
            const itemH = Math.max(8, Math.round(it.height * scaleY))
            const localX = Math.round(itemCanvasX - it.frameOffsetX)
            const localY = Math.round(itemCanvasY - it.frameOffsetY)

            if (it.isFrame) {
              updateFrame(it.id, { x: localX, y: localY, width: itemW, height: itemH }, true)
            } else {
              updateNode(it.id, { x: localX, y: localY, width: itemW, height: itemH }, true)
            }
          })
        }
      }

      // C. Rotating (Single node)
      if (isRotating && primaryNode) {
        const rectEl = document.getElementById(`node-${primaryNode.id}`)
        if (rectEl) {
          const domRect = rectEl.getBoundingClientRect()
          const centerX = domRect.left + domRect.width / 2
          const centerY = domRect.top + domRect.height / 2
          const rad = Math.atan2(e.clientY - centerY, e.clientX - centerX)
          let deg = Math.round((rad * 180) / Math.PI + 90)
          if (deg < 0) deg += 360
          // 15 deg shift snapping
          if (e.shiftKey) deg = Math.round(deg / 15) * 15

          updateNode(primaryNode.id, { rotation: deg }, true)
        }
      }
    }

    const handleMouseUp = () => {
      if (typeof window !== 'undefined') {
        window.document.body.style.cursor = ''
        window.document.body.style.userSelect = ''
      }

      setSmartGuides(null)

      if (isDraggingMove && initialItems.length > 0) {
        if (initialItems.length === 1) {
          const it = initialItems[0]
          if (it.isFrame) {
            commitFrameMove(it.id, it.x, it.y)
          } else {
            const dropFrameId = useStudioStore.getState().canvasDropTargetFrameId
            if (dropFrameId && dropFrameId !== it.frameId) {
              reparentNode(it.id, dropFrameId)
            } else {
              commitNodeMove(it.id, it.x, it.y)
            }
            setCanvasDropTargetFrameId(null)
          }
        } else {
          // Multi-object move committed in a single history entry
          commitBatchMove(
            initialItems.map((it) => ({
              id: it.id,
              x: it.x,
              y: it.y,
              isFrame: it.isFrame,
            }))
          )
        }
      }

      setIsDraggingMove(false)
      setResizingDir(null)
      setIsRotating(false)
      setDragStart(null)
      setInitialItems([])
      setInitialCollectiveBounds(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      if (typeof window !== 'undefined') {
        window.document.body.style.cursor = ''
        window.document.body.style.userSelect = ''
      }
      setSmartGuides(null)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    isDraggingMove,
    resizingDir,
    isRotating,
    dragStart,
    initialItems,
    initialCollectiveBounds,
    zoom,
    pan,
    primaryNode,
    isSnappingEnabled,
    snappingThreshold,
    updateNode,
    updateFrame,
    commitNodeMove,
    commitFrameMove,
    commitBatchMove,
    reparentNode,
    setCanvasDropTargetFrameId,
    setSmartGuides,
  ])

  return (
    <>
      {/* 1. Subtle outline for each individual object in multi-selection */}
      {isMultiSelection &&
        itemsBounds.map((b) => (
          <div
            key={`outline-${b.id}`}
            style={{
              position: 'absolute',
              left: `${b.canvasX}px`,
              top: `${b.canvasY}px`,
              width: `${b.width}px`,
              height: `${b.height}px`,
              border: '1px dashed rgba(23, 105, 232, 0.65)',
              pointerEvents: 'none',
            }}
            className="z-30 rounded-sm"
          />
        ))}

      {/* 2. Main Selection Boundary & Transform Handles */}
      <div
        id="studio-selection-bounding-box"
        style={{
          position: 'absolute',
          left: `${minX}px`,
          top: `${minY}px`,
          width: `${boxWidth}px`,
          height: `${boxHeight}px`,
          transform: !isMultiSelection && rotation ? `rotate(${rotation}deg)` : undefined,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
        className="z-40"
      >
        {/* Main Selection Area */}
        <div
          onMouseDown={handleMoveMouseDown}
          style={{
            width: '100%',
            height: '100%',
            border: isAnyLocked ? '1.5px dashed #F59E0B' : `1.5px solid ${boxColor}`,
            backgroundColor: isAnyLocked
              ? 'rgba(245, 158, 11, 0.05)'
              : isDraggingMove
              ? 'rgba(23, 105, 232, 0.08)'
              : 'rgba(0,0,0,0.001)',
            pointerEvents: 'auto',
            cursor: isAnyLocked ? 'default' : isDraggingMove ? 'grabbing' : 'grab',
          }}
          className="relative"
        >
          {/* Locked Badge */}
          {isAnyLocked && (
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                right: '0px',
                backgroundColor: '#242424',
                borderColor: '#F59E0B',
              }}
              className="px-1.5 py-0.5 rounded border text-[10px] font-medium text-amber-400 pointer-events-none shadow-md flex items-center gap-1"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Locked</span>
            </div>
          )}

          {/* Dimension Tooltip Badge */}
          <div
            id="studio-bounding-box-dimension-badge"
            style={{
              position: 'absolute',
              bottom: '-22px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#242424',
              borderColor: '#424242',
            }}
            className="px-1.5 py-0.5 rounded border text-[9px] font-mono text-[#F2F2F2] pointer-events-none shadow-md flex items-center gap-1 whitespace-nowrap"
          >
            <span>{Math.round(boxWidth)}</span>
            <span className="text-[#A8A8A8]">×</span>
            <span>{Math.round(boxHeight)}</span>
            {isMultiSelection && (
              <span className="text-blue-400 font-semibold text-[8px] uppercase tracking-wider ml-1">
                ({totalCount} items)
              </span>
            )}
          </div>

          {/* Rotation Handle & Stem (Single node only, not locked) */}
          {isSingleNode && !isAnyLocked && (
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'auto',
              }}
              className="flex flex-col items-center"
            >
              <div
                id="studio-rotate-handle"
                onMouseDown={handleRotateMouseDown}
                style={{ borderColor: boxColor }}
                className="w-3 h-3 rounded-full bg-white border-2 cursor-crosshair hover:scale-125 transition-transform shadow-md"
                title="Drag to Rotate (Hold Shift for 15° increments)"
              />
              <div style={{ backgroundColor: boxColor }} className="w-px h-3" />
            </div>
          )}

          {/* 8 Resize Handles (When not locked) */}
          {!isAnyLocked && (
            <>
              {/* NW */}
              <div
                id="studio-handle-nw"
                onMouseDown={(e) => handleResizeMouseDown('nw', e)}
                style={{ borderColor: boxColor }}
                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 rounded-sm cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform shadow-sm"
              />
              {/* N */}
              <div
                id="studio-handle-n"
                onMouseDown={(e) => handleResizeMouseDown('n', e)}
                style={{ borderColor: boxColor }}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 rounded-sm cursor-ns-resize pointer-events-auto hover:scale-125 transition-transform shadow-sm"
              />
              {/* NE */}
              <div
                id="studio-handle-ne"
                onMouseDown={(e) => handleResizeMouseDown('ne', e)}
                style={{ borderColor: boxColor }}
                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 rounded-sm cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform shadow-sm"
              />
              {/* E */}
              <div
                id="studio-handle-e"
                onMouseDown={(e) => handleResizeMouseDown('e', e)}
                style={{ borderColor: boxColor }}
                className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 rounded-sm cursor-ew-resize pointer-events-auto hover:scale-125 transition-transform shadow-sm"
              />
              {/* SE */}
              <div
                id="studio-handle-se"
                onMouseDown={(e) => handleResizeMouseDown('se', e)}
                style={{ borderColor: boxColor }}
                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 rounded-sm cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform shadow-sm"
              />
              {/* S */}
              <div
                id="studio-handle-s"
                onMouseDown={(e) => handleResizeMouseDown('s', e)}
                style={{ borderColor: boxColor }}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 rounded-sm cursor-ns-resize pointer-events-auto hover:scale-125 transition-transform shadow-sm"
              />
              {/* SW */}
              <div
                id="studio-handle-sw"
                onMouseDown={(e) => handleResizeMouseDown('sw', e)}
                style={{ borderColor: boxColor }}
                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 rounded-sm cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform shadow-sm"
              />
              {/* W */}
              <div
                id="studio-handle-w"
                onMouseDown={(e) => handleResizeMouseDown('w', e)}
                style={{ borderColor: boxColor }}
                className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 rounded-sm cursor-ew-resize pointer-events-auto hover:scale-125 transition-transform shadow-sm"
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}
