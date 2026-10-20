import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Download,
  PlusCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react'
import { useStudioStore } from '../../store/useStudioStore'

export const StudioAssetPreviewModal: React.FC = () => {
  const previewingAssetId = useStudioStore((s) => s.previewingAssetId)
  const closeAssetPreview = useStudioStore((s) => s.closeAssetPreview)
  const navigateAssetPreview = useStudioStore((s) => s.navigateAssetPreview)
  const placeAssetOnCanvas = useStudioStore((s) => s.placeAssetOnCanvas)
  const replaceSelectedWithAsset = useStudioStore((s) => s.replaceSelectedWithAsset)
  const assets = useStudioStore((s) => s.assets)
  const selectedIds = useStudioStore((s) => s.selectedIds)
  const document = useStudioStore((s) => s.document)

  // Zoom and pan state inside the preview
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const currentAsset = assets.find((a) => a.id === previewingAssetId)
  const currentIndex = assets.findIndex((a) => a.id === previewingAssetId)

  // Check if a valid canvas object is selected to enable "Replace Selected Image"
  const selectedNode = selectedIds.length > 0
    ? document.nodes.find((n) => selectedIds.includes(n.id))
    : null
  const canReplace = Boolean(selectedNode)

  // Reset viewport state when previewing asset changes
  useEffect(() => {
    if (currentAsset) {
      setZoom(1.0)
      setPan({ x: 0, y: 0 })
      setIsLoading(true)
      setHasError(false)
      if (currentAsset.width && currentAsset.height) {
        setNaturalDimensions({ width: currentAsset.width, height: currentAsset.height })
      } else {
        setNaturalDimensions(null)
      }
    }
  }, [currentAsset?.id, currentAsset?.width, currentAsset?.height])

  // Reset zoom & pan helpers
  const handleFitToScreen = useCallback(() => {
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
  }, [])

  const handleResetZoom100 = useCallback(() => {
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(5.0, Number((z * 1.25).toFixed(2))))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.2, Number((z / 1.25).toFixed(2))))
  }, [])

  // Keyboard navigation and shortcut handling
  useEffect(() => {
    if (!previewingAssetId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        closeAssetPreview()
        return
      }

      // Left arrow: previous asset
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        navigateAssetPreview('prev')
        return
      }

      // Right arrow: next asset
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        navigateAssetPreview('next')
        return
      }

      // Zoom shortcuts
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        e.stopPropagation()
        handleZoomIn()
        return
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        e.stopPropagation()
        handleZoomOut()
        return
      }
      if (e.key === '0') {
        e.preventDefault()
        e.stopPropagation()
        handleFitToScreen()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [previewingAssetId, closeAssetPreview, navigateAssetPreview, handleZoomIn, handleZoomOut, handleFitToScreen])

  // Non-passive wheel / pinch-to-zoom over preview
  useEffect(() => {
    const el = containerRef.current
    if (!el || !previewingAssetId) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.ctrlKey || e.metaKey) {
        // Pinch zoom
        const zoomDelta = -e.deltaY * 0.01
        setZoom((prevZoom) => {
          const next = Math.max(0.2, Math.min(5.0, prevZoom * Math.exp(zoomDelta)))
          return Number(next.toFixed(2))
        })
      } else {
        // Panning when zoomed or standard wheel zoom
        if (zoom > 1.0) {
          setPan((p) => ({
            x: Math.round(p.x - e.deltaX),
            y: Math.round(p.y - e.deltaY),
          }))
        } else {
          const zoomDelta = -e.deltaY * 0.005
          setZoom((prevZoom) => {
            const next = Math.max(0.2, Math.min(5.0, prevZoom * Math.exp(zoomDelta)))
            return Number(next.toFixed(2))
          })
        }
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [previewingAssetId, zoom])

  if (!previewingAssetId || !currentAsset) return null

  // Panning drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const target = e.currentTarget
    try {
      target.setPointerCapture(e.pointerId)
    } catch {}

    setIsPanning(true)
    const startX = e.clientX - pan.x
    const startY = e.clientY - pan.y

    const handlePointerMove = (ev: PointerEvent) => {
      ev.preventDefault()
      setPan({
        x: Math.round(ev.clientX - startX),
        y: Math.round(ev.clientY - startY),
      })
    }

    const handlePointerUp = (ev: PointerEvent) => {
      try {
        if (target.hasPointerCapture?.(ev.pointerId)) {
          target.releasePointerCapture(ev.pointerId)
        }
      } catch {}
      setIsPanning(false)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  // Double click toggles between fit and 2.0x zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (zoom > 1.0) {
      handleFitToScreen()
    } else {
      setZoom(2.0)
    }
  }

  // Download original asset file
  const handleDownload = () => {
    const link = window.document.createElement('a')
    link.href = currentAsset.dataUrl
    link.download = currentAsset.name || 'image'
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  // Format file size
  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const dimsDisplay = naturalDimensions
    ? `${naturalDimensions.width} × ${naturalDimensions.height} px`
    : currentAsset.width && currentAsset.height
    ? `${currentAsset.width} × ${currentAsset.height} px`
    : ''

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full-Screen Image Preview"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex flex-col bg-[#000000] text-[#F8F5EF] select-none overflow-hidden animate-in fade-in duration-150"
    >
      {/* 1. Header Toolbar */}
      <header className="h-14 px-4 bg-[#242424]/90 border-b border-[#424242] backdrop-blur-md flex items-center justify-between z-20 flex-shrink-0">
        {/* Left: Metadata info badge */}
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#F2F2F2] truncate max-w-[280px] sm:max-w-[420px]" title={currentAsset.name}>
                {currentAsset.name}
              </h2>
              {assets.length > 1 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#353535] text-[#A8A8A8] border border-[#424242] flex-shrink-0">
                  {currentIndex + 1} of {assets.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#A8A8A8]">
              {dimsDisplay && <span>{dimsDisplay}</span>}
              {dimsDisplay && currentAsset.size > 0 && <span>•</span>}
              {currentAsset.size > 0 && <span>{formatSize(currentAsset.size)}</span>}
            </div>
          </div>
        </div>

        {/* Center: Main Preview Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Place on Canvas */}
          <button
            id="preview-place-on-canvas-btn"
            onClick={() => placeAssetOnCanvas(currentAsset.id)}
            title="Insert this image into the design at a visible position on the canvas"
            className="px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-[#1558C4] active:scale-95 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Place on Canvas</span>
          </button>

          {/* Replace Selected Image */}
          <div className="relative group/replace">
            <button
              id="preview-replace-selected-btn"
              disabled={!canReplace}
              onClick={() => replaceSelectedWithAsset(currentAsset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
                canReplace
                  ? 'bg-purple-600 hover:bg-purple-500 active:scale-95 text-white cursor-pointer'
                  : 'bg-[#353535] text-[#707070] border border-[#424242] cursor-not-allowed opacity-60'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replace Selected</span>
            </button>
            {!canReplace && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover/replace:block w-52 p-2 bg-[#292929] border border-[#424242] text-[11px] text-[#A8A8A8] rounded shadow-xl pointer-events-none z-30 text-center">
                Select an element or image on the canvas first to replace it
              </div>
            )}
          </div>

          {/* Download Original File */}
          <button
            id="preview-download-btn"
            onClick={handleDownload}
            title="Download original image file to your Mac"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#303030] hover:bg-[#353535] active:scale-95 text-[#F2F2F2] text-xs font-medium border border-[#424242] transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>

        {/* Right: Zoom controls and Close Button */}
        <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
          <div className="hidden md:flex items-center bg-[#303030] border border-[#424242] rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              title="Zoom Out (-)"
              className="p-1 text-[#A8A8A8] hover:text-[#F2F2F2] rounded hover:bg-[#353535] transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 min-w-[44px] text-center text-[#F2F2F2]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In (+)"
              className="p-1 text-[#A8A8A8] hover:text-[#F2F2F2] rounded hover:bg-[#353535] transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleFitToScreen}
            title="Fit to Screen (0)"
            className="hidden lg:flex p-1.5 rounded-lg text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535] transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom100}
            title="Reset Zoom to 100%"
            className="hidden lg:flex p-1.5 rounded-lg text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-[#424242] mx-1 hidden sm:block" />

          {/* Close button in top-right corner */}
          <button
            id="preview-close-btn"
            onClick={closeAssetPreview}
            title="Close Preview (Esc)"
            className="p-2 rounded-lg bg-[#303030] hover:bg-[#353535] border border-[#424242] active:scale-95 text-[#F2F2F2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Pure Black (#000000) Viewport Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        className={`flex-1 relative overflow-hidden bg-[#000000] flex items-center justify-center select-none ${
          zoom > 1.0 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* Loading Spinner Indicator */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State if Image Fails to Decode */}
        {hasError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md bg-slate-900/80 border border-red-500/30 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Image Decoding Failed</h3>
            <p className="text-xs text-slate-400 mb-4">
              Unable to preview &quot;{currentAsset.name}&quot;. The image format may be damaged or unsupported by the browser engine.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setHasError(false)
                  setIsLoading(true)
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-white transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-xs font-semibold rounded-lg text-white transition-colors"
              >
                Download File
              </button>
            </div>
          </div>
        ) : (
          /* Scaled & Centered Image Element */
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 100ms ease-out',
            }}
            className="flex items-center justify-center pointer-events-none max-w-full max-h-full"
          >
            <img
              ref={imageRef}
              src={currentAsset.dataUrl}
              alt={currentAsset.name}
              draggable={false}
              onLoad={(e) => {
                setIsLoading(false)
                setNaturalDimensions({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                })
              }}
              onError={() => {
                setIsLoading(false)
                setHasError(true)
              }}
              className="max-w-[calc(100vw-80px)] max-h-[calc(100vh-140px)] object-contain shadow-2xl pointer-events-auto rounded-sm select-none"
            />
          </div>
        )}

        {/* 3. Left / Right Navigation Chevrons */}
        {assets.length > 1 && (
          <>
            <button
              id="preview-prev-btn"
              onClick={(e) => {
                e.stopPropagation()
                navigateAssetPreview('prev')
              }}
              title="Previous Image (←)"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white shadow-xl hover:scale-105 active:scale-95 transition-all z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="preview-next-btn"
              onClick={(e) => {
                e.stopPropagation()
                navigateAssetPreview('next')
              }}
              title="Next Image (→)"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white shadow-xl hover:scale-105 active:scale-95 transition-all z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 4. Bottom Quick Keyboard Hints */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-mono backdrop-blur pointer-events-none hidden sm:flex items-center gap-3">
          <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Esc</kbd> Close</span>
          <span>•</span>
          <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">←</kbd> <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">→</kbd> Navigate</span>
          <span>•</span>
          <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">+</kbd> <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">-</kbd> Zoom</span>
          <span>•</span>
          <span>Double-click or drag to pan</span>
        </div>
      </div>
    </div>
  )
}
