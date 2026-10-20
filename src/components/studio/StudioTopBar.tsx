import React, { useState, useRef } from 'react'
import {
  ArrowLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Download,
  CloudCheck,
  Loader2,
  ChevronDown,
  Upload,
  Frame,
  Type,
  Square,
  Circle,
  Triangle,
  RotateCcw,
  Magnet,
  Check,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from 'lucide-react'
import { useStudioStore } from '../../store/useStudioStore'
import { useUIStore } from '../../store/useUIStore'
import { FRAME_PRESETS, StudioFramePreset } from '../../types/studio'

interface StudioTopBarProps {
  onOpenExport: () => void
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({ onOpenExport }) => {
  const setActiveView = useUIStore((s) => s.setActiveView)

  const documentName = useStudioStore((s) => s.document.name)
  const setDocumentName = useStudioStore((s) => s.setDocumentName)
  const isSaving = useStudioStore((s) => s.isSaving)
  const lastSaved = useStudioStore((s) => s.lastSaved)

  const zoom = useStudioStore((s) => s.zoom)
  const setZoom = useStudioStore((s) => s.setZoom)
  const zoomIn = useStudioStore((s) => s.zoomIn)
  const zoomOut = useStudioStore((s) => s.zoomOut)
  const fitAll = useStudioStore((s) => s.fitAll)
  const fitSelection = useStudioStore((s) => s.fitSelection)
  const fitFrame = useStudioStore((s) => s.fitFrame)
  const zoomTo100 = useStudioStore((s) => s.zoomTo100)
  const selectedIds = useStudioStore((s) => s.selectedIds)
  const frames = useStudioStore((s) => s.document.frames)
  const hasSelectedFrame = selectedIds.some((id) => frames.some((f) => f.id === id))
  const hasSelection = selectedIds.length > 0

  const canUndo = useStudioStore((s) => s.canUndo())
  const canRedo = useStudioStore((s) => s.canRedo())
  const undo = useStudioStore((s) => s.undo)
  const redo = useStudioStore((s) => s.redo)

  const isSnappingEnabled = useStudioStore((s) => s.isSnappingEnabled)
  const toggleSnapping = useStudioStore((s) => s.toggleSnapping)
  const alignSelected = useStudioStore((s) => s.alignSelected)

  const setPreviewOpen = useStudioStore((s) => s.setPreviewOpen)
  const addFrame = useStudioStore((s) => s.addFrame)
  const addNode = useStudioStore((s) => s.addNode)
  const importAssetAndPlace = useStudioStore((s) => s.importAssetAndPlace)

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(documentName)
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false)
  const [isEditingZoom, setIsEditingZoom] = useState(false)
  const [zoomInputValue, setZoomInputValue] = useState('')
  const [isFrameMenuOpen, setIsFrameMenuOpen] = useState(false)
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false)

  const importInputRef = useRef<HTMLInputElement>(null)

  const handleCommitZoom = () => {
    setIsEditingZoom(false)
    const cleaned = zoomInputValue.replace(/[^0-9.]/g, '')
    const parsed = parseFloat(cleaned)
    if (!isNaN(parsed) && parsed > 0) {
      setZoom(Math.max(0.01, Math.min(8.0, parsed / 100)))
    }
  }

  const handleNameBlur = () => {
    setIsEditingName(false)
    if (nameValue.trim()) {
      setDocumentName(nameValue.trim())
    } else {
      setNameValue(documentName)
    }
  }

  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      await importAssetAndPlace(files[i])
    }
    if (importInputRef.current) importInputRef.current.value = ''
  }

  const handleAddPreset = (preset: StudioFramePreset) => {
    addFrame(preset)
    setIsFrameMenuOpen(false)
  }

  return (
    <header className="h-12 w-full bg-[#242424] border-b border-[#424242] px-3 flex items-center justify-between select-none z-30 flex-shrink-0 text-[#F2F2F2]">
      {/* Hidden Native File Input for Import */}
      <input
        ref={importInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif"
        onChange={handleImportFiles}
        className="hidden"
      />

      {/* 1. Left: Navigation Back & Document Info */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setActiveView('canvas')}
          title="Back to Sitemap Workspace"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#303030] hover:bg-[#383838] text-[#A8A8A8] hover:text-[#F2F2F2] border border-[#424242] text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sitemap</span>
        </button>

        <div className="h-4 w-px bg-[#424242]" />

        {/* Studio Badge & Document Name */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#873FF0] to-[#1769E8] flex items-center justify-center shadow-md">
            <span className="text-[11px] font-black text-white font-mono">S</span>
          </div>

          {isEditingName ? (
            <input
              type="text"
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              className="bg-[#353535] border border-[#424242] rounded px-2 py-0.5 text-xs font-semibold text-[#F2F2F2] outline-none"
            />
          ) : (
            <div
              onClick={() => {
                setNameValue(documentName)
                setIsEditingName(true)
              }}
              title="Click to rename design document"
              className="flex items-center gap-1.5 cursor-pointer hover:bg-[#303030] px-2 py-1 rounded transition-colors group"
            >
              <span className="text-xs font-bold text-[#F2F2F2] group-hover:text-purple-300 transition-colors truncate max-w-[140px]">
                {documentName}
              </span>
              <span className="text-[10px] text-[#A8A8A8] font-mono hidden md:inline">/ Studio</span>
            </div>
          )}
        </div>

        {/* Persistence Status */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#A8A8A8] pl-1">
          {isSaving ? (
            <div className="flex items-center gap-1 text-purple-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px]">Saving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-400/90" title={`Last saved: ${lastSaved || 'Just now'}`}>
              <CloudCheck className="w-3.5 h-3.5" />
              <span className="text-[10px] text-[#A8A8A8]">Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Center: Quick Creation & History & Viewport Zoom Controls */}
      <div className="flex items-center gap-2">
        {/* Creation Tools: Import, Add Frame, Add Text, Add Shape */}
        <div className="flex items-center gap-1 bg-[#303030] border border-[#424242] rounded-lg p-0.5">
          {/* Obvious Import Button */}
          <button
            onClick={() => importInputRef.current?.click()}
            id="topbar-import-btn"
            title="Import Images from Mac (PNG, JPG, WebP, GIF, SVG, AVIF)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-purple-300" />
            <span>Import</span>
          </button>

          {/* Add Frame Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFrameMenuOpen(!isFrameMenuOpen)
                setIsShapeMenuOpen(false)
              }}
              title="Add Frame / Artboard"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                isFrameMenuOpen
                  ? 'selected-glass text-white'
                  : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]'
              }`}
            >
              <Frame className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Frame</span>
              <ChevronDown className="w-3 h-3 text-[#A8A8A8]" />
            </button>

            {isFrameMenuOpen && (
              <div className="absolute top-full mt-1.5 left-0 bg-[#292929] border border-[#424242] rounded-xl shadow-2xl py-1.5 w-48 text-xs z-50">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#A8A8A8] tracking-wider">
                  Select Preset
                </div>
                {FRAME_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAddPreset(p.id)}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#A8A8A8] hover:text-[#F2F2F2]"
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-[#707070] font-mono">{p.width}×{p.height}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Text */}
          <button
            onClick={() =>
              addNode({
                type: 'text',
                name: 'Headline',
                width: 260,
                height: 48,
                fill: { type: 'none', color: '#FFFFFF' },
                text: {
                  content: 'Double-click to edit text',
                  fontFamily: 'Inter',
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  letterSpacing: 0,
                  textAlign: 'left',
                  color: '#FFFFFF',
                },
              })
            }
            title="Add Text Object"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] text-xs font-medium transition-colors"
          >
            <Type className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Text</span>
          </button>

          {/* Add Shape Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsShapeMenuOpen(!isShapeMenuOpen)
                setIsFrameMenuOpen(false)
              }}
              title="Add Shape"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                isShapeMenuOpen
                  ? 'selected-glass text-white'
                  : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]'
              }`}
            >
              <Square className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Shape</span>
              <ChevronDown className="w-3 h-3 text-[#A8A8A8]" />
            </button>

            {isShapeMenuOpen && (
              <div className="absolute top-full mt-1.5 left-0 bg-[#292929] border border-[#424242] rounded-xl shadow-2xl py-1 w-36 text-xs z-50">
                <button
                  onClick={() => {
                    addNode({ type: 'rectangle', name: 'Rectangle', width: 200, height: 120, fill: { type: 'solid', color: '#1769E8' } })
                    setIsShapeMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center gap-2 text-[#A8A8A8] hover:text-[#F2F2F2]"
                >
                  <Square className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rectangle</span>
                </button>
                <button
                  onClick={() => {
                    addNode({ type: 'ellipse', name: 'Ellipse', width: 140, height: 140, cornerRadius: 999, fill: { type: 'solid', color: '#873FF0' } })
                    setIsShapeMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center gap-2 text-[#A8A8A8] hover:text-[#F2F2F2]"
                >
                  <Circle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ellipse</span>
                </button>
                <button
                  onClick={() => {
                    addNode({ type: 'polygon', name: 'Polygon', width: 140, height: 140, polygon: { sides: 3 }, fill: { type: 'solid', color: '#F9E52B' } })
                    setIsShapeMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center gap-2 text-[#A8A8A8] hover:text-[#F2F2F2]"
                >
                  <Triangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Polygon</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History: Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-[#303030] border border-[#424242] rounded-lg p-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
            className={`p-1.5 rounded-md transition-colors ${
              canUndo ? 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]' : 'text-[#707070] cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (⌘⇧Z)"
            className={`p-1.5 rounded-md transition-colors ${
              canRedo ? 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]' : 'text-[#707070] cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls: Zoom Out, Zoom %, Zoom In, Fit */}
        <div className="flex items-center gap-0.5 bg-[#303030] border border-[#424242] rounded-lg p-0.5">
          <button
            id="studio-zoom-out-btn"
            onClick={() => zoomOut()}
            title="Zoom Out (⌘-)"
            className="p-1.5 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="relative flex items-center">
            {isEditingZoom ? (
              <input
                id="studio-zoom-input"
                autoFocus
                type="text"
                value={zoomInputValue}
                onChange={(e) => setZoomInputValue(e.target.value)}
                onBlur={handleCommitZoom}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCommitZoom()
                  if (e.key === 'Escape') setIsEditingZoom(false)
                }}
                className="w-14 px-1 py-0.5 text-xs font-mono font-semibold text-center bg-[#242424] text-[#F2F2F2] border border-[#3b82f6] rounded outline-none"
              />
            ) : (
              <div className="flex items-center">
                <button
                  id="studio-zoom-value-btn"
                  onClick={() => {
                    setZoomInputValue(`${Math.round(zoom * 100)}%`)
                    setIsEditingZoom(true)
                  }}
                  title="Click to enter custom zoom percentage (1% to 800%)"
                  className="px-1.5 py-1 text-xs font-mono font-semibold text-[#F2F2F2] hover:bg-[#383838] rounded-l transition-colors"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  id="studio-zoom-dropdown-btn"
                  onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
                  title="Zoom presets and fit options"
                  className={`p-1 rounded-r transition-colors ${
                    isZoomMenuOpen ? 'selected-glass text-white' : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838]'
                  }`}
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            )}

            {isZoomMenuOpen && (
              <div
                id="studio-zoom-menu"
                className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-[#292929] border border-[#424242] rounded-lg shadow-2xl py-1 w-44 text-xs z-50 max-h-80 overflow-y-auto"
              >
                {/* Fit Actions */}
                <button
                  id="studio-zoom-fit-all-menu-item"
                  onClick={() => {
                    fitAll()
                    setIsZoomMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#F2F2F2] transition-colors"
                >
                  <span className="font-medium">Fit All</span>
                  <span className="text-[10px] text-[#707070] font-mono">⇧1</span>
                </button>

                <button
                  id="studio-zoom-fit-selection-menu-item"
                  onClick={() => {
                    fitSelection()
                    setIsZoomMenuOpen(false)
                  }}
                  disabled={!hasSelection}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
                    hasSelection
                      ? 'hover:bg-[#353535] text-[#F2F2F2]'
                      : 'text-[#707070] cursor-not-allowed'
                  }`}
                >
                  <span>Fit Selection</span>
                  <span className="text-[10px] text-[#707070] font-mono">⇧2</span>
                </button>

                {hasSelectedFrame && (
                  <button
                    id="studio-zoom-fit-frame-menu-item"
                    onClick={() => {
                      fitFrame()
                      setIsZoomMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#F2F2F2] transition-colors"
                  >
                    <span>Fit Frame</span>
                  </button>
                )}

                <button
                  id="studio-zoom-100-menu-item"
                  onClick={() => {
                    zoomTo100()
                    setIsZoomMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#A8A8A8] hover:text-[#F2F2F2] transition-colors"
                >
                  <span>100%</span>
                  <span className="text-[10px] text-[#707070] font-mono">⌘0</span>
                </button>

                <div className="h-px bg-[#424242] my-1" />

                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#707070] font-semibold">
                  Zoom Presets
                </div>

                {[
                  { label: '800%', val: 8.0 },
                  { label: '400%', val: 4.0 },
                  { label: '200%', val: 2.0 },
                  { label: '100%', val: 1.0 },
                  { label: '50%', val: 0.5 },
                  { label: '25%', val: 0.25 },
                  { label: '10%', val: 0.1 },
                  { label: '5%', val: 0.05 },
                  { label: '2%', val: 0.02 },
                  { label: '1%', val: 0.01 },
                ].map((item) => {
                  const isCurrent = Math.round(zoom * 100) === Math.round(item.val * 100)
                  return (
                    <button
                      key={item.label}
                      data-zoom-preset={item.label}
                      onClick={() => {
                        setZoom(item.val)
                        setIsZoomMenuOpen(false)
                      }}
                      className={`w-full text-left px-3 py-1 hover:bg-[#353535] flex items-center justify-between transition-colors ${
                        isCurrent ? 'selected-glass text-[#F2F2F2] font-semibold' : 'text-[#A8A8A8] hover:text-[#F2F2F2]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isCurrent && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            id="studio-zoom-in-btn"
            onClick={() => zoomIn()}
            title="Zoom In (⌘+)"
            className="p-1.5 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            id="studio-zoom-fit-all-btn"
            onClick={() => fitAll()}
            title="Fit All (Shift + 1)"
            className="p-1.5 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Snapping & Smart Guides Toggle Button */}
        <button
          id="studio-toggle-snapping-btn"
          onClick={toggleSnapping}
          title={
            isSnappingEnabled
              ? 'Snapping & Smart Guides ON (Press Option/Alt during drag to temporarily bypass)'
              : 'Snapping & Smart Guides OFF (Click to enable magnetic snapping)'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            isSnappingEnabled
              ? 'selected-glass text-[#F2F2F2]'
              : 'bg-[#303030] text-[#707070] border border-[#424242] hover:text-[#A8A8A8] hover:bg-[#383838]'
          }`}
        >
          <Magnet className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Snap</span>
        </button>

        {/* Alignment quick buttons in toolbar */}
        {hasSelection && (
          <div className="hidden xl:flex items-center gap-0.5 bg-[#303030] border border-[#424242] rounded-lg p-0.5">
            <button
              id="topbar-align-left-btn"
              onClick={() => alignSelected('left')}
              title="Align Left (relative to parent frame/selection)"
              className="p-1.5 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              id="topbar-align-center-h-btn"
              onClick={() => alignSelected('center-h')}
              title="Align Horizontal Center"
              className="p-1.5 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
            >
              <AlignCenterHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              id="topbar-align-right-btn"
              onClick={() => alignSelected('right')}
              title="Align Right"
              className="p-1.5 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-[#424242]" />
            <button
              id="topbar-align-top-btn"
              onClick={() => alignSelected('top')}
              title="Align Top"
              className="p-1.5 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
            >
              <AlignStartVertical className="w-3.5 h-3.5" />
            </button>
            <button
              id="topbar-align-center-v-btn"
              onClick={() => alignSelected('center-v')}
              title="Align Vertical Center"
              className="p-1.5 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
            >
              <AlignCenterVertical className="w-3.5 h-3.5" />
            </button>
            <button
              id="topbar-align-bottom-btn"
              onClick={() => alignSelected('bottom')}
              title="Align Bottom"
              className="p-1.5 rounded-md text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#383838] transition-colors"
            >
              <AlignEndVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Right: Preview & Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPreviewOpen(true)}
          id="studio-preview-btn"
          title="Interactive Prototype Preview Mode"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#303030] hover:bg-[#383838] border border-[#424242] text-[#F2F2F2] text-xs font-semibold transition-all"
        >
          <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <button
          onClick={onOpenExport}
          id="studio-export-btn"
          title="Export Design Spec, PNG, SVG or JSON"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#873FF0] to-[#1769E8] hover:opacity-95 text-white text-xs font-bold shadow-md transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  )
}
