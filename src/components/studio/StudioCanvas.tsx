import React, { useRef, useState, useEffect } from 'react'
import { useStudioStore } from '../../store/useStudioStore'
import { useUIStore } from '../../store/useUIStore'
import { StudioFrameRenderer } from './StudioFrameRenderer'
import { StudioNodeRenderer } from './StudioNodeRenderer'
import { StudioBoundingBox } from './StudioBoundingBox'
import { StudioToolPalette } from './StudioToolPalette'
import { StudioInteractiveEye } from './StudioInteractiveEye'
import { StudioSmartGuidesOverlay } from './StudioSmartGuidesOverlay'
import { Upload } from 'lucide-react'

export const StudioCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const document = useStudioStore((s) => s.document)
  const pan = useStudioStore((s) => s.pan)
  const setPan = useStudioStore((s) => s.setPan)
  const zoom = useStudioStore((s) => s.zoom)
  const canvasBackground = useStudioStore((s) => s.canvasBackground)

  const activeTool = useStudioStore((s) => s.activeTool)
  const setActiveTool = useStudioStore((s) => s.setActiveTool)
  const selectedIds = useStudioStore((s) => s.selectedIds)
  const setSelectedIds = useStudioStore((s) => s.setSelectedIds)
  const toggleSelectId = useStudioStore((s) => s.toggleSelectId)
  const clearSelection = useStudioStore((s) => s.clearSelection)
  const setEditingTextId = useStudioStore((s) => s.setEditingTextId)

  const addNode = useStudioStore((s) => s.addNode)
  const assets = useStudioStore((s) => s.assets)
  const importAssetAndPlace = useStudioStore((s) => s.importAssetAndPlace)
  const rightTab = useStudioStore((s) => s.rightTab)
  const prototypes = useStudioStore((s) => s.document.prototypes)

  // Pan interaction state
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isCanvasPanning, setIsCanvasPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)

  // Marquee selection state
  const [isMarquee, setIsMarquee] = useState(false)
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null)
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number } | null>(null)

  // Freehand pen drawing state
  const [isPenDrawing, setIsPenDrawing] = useState(false)
  const [penPoints, setPenPoints] = useState<Array<{ x: number; y: number }>>([])

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false)

  // 1. Spacebar key tracking for Hand tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = typeof window !== 'undefined' ? window.document.activeElement : null
      if (e.code === 'Space' && !e.repeat && activeEl?.tagName !== 'INPUT' && activeEl?.tagName !== 'TEXTAREA') {
        setIsSpacePressed(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // 2. Non-passive Wheel and Trackpad Pinch-to-Zoom handling (macOS Safari & Chrome)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault()

      if (e.ctrlKey || e.metaKey) {
        // macOS trackpad pinch gesture: e.ctrlKey is true
        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        // Smooth exponential zoom multiplier
        const zoomDelta = -e.deltaY * 0.008
        const zoomMultiplier = Math.exp(zoomDelta)
        const currentZoom = useStudioStore.getState().zoom
        const currentPan = useStudioStore.getState().pan

        const newZoom = Math.max(0.01, Math.min(8.0, Number((currentZoom * zoomMultiplier).toFixed(4))))

        // Keep focal point stationary beneath cursor
        const newPanX = mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom)
        const newPanY = mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom)

        useStudioStore.getState().setZoom(newZoom)
        useStudioStore.getState().setPan({ x: Math.round(newPanX), y: Math.round(newPanY) })
      } else {
        // Standard two-finger trackpad panning / wheel scrolling
        useStudioStore.getState().setPan((prev) => ({
          x: Math.round(prev.x - e.deltaX),
          y: Math.round(prev.y - e.deltaY),
        }))
      }
    }

    // Safari proprietary gesturestart, gesturechange, gestureend
    let gestureStartZoom = 1
    let gestureStartPan = { x: 0, y: 0 }
    let gestureFocal = { x: 0, y: 0 }

    const handleGestureStart = (e: any) => {
      e.preventDefault()
      gestureStartZoom = useStudioStore.getState().zoom
      gestureStartPan = useStudioStore.getState().pan
      const rect = container.getBoundingClientRect()
      gestureFocal = {
        x: (e.clientX || rect.width / 2) - rect.left,
        y: (e.clientY || rect.height / 2) - rect.top,
      }
    }

    const handleGestureChange = (e: any) => {
      e.preventDefault()
      const newZoom = Math.max(0.01, Math.min(8.0, Number((gestureStartZoom * (e.scale || 1)).toFixed(4))))
      const newPanX = gestureFocal.x - (gestureFocal.x - gestureStartPan.x) * (newZoom / gestureStartZoom)
      const newPanY = gestureFocal.y - (gestureFocal.y - gestureStartPan.y) * (newZoom / gestureStartZoom)

      useStudioStore.getState().setZoom(newZoom)
      useStudioStore.getState().setPan({ x: Math.round(newPanX), y: Math.round(newPanY) })
    }

    const handleGestureEnd = (e: any) => {
      e.preventDefault()
    }

    container.addEventListener('wheel', handleNativeWheel, { passive: false })
    container.addEventListener('gesturestart', handleGestureStart, { passive: false })
    container.addEventListener('gesturechange', handleGestureChange, { passive: false })
    container.addEventListener('gestureend', handleGestureEnd, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleNativeWheel)
      container.removeEventListener('gesturestart', handleGestureStart)
      container.removeEventListener('gesturechange', handleGestureChange)
      container.removeEventListener('gestureend', handleGestureEnd)
    }
  }, [])

  // 3. Clipboard Paste Support (Images from Clipboard)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const activeEl = window.document.activeElement
      if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA') return

      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            const placed = await importAssetAndPlace(file)
            if (placed) {
              useUIStore.getState().addToast({
                type: 'success',
                title: 'Image Pasted',
                description: `Pasted ${file.name || 'image'} from clipboard`,
              })
            }
            return
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [importAssetAndPlace])

  // Convert Screen client coordinate to Canvas Document coordinate
  const screenToCanvas = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 }
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    }
  }

  // 4. Drag & Drop File Placement from Mac Desktop / Finder
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      if (
        e.clientX <= rect.left ||
        e.clientX >= rect.right ||
        e.clientY <= rect.top ||
        e.clientY >= rect.bottom
      ) {
        setIsDragOver(false)
      }
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const canvasPt = screenToCanvas(e.clientX, e.clientY)

    // Check if dragging an asset from internal Assets library
    const customData = e.dataTransfer.getData('application/json')
    if (customData) {
      try {
        const parsed = JSON.parse(customData)
        if (parsed.type === 'asset' && parsed.assetId) {
          const asset = assets.find((a) => a.id === parsed.assetId)
          if (asset) {
            const naturalW = asset.width || 320
            const naturalH = asset.height || 240
            let w = naturalW
            let h = naturalH
            const maxW = 440
            const maxH = 340
            if (w > maxW || h > maxH) {
              const r = Math.min(maxW / w, maxH / h)
              w = Math.round(w * r)
              h = Math.round(h * r)
            }

            const containingFrame = document.frames.find(
              (f) => canvasPt.x >= f.x && canvasPt.x <= f.x + f.width && canvasPt.y >= f.y && canvasPt.y <= f.y + f.height
            )

            const nodeX = containingFrame ? canvasPt.x - containingFrame.x : canvasPt.x
            const nodeY = containingFrame ? canvasPt.y - containingFrame.y : canvasPt.y
            const frameId = containingFrame ? containingFrame.id : null

            const newNode = addNode({
              type: 'image',
              name: asset.name.replace(/\.[^/.]+$/, ''),
              x: Math.round(nodeX),
              y: Math.round(nodeY),
              width: w,
              height: h,
              fill: { type: 'none', color: 'transparent' },
              image: {
                assetId: asset.id,
                src: asset.dataUrl,
                fit: 'fill',
                aspectRatioLocked: true,
                naturalWidth: asset.width,
                naturalHeight: asset.height,
              },
            }, frameId)

            setSelectedIds([newNode.id])
            return
          }
        }
      } catch {}
    }

    // Check external files dropped from Mac Finder
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await importAssetAndPlace(files[i], Math.round(canvasPt.x + i * 20), Math.round(canvasPt.y + i * 20))
      }
    }
  }

  // Canvas pointer down
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpacePressed || activeTool === 'hand') {
      // Start Pan
      setIsCanvasPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      return
    }

    if (e.button !== 0) return

    const canvasPt = screenToCanvas(e.clientX, e.clientY)

    // Freehand pen drawing
    if (activeTool === 'pen') {
      setIsPenDrawing(true)
      setPenPoints([canvasPt])
      return
    }

    // Direct click with text tool
    if (activeTool === 'text') {
      addNode({
        type: 'text',
        x: Math.round(canvasPt.x),
        y: Math.round(canvasPt.y),
        width: 260,
        height: 48,
        fill: { type: 'none', color: '#FFFFFF' },
        text: {
          content: 'Double-click to edit text',
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: 500,
          lineHeight: 1.4,
          letterSpacing: 0,
          textAlign: 'left',
          color: '#FFFFFF',
        },
      })
      setActiveTool('select')
      return
    }

    // Start Marquee Selection on empty canvas
    setIsMarquee(true)
    setMarqueeStart(canvasPt)
    setMarqueeCurrent(canvasPt)
    if (!e.shiftKey) {
      clearSelection()
    }
  }

  // Canvas pointer move
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isCanvasPanning && panStart) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
      return
    }

    if (isPenDrawing) {
      const pt = screenToCanvas(e.clientX, e.clientY)
      setPenPoints((prev) => [...prev, pt])
      return
    }

    if (isMarquee) {
      const pt = screenToCanvas(e.clientX, e.clientY)
      setMarqueeCurrent(pt)
    }
  }

  // Canvas pointer up
  const handleCanvasMouseUp = () => {
    if (isCanvasPanning) {
      setIsCanvasPanning(false)
      setPanStart(null)
    }

    if (isPenDrawing && penPoints.length > 1) {
      setIsPenDrawing(false)
      const minX = Math.min(...penPoints.map((p) => p.x))
      const minY = Math.min(...penPoints.map((p) => p.y))
      const maxX = Math.max(...penPoints.map((p) => p.x))
      const maxY = Math.max(...penPoints.map((p) => p.y))

      addNode({
        type: 'drawing',
        name: 'Vector Path',
        x: Math.round(minX),
        y: Math.round(minY),
        width: Math.max(20, Math.round(maxX - minX)),
        height: Math.max(20, Math.round(maxY - minY)),
        drawing: {
          points: penPoints,
          strokeColor: '#873FF0',
          strokeWidth: 3,
        },
      })
      setPenPoints([])
      setActiveTool('select')
    }

    if (isMarquee && marqueeStart && marqueeCurrent) {
      setIsMarquee(false)
      const x1 = Math.min(marqueeStart.x, marqueeCurrent.x)
      const y1 = Math.min(marqueeStart.y, marqueeCurrent.y)
      const x2 = Math.max(marqueeStart.x, marqueeCurrent.x)
      const y2 = Math.max(marqueeStart.y, marqueeCurrent.y)

      const intersectedIds: string[] = []

      // Check frames
      document.frames.forEach((f) => {
        if (f.x + f.width >= x1 && f.x <= x2 && f.y + f.height >= y1 && f.y <= y2) {
          intersectedIds.push(f.id)
        }
      })

      // Check root nodes
      document.nodes
        .filter((n) => !n.frameId)
        .forEach((n) => {
          if (n.x + n.width >= x1 && n.x <= x2 && n.y + n.height >= y1 && n.y <= y2) {
            intersectedIds.push(n.id)
          }
        })

      if (intersectedIds.length > 0) {
        setSelectedIds(intersectedIds)
      }
      setMarqueeStart(null)
      setMarqueeCurrent(null)
    }
  }

  // Active targets and parent frame for BoundingBox
  const selectedNodes = document.nodes.filter((n) => selectedIds.includes(n.id))
  const selectedFrames = document.frames.filter((f) => selectedIds.includes(f.id))

  const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null
  const selectedFrame = selectedFrames.length > 0 ? selectedFrames[0] : null
  const parentFrame = selectedNode?.frameId
    ? document.frames.find((f) => f.id === selectedNode.frameId) || null
    : null

  // Freehand stroke preview path
  const penStrokeD = penPoints.length > 0
    ? `M ${penPoints[0].x} ${penPoints[0].y} ` + penPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : ''

  // Marquee Rect in screen coordinates
  const marqueeStyle = isMarquee && marqueeStart && marqueeCurrent ? {
    left: `${Math.min(marqueeStart.x, marqueeCurrent.x)}px`,
    top: `${Math.min(marqueeStart.y, marqueeCurrent.y)}px`,
    width: `${Math.abs(marqueeCurrent.x - marqueeStart.x)}px`,
    height: `${Math.abs(marqueeCurrent.y - marqueeStart.y)}px`,
  } : null

  // Contrast-aware grid styling
  const isTransparent = canvasBackground === 'transparent'
  const isLight = !isTransparent && (() => {
    const hex = (canvasBackground || '').replace('#', '')
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
    }
    return false
  })()

  const dotColor = isLight ? 'rgba(0, 0, 0, 0.20)' : 'rgba(255, 255, 255, 0.15)'
  const gridPitch = Math.max(16, Math.min(64, Math.round(32 * zoom)))
  const showGrid = zoom >= 0.05

  const backgroundStyle: React.CSSProperties = isTransparent
    ? {
        backgroundImage: `
          linear-gradient(45deg, #181818 25%, transparent 25%),
          linear-gradient(-45deg, #181818 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #181818 75%),
          linear-gradient(-45deg, transparent 75%, #181818 75%)
        `,
        backgroundSize: '24px 24px',
        backgroundPosition: `${pan.x % 24}px ${pan.y % 24}px, ${pan.x % 24}px ${(pan.y + 12) % 24}px, ${(pan.x + 12) % 24}px ${(pan.y - 12) % 24}px, ${(pan.x - 12) % 24}px ${pan.y % 24}px`,
        backgroundColor: '#262626',
      }
    : {
        backgroundColor: canvasBackground || '#000000', // Default canvas backgroundColor: '#000000'
        backgroundImage: showGrid ? `radial-gradient(circle, ${dotColor} 1.2px, transparent 1.2px)` : 'none',
        backgroundSize: `${gridPitch}px ${gridPitch}px`,
        backgroundPosition: `${pan.x % gridPitch}px ${pan.y % gridPitch}px`,
      }

  const canvasCursor =
    isCanvasPanning || isSpacePressed || activeTool === 'hand'
      ? 'grabbing'
      : activeTool === 'pen'
      ? 'crosshair'
      : 'default'

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ cursor: canvasCursor }}
      id="studio-canvas-container"
      className="flex-1 h-full w-full relative overflow-hidden select-none bg-[#000000]"
    >
      {/* LAYER 1: Workspace Background: Dotted Grid */}
      <div
        id="studio-workspace-background"
        aria-hidden="true"
        style={backgroundStyle}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* LAYER 2: Center Static Logo Overlay (Fixed Screen-Space, Independent of Canvas Pan/Zoom) */}
      <StudioInteractiveEye />

      {/* Floating Left Vertical Tools Toolbar */}
      <StudioToolPalette />

      {/* LAYER 3: Main Infinite Canvas Scaled Transform Layer (Affected by Zoom and Pan) */}
      <div
        id="studio-canvas-transform-layer"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 2,
        }}
      >
        {/* 1. Frames & Framed Nodes */}
        {document.frames.map((frame) => {
          const childNodes = document.nodes.filter((n) => n.frameId === frame.id)
          return (
            <StudioFrameRenderer
              key={frame.id}
              frame={frame}
              childNodes={childNodes}
              selectedIds={selectedIds}
              onSelectFrame={(e) => toggleSelectId(frame.id, e.shiftKey)}
              onSelectNode={(nodeId, e) => toggleSelectId(nodeId, e.shiftKey)}
              onDoubleClickNode={(nodeId) => setEditingTextId(nodeId)}
            />
          )
        })}

        {/* 2. Root Canvas Nodes */}
        {document.nodes
          .filter((n) => !n.frameId)
          .map((node) => (
            <StudioNodeRenderer
              key={node.id}
              node={node}
              isSelected={selectedIds.includes(node.id)}
              onClick={(e) => {
                e.stopPropagation()
                toggleSelectId(node.id, e.shiftKey)
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                setEditingTextId(node.id)
              }}
            />
          ))}

        {/* 3. Smart Guides Overlay (Magenta Alignment & Equal Spacing Guides) */}
        <StudioSmartGuidesOverlay zoom={zoom} />

        {/* 4. Selection Bounding Box with 8 Resize Handles & Rotate */}
        {(selectedNodes.length > 0 || selectedFrames.length > 0) && (
          <StudioBoundingBox
            selectedNode={selectedNode}
            selectedFrame={selectedFrame}
            parentFrame={parentFrame}
            selectedNodes={selectedNodes}
            selectedFrames={selectedFrames}
            selectedIds={selectedIds}
            zoom={zoom}
          />
        )}

        {/* 4. Prototype Wires */}
        {rightTab === 'prototype' && (
          <svg className="absolute inset-0 overflow-visible pointer-events-none z-50">
            <defs>
              <marker
                id="proto-arrow"
                markerWidth="8"
                markerHeight="6"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#873FF0" />
              </marker>
            </defs>
            {prototypes.map((proto) => {
              const sourceNode = document.nodes.find((n) => n.id === proto.sourceNodeId)
              const destFrame = document.frames.find((f) => f.id === proto.destinationFrameId)
              if (!sourceNode || !destFrame) return null

              const srcParent = sourceNode.frameId
                ? document.frames.find((f) => f.id === sourceNode.frameId)
                : null
              const srcX = (srcParent ? srcParent.x + sourceNode.x : sourceNode.x) + sourceNode.width / 2
              const srcY = (srcParent ? srcParent.y + sourceNode.y : sourceNode.y) + sourceNode.height / 2

              const destX = destFrame.x + destFrame.width / 2
              const destY = destFrame.y

              const midY = (srcY + destY) / 2
              const pathD = `M ${srcX} ${srcY} C ${srcX} ${midY}, ${destX} ${midY}, ${destX} ${destY}`

              return (
                <g key={proto.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#873FF0"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    markerEnd="url(#proto-arrow)"
                    className="animate-pulse"
                  />
                  <circle cx={srcX} cy={srcY} r="4" fill="#873FF0" />
                </g>
              )
            })}
          </svg>
        )}

        {/* 5. Freehand Pen Active Drawing Preview */}
        {isPenDrawing && penPoints.length > 0 && (
          <svg className="absolute inset-0 overflow-visible pointer-events-none z-50">
            <path
              d={penStrokeD}
              fill="none"
              stroke="#873FF0"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* 6. Marquee Selection Rectangle */}
        {marqueeStyle && (
          <div
            style={marqueeStyle}
            className="absolute border border-[#1769E8] bg-[#1769E8]/10 pointer-events-none z-50 rounded-sm"
          />
        )}
      </div>

      {/* 7. Canvas Drag-Over Visual Overlay Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-[#873FF0]/15 border-2 border-dashed border-[#873FF0] backdrop-blur-[2px] flex items-center justify-center pointer-events-none animate-in fade-in duration-100">
          <div className="bg-[#242424]/95 border border-[#424242] rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-2 text-center">
            <Upload className="w-10 h-10 text-purple-400 animate-bounce" />
            <span className="font-bold text-[#F2F2F2] text-sm">Drop images here to add to canvas</span>
            <span className="text-xs text-[#A8A8A8]">PNG, JPG, WebP, GIF, SVG, AVIF supported</span>
          </div>
        </div>
      )}
    </div>
  )
}
