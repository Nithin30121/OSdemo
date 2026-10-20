import React, { useState, useRef, useEffect } from 'react'
import {
  MousePointer2,
  Hand,
  Frame,
  Square,
  Circle,
  Triangle,
  Minus,
  MoveRight,
  Pen,
  Type,
  Image as ImageIcon,
  Component,
  Monitor,
  Laptop,
  Smartphone,
  Tablet,
} from 'lucide-react'
import { useStudioStore } from '../../store/useStudioStore'
import { StudioTool, FRAME_PRESETS, StudioFramePreset } from '../../types/studio'

export const StudioToolPalette: React.FC = () => {
  const activeTool = useStudioStore((s) => s.activeTool)
  const setActiveTool = useStudioStore((s) => s.setActiveTool)
  const addFrame = useStudioStore((s) => s.addFrame)
  const addNode = useStudioStore((s) => s.addNode)
  const createComponentFromSelection = useStudioStore((s) => s.createComponentFromSelection)
  const selectedIds = useStudioStore((s) => s.selectedIds)
  const importAssetAndPlace = useStudioStore((s) => s.importAssetAndPlace)

  const [shapeMenuOpen, setShapeMenuOpen] = useState(false)
  const [frameMenuOpen, setFrameMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Close menus on outside click
  useEffect(() => {
    const handleDocClick = () => {
      setShapeMenuOpen(false)
      setFrameMenuOpen(false)
    }
    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [])

  const handleSelectTool = (tool: StudioTool, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveTool(tool)
    setShapeMenuOpen(false)
    setFrameMenuOpen(false)

    // Direct addition for shapes if clicked directly from menu
    if (tool === 'rectangle') {
      addNode({ type: 'rectangle', name: 'Rectangle', width: 200, height: 120, fill: { type: 'solid', color: '#1769E8' } })
    } else if (tool === 'ellipse') {
      addNode({ type: 'ellipse', name: 'Ellipse', width: 140, height: 140, cornerRadius: 999, fill: { type: 'solid', color: '#873FF0' } })
    } else if (tool === 'polygon') {
      addNode({ type: 'polygon', name: 'Polygon', width: 140, height: 140, polygon: { sides: 3 }, fill: { type: 'solid', color: '#F9E52B' } })
    } else if (tool === 'line') {
      addNode({ type: 'line', name: 'Line', width: 200, height: 2, fill: { type: 'solid', color: '#64748B' } })
    } else if (tool === 'arrow') {
      addNode({ type: 'arrow', name: 'Arrow', width: 200, height: 2, fill: { type: 'solid', color: '#38BDF8' } })
    }
  }

  const handleAddFramePreset = (preset: StudioFramePreset, e: React.MouseEvent) => {
    e.stopPropagation()
    addFrame(preset)
    setFrameMenuOpen(false)
    setActiveTool('select')
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    for (let i = 0; i < files.length; i++) {
      await importAssetAndPlace(files[i])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isShapeActive = ['rectangle', 'ellipse', 'polygon', 'line', 'arrow'].includes(activeTool)

  return (
    <nav
      aria-label="Studio Tools"
      id="studio-tools-toolbar"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="absolute top-4 left-4 z-30 flex flex-col items-center bg-[#303030] border border-[#424242] rounded-xl p-1 shadow-2xl shadow-black/80 select-none space-y-1"
    >
      {/* Hidden file input for Image Tool */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.avif,image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* GROUP 1: SELECTION & MOVEMENT */}
      {/* 1. Select / Pointer (V) */}
      <div className="relative group">
        <button
          onClick={() => setActiveTool('select')}
          id="tool-select-btn"
          title="Select / Move Tool (V)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeTool === 'select'
              ? 'selected-glass text-white font-medium'
              : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#3D3D3D]'
          }`}
        >
          <MousePointer2 className="w-4 h-4" />
        </button>
        <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2 py-1 bg-[#292929] border border-[#424242] rounded-md shadow-xl text-[11px] font-medium text-[#F2F2F2] whitespace-nowrap z-50">
          <span>Select / Move</span>
          <kbd className="px-1 py-0.2 bg-[#353535] border border-[#424242] rounded text-[9px] font-mono text-[#A8A8A8]">V</kbd>
        </div>
      </div>

      {/* 2. Hand / Pan (H) */}
      <div className="relative group">
        <button
          onClick={() => setActiveTool('hand')}
          id="tool-hand-btn"
          title="Hand / Pan Tool (H / Space+Drag)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeTool === 'hand'
              ? 'selected-glass text-white font-medium'
              : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#3D3D3D]'
          }`}
        >
          <Hand className="w-4 h-4" />
        </button>
        <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2 py-1 bg-[#292929] border border-[#424242] rounded-md shadow-xl text-[11px] font-medium text-[#F2F2F2] whitespace-nowrap z-50">
          <span>Hand / Pan</span>
          <kbd className="px-1 py-0.2 bg-[#353535] border border-[#424242] rounded text-[9px] font-mono text-[#A8A8A8]">H</kbd>
        </div>
      </div>

      {/* SEPARATOR 1 */}
      <div className="w-5 h-px bg-[#424242] my-0.5" />

      {/* GROUP 2: FRAME & LAYOUT TOOLS */}
      {/* 3. Frame Tool (F) */}
      <div className="relative group">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setFrameMenuOpen(!frameMenuOpen)
            setShapeMenuOpen(false)
          }}
          id="tool-frame-btn"
          title="Frame / Artboard Tool (F)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeTool === 'frame' || frameMenuOpen
              ? 'selected-glass text-white font-medium'
              : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#3D3D3D]'
          }`}
        >
          <Frame className="w-4 h-4" />
        </button>
        {!frameMenuOpen && (
          <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2 py-1 bg-[#292929] border border-[#424242] rounded-md shadow-xl text-[11px] font-medium text-[#F2F2F2] whitespace-nowrap z-50">
            <span>Frame / Artboard</span>
            <kbd className="px-1 py-0.2 bg-[#353535] border border-[#424242] rounded text-[9px] font-mono text-[#A8A8A8]">F</kbd>
          </div>
        )}

        {frameMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-full ml-2.5 top-0 bg-[#292929] border border-[#424242] rounded-xl shadow-2xl py-1.5 w-48 text-xs z-50 animate-in fade-in slide-in-from-left-2 duration-150"
          >
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#A8A8A8] tracking-wider">
              Add Frame Preset
            </div>
            {FRAME_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={(e) => handleAddFramePreset(p.id, e)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#A8A8A8] hover:text-[#F2F2F2] group"
              >
                <div className="flex items-center gap-2">
                  {p.device === 'Desktop' && <Monitor className="w-3.5 h-3.5 text-blue-400" />}
                  {p.device === 'Laptop' && <Laptop className="w-3.5 h-3.5 text-cyan-400" />}
                  {p.device === 'Mobile' && <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
                  {p.device === 'Tablet' && <Tablet className="w-3.5 h-3.5 text-purple-400" />}
                  {p.device === 'Social' && <Square className="w-3.5 h-3.5 text-pink-400" />}
                  <span className="font-medium">{p.name}</span>
                </div>
                <span className="text-[10px] text-[#707070] font-mono">
                  {p.width}×{p.height}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SEPARATOR 2 */}
      <div className="w-5 h-px bg-[#424242] my-0.5" />

      {/* GROUP 3: SHAPES & DRAWING */}
      {/* 4. Shapes Tool (R) with Menu */}
      <div className="relative group">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShapeMenuOpen(!shapeMenuOpen)
            setFrameMenuOpen(false)
          }}
          id="tool-shapes-btn"
          title="Shapes (Rectangle, Ellipse, Polygon, Line, Arrow)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isShapeActive || shapeMenuOpen
              ? 'selected-glass text-white font-medium'
              : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#3D3D3D]'
          }`}
        >
          {activeTool === 'ellipse' ? (
            <Circle className="w-4 h-4" />
          ) : activeTool === 'polygon' ? (
            <Triangle className="w-4 h-4" />
          ) : activeTool === 'line' ? (
            <Minus className="w-4 h-4" />
          ) : activeTool === 'arrow' ? (
            <MoveRight className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
        {!shapeMenuOpen && (
          <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2 py-1 bg-[#292929] border border-[#424242] rounded-md shadow-xl text-[11px] font-medium text-[#F2F2F2] whitespace-nowrap z-50">
            <span>Shapes</span>
            <kbd className="px-1 py-0.2 bg-[#353535] border border-[#424242] rounded text-[9px] font-mono text-[#A8A8A8]">R</kbd>
          </div>
        )}

        {shapeMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-full ml-2.5 top-0 bg-[#292929] border border-[#424242] rounded-xl shadow-2xl py-1.5 w-44 text-xs z-50 animate-in fade-in slide-in-from-left-2 duration-150"
          >
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#A8A8A8] tracking-wider">
              Shapes
            </div>
            <button
              onClick={(e) => handleSelectTool('rectangle', e)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#A8A8A8] hover:text-[#F2F2F2]"
            >
              <div className="flex items-center gap-2">
                <Square className="w-3.5 h-3.5 text-blue-400" />
                <span>Rectangle</span>
              </div>
              <span className="text-[10px] text-[#707070] font-mono">R</span>
            </button>
            <button
              onClick={(e) => handleSelectTool('ellipse', e)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#A8A8A8] hover:text-[#F2F2F2]"
            >
              <div className="flex items-center gap-2">
                <Circle className="w-3.5 h-3.5 text-purple-400" />
                <span>Ellipse</span>
              </div>
              <span className="text-[10px] text-[#707070] font-mono">O</span>
            </button>
            <button
              onClick={(e) => handleSelectTool('polygon', e)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#A8A8A8] hover:text-[#F2F2F2]"
            >
              <div className="flex items-center gap-2">
                <Triangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Polygon / Star</span>
              </div>
              <span className="text-[10px] text-[#707070] font-mono">P</span>
            </button>
            <button
              onClick={(e) => handleSelectTool('line', e)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#A8A8A8] hover:text-[#F2F2F2]"
            >
              <div className="flex items-center gap-2">
                <Minus className="w-3.5 h-3.5 text-slate-400" />
                <span>Line</span>
              </div>
              <span className="text-[10px] text-[#707070] font-mono">L</span>
            </button>
            <button
              onClick={(e) => handleSelectTool('arrow', e)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#353535] flex items-center justify-between text-[#A8A8A8] hover:text-[#F2F2F2]"
            >
              <div className="flex items-center gap-2">
                <MoveRight className="w-3.5 h-3.5 text-sky-400" />
                <span>Arrow</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 5. Pen / Freehand Drawing Tool (P) */}
      <div className="relative group">
        <button
          onClick={() => setActiveTool('pen')}
          id="tool-pen-btn"
          title="Pen / Freehand Vector Tool (P)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeTool === 'pen'
              ? 'selected-glass text-white font-medium'
              : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#3D3D3D]'
          }`}
        >
          <Pen className="w-4 h-4" />
        </button>
        <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2 py-1 bg-[#292929] border border-[#424242] rounded-md shadow-xl text-[11px] font-medium text-[#F2F2F2] whitespace-nowrap z-50">
          <span>Pen / Freehand</span>
          <kbd className="px-1 py-0.2 bg-[#353535] border border-[#424242] rounded text-[9px] font-mono text-[#A8A8A8]">P</kbd>
        </div>
      </div>

      {/* SEPARATOR 3 */}
      <div className="w-5 h-px bg-[#424242] my-0.5" />

      {/* GROUP 4: TEXT */}
      {/* 6. Text Tool (T) */}
      <div className="relative group">
        <button
          onClick={() => {
            addNode({
              type: 'text',
              name: 'Text Block',
              width: 280,
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
          }}
          id="tool-text-btn"
          title="Add Text Block (T)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeTool === 'text'
              ? 'selected-glass text-white font-medium'
              : 'text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#3D3D3D]'
          }`}
        >
          <Type className="w-4 h-4" />
        </button>
        <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2 py-1 bg-[#292929] border border-[#424242] rounded-md shadow-xl text-[11px] font-medium text-[#F2F2F2] whitespace-nowrap z-50">
          <span>Text Block</span>
          <kbd className="px-1 py-0.2 bg-[#353535] border border-[#424242] rounded text-[9px] font-mono text-[#A8A8A8]">T</kbd>
        </div>
      </div>

      {/* SEPARATOR 4 */}
      <div className="w-5 h-px bg-[#424242] my-0.5" />

      {/* GROUP 5: IMAGES & ASSETS */}
      {/* 7. Image Tool (I) */}
      <div className="relative group">
        <button
          onClick={() => fileInputRef.current?.click()}
          id="tool-image-btn"
          title="Place / Upload Image (I)"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#3D3D3D] transition-all"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2 py-1 bg-[#292929] border border-[#424242] rounded-md shadow-xl text-[11px] font-medium text-[#F2F2F2] whitespace-nowrap z-50">
          <span>Place Image</span>
          <kbd className="px-1 py-0.2 bg-[#353535] border border-[#424242] rounded text-[9px] font-mono text-[#A8A8A8]">I</kbd>
        </div>
      </div>

      {/* SEPARATOR 5 */}
      <div className="w-5 h-px bg-[#424242] my-0.5" />

      {/* GROUP 6: COMPONENTS */}
      {/* 8. Component Tool (⌥⌘K) */}
      <div className="relative group">
        <button
          onClick={createComponentFromSelection}
          disabled={selectedIds.length === 0}
          id="tool-component-btn"
          title={selectedIds.length > 0 ? 'Create Component from Selection (⌥⌘K)' : 'Select an element to create a component'}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            selectedIds.length > 0
              ? 'text-purple-400 hover:text-white hover:bg-purple-600/30'
              : 'text-[#707070] cursor-not-allowed'
          }`}
        >
          <Component className="w-4 h-4" />
        </button>
        <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2 py-1 bg-[#292929] border border-[#424242] rounded-md shadow-xl text-[11px] font-medium text-[#F2F2F2] whitespace-nowrap z-50">
          <span>Component</span>
          <kbd className="px-1 py-0.2 bg-[#353535] border border-[#424242] rounded text-[9px] font-mono text-[#A8A8A8]">⌥⌘K</kbd>
        </div>
      </div>
    </nav>
  )
}
