import React, { useState, useEffect } from 'react'
import { VisualElement } from '../../types'

interface BoundingBoxProps {
  selectedElements: VisualElement[]
  containerRef?: React.RefObject<HTMLDivElement | null>
  zoom?: number
  snapGrid?: number
  onMoveElements: (elementIds: string[], deltaX: number, deltaY: number) => void
  onResizeElement: (elementId: string, bounds: { x: number; y: number; width: number; height: number }) => void
  onDoubleClickSelected?: () => void
}

type HandleDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export const BoundingBox: React.FC<BoundingBoxProps> = (props) => {
  if (props.selectedElements.length === 0) return null
  return <BoundingBoxOverlay {...props} />
}

const BoundingBoxOverlay: React.FC<BoundingBoxProps> = ({
  selectedElements,
  zoom = 1,
  snapGrid = 8,
  onMoveElements,
  onResizeElement,
  onDoubleClickSelected,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [resizingHandle, setResizingHandle] = useState<HandleDirection | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [initialBounds, setInitialBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  // Calculate bounding box enclosing all selected elements
  const minX = Math.min(...selectedElements.map((el) => el.layout.x))
  const minY = Math.min(...selectedElements.map((el) => el.layout.y))
  const maxX = Math.max(...selectedElements.map((el) => el.layout.x + el.layout.width))
  const maxY = Math.max(...selectedElements.map((el) => el.layout.y + el.layout.height))

  const boxWidth = maxX - minX
  const boxHeight = maxY - minY
  const isSingle = selectedElements.length === 1
  const singleElement = isSingle ? selectedElements[0] : null
  const isLocked = selectedElements.some((el) => el.layout.isLocked)

  // Drag to move
  const handleMouseDownMove = (e: React.MouseEvent) => {
    if (isLocked) return
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Mouse down on resize handle (for single element)
  const handleMouseDownResize = (e: React.MouseEvent, handle: HandleDirection) => {
    if (isLocked || !singleElement) return
    e.stopPropagation()
    setResizingHandle(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialBounds({
      x: singleElement.layout.x,
      y: singleElement.layout.y,
      width: singleElement.layout.width,
      height: singleElement.layout.height,
    })
  }

  useEffect(() => {
    if (!isDragging && !resizingHandle) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart) return

      const rawDeltaX = (e.clientX - dragStart.x) / zoom
      const rawDeltaY = (e.clientY - dragStart.y) / zoom

      if (isDragging) {
        // Snap movement
        const snappedDeltaX = Math.round(rawDeltaX / snapGrid) * snapGrid
        const snappedDeltaY = Math.round(rawDeltaY / snapGrid) * snapGrid

        if (snappedDeltaX !== 0 || snappedDeltaY !== 0) {
          onMoveElements(
            selectedElements.map((el) => el.id),
            snappedDeltaX,
            snappedDeltaY,
          )
          setDragStart({
            x: dragStart.x + snappedDeltaX * zoom,
            y: dragStart.y + snappedDeltaY * zoom,
          })
        }
      } else if (resizingHandle && initialBounds && singleElement) {
        let newX = initialBounds.x
        let newY = initialBounds.y
        let newWidth = initialBounds.width
        let newHeight = initialBounds.height

        const lockRatio = singleElement.layout.aspectRatioLocked || e.shiftKey
        const aspectRatio = initialBounds.width / Math.max(initialBounds.height, 1)

        switch (resizingHandle) {
          case 'e':
            newWidth = Math.max(16, initialBounds.width + rawDeltaX)
            if (lockRatio) newHeight = newWidth / aspectRatio
            break
          case 'w': {
            const potentialWidth = initialBounds.width - rawDeltaX
            if (potentialWidth >= 16) {
              newWidth = potentialWidth
              newX = initialBounds.x + rawDeltaX
            }
            if (lockRatio) newHeight = newWidth / aspectRatio
            break
          }
          case 's':
            newHeight = Math.max(16, initialBounds.height + rawDeltaY)
            if (lockRatio) newWidth = newHeight * aspectRatio
            break
          case 'n': {
            const potentialHeight = initialBounds.height - rawDeltaY
            if (potentialHeight >= 16) {
              newHeight = potentialHeight
              newY = initialBounds.y + rawDeltaY
            }
            if (lockRatio) newWidth = newHeight * aspectRatio
            break
          }
          case 'se':
            newWidth = Math.max(16, initialBounds.width + rawDeltaX)
            newHeight = Math.max(16, initialBounds.height + rawDeltaY)
            if (lockRatio) {
              const maxScale = Math.max(newWidth / initialBounds.width, newHeight / initialBounds.height)
              newWidth = initialBounds.width * maxScale
              newHeight = initialBounds.height * maxScale
            }
            break
          case 'sw': {
            const potW = initialBounds.width - rawDeltaX
            if (potW >= 16) {
              newWidth = potW
              newX = initialBounds.x + rawDeltaX
            }
            newHeight = Math.max(16, initialBounds.height + rawDeltaY)
            if (lockRatio) newHeight = newWidth / aspectRatio
            break
          }
          case 'ne': {
            newWidth = Math.max(16, initialBounds.width + rawDeltaX)
            const potH = initialBounds.height - rawDeltaY
            if (potH >= 16) {
              newHeight = potH
              newY = initialBounds.y + rawDeltaY
            }
            if (lockRatio) newWidth = newHeight * aspectRatio
            break
          }
          case 'nw': {
            const potW = initialBounds.width - rawDeltaX
            const potH = initialBounds.height - rawDeltaY
            if (potW >= 16) {
              newWidth = potW
              newX = initialBounds.x + rawDeltaX
            }
            if (potH >= 16) {
              newHeight = potH
              newY = initialBounds.y + rawDeltaY
            }
            if (lockRatio) {
              newHeight = newWidth / aspectRatio
            }
            break
          }
        }

        // Apply grid snapping to width and height
        const snappedWidth = Math.round(newWidth / snapGrid) * snapGrid
        const snappedHeight = Math.round(newHeight / snapGrid) * snapGrid
        const snappedX = Math.round(newX / snapGrid) * snapGrid
        const snappedY = Math.round(newY / snapGrid) * snapGrid

        onResizeElement(singleElement.id, {
          x: Math.max(0, snappedX),
          y: Math.max(0, snappedY),
          width: Math.max(16, snappedWidth),
          height: Math.max(16, snappedHeight),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setResizingHandle(null)
      setDragStart(null)
      setInitialBounds(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, resizingHandle, dragStart, initialBounds, zoom, snapGrid, singleElement, selectedElements, onMoveElements, onResizeElement])

  // Resize handle styling
  const handleBaseClass =
    'absolute w-2.5 h-2.5 bg-white border border-[#1769E8] rounded-[2px] shadow-sm z-30 transition-transform hover:scale-125'

  return (
    <div
      style={{
        left: `${minX}px`,
        top: `${minY}px`,
        width: `${boxWidth}px`,
        height: `${boxHeight}px`,
      }}
      className={`absolute pointer-events-none select-none z-20 ${
        isLocked ? 'border border-dashed border-amber-500/70' : 'border border-[#1769E8]'
      }`}
    >
      {/* Move Area Handler */}
      {!isLocked && (
        <div
          onMouseDown={handleMouseDownMove}
          onDoubleClick={onDoubleClickSelected}
          title="Drag to reposition (Double-click to edit text)"
          className="absolute inset-0 pointer-events-auto cursor-move"
        />
      )}

      {/* Dimension Badge */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#1769E8] text-white text-[10px] font-mono font-medium shadow-md whitespace-nowrap pointer-events-none flex items-center gap-1.5 z-40">
        <span>
          {Math.round(boxWidth)} × {Math.round(boxHeight)}
        </span>
        {!isSingle && (
          <span className="bg-black/30 px-1 rounded text-[9px]">
            {selectedElements.length} items
          </span>
        )}
        {isLocked && <span className="bg-amber-600 px-1 rounded text-[9px]">Locked</span>}
      </div>

      {/* 8 Resize Handles (rendered only for single selection and unlocked) */}
      {isSingle && !isLocked && (
        <>
          {/* NW - Top Left */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
            className={`${handleBaseClass} -top-1.5 -left-1.5 cursor-nwse-resize pointer-events-auto`}
          />
          {/* N - Top Center */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'n')}
            className={`${handleBaseClass} -top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize pointer-events-auto`}
          />
          {/* NE - Top Right */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
            className={`${handleBaseClass} -top-1.5 -right-1.5 cursor-nesw-resize pointer-events-auto`}
          />
          {/* E - Middle Right */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'e')}
            className={`${handleBaseClass} top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize pointer-events-auto`}
          />
          {/* SE - Bottom Right */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'se')}
            className={`${handleBaseClass} -bottom-1.5 -right-1.5 cursor-nwse-resize pointer-events-auto`}
          />
          {/* S - Bottom Center */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 's')}
            className={`${handleBaseClass} -bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize pointer-events-auto`}
          />
          {/* SW - Bottom Left */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
            className={`${handleBaseClass} -bottom-1.5 -left-1.5 cursor-nesw-resize pointer-events-auto`}
          />
          {/* W - Middle Left */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'w')}
            className={`${handleBaseClass} top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize pointer-events-auto`}
          />
        </>
      )}
    </div>
  )
}
