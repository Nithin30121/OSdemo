import React, { useState } from 'react'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Lock,
  Unlock,
  Layers,
  Bookmark,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { TextStyleToken } from '../../types'

const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Poppins',
  'Outfit',
  'Space Grotesk',
  'Playfair Display',
  'Fira Code',
  'system-ui',
]

const FONT_WEIGHTS = [
  { label: 'Regular (400)', value: 400 },
  { label: 'Medium (500)', value: 500 },
  { label: 'SemiBold (600)', value: 600 },
  { label: 'Bold (700)', value: 700 },
  { label: 'Black (900)', value: 900 },
]

export const DesignPropertiesPanel: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const selectedPageId = useUIStore((s) => s.selectedPageId) || project?.pages[0]?.id || ''
  const selectedElementIds = useUIStore((s) => s.selectedElementIds)

  const updateVisualElement = useProjectStore((s) => s.updateVisualElement)
  const updateWireframeComponentLayout = useProjectStore((s) => s.updateWireframeComponentLayout)
  const updateWireframeComponentStyle = useProjectStore((s) => s.updateWireframeComponentStyle)
  const addTextStyleToken = useProjectStore((s) => s.addTextStyleToken)
  const addToast = useUIStore((s) => s.addToast)

  const [newStyleName, setNewStyleName] = useState('')
  const [isCreatingStyle, setIsCreatingStyle] = useState(false)

  if (!project) return null

  const wireframe = project.wireframes[selectedPageId]
  const components = wireframe?.components || []
  const elements = wireframe?.elements || []

  // Find currently selected element or component
  const selectedId = selectedElementIds[0] || null
  const selectedVisualElement = elements.find((el) => el.id === selectedId) || null
  const selectedComponent = !selectedVisualElement
    ? components.find((c) => c.id === selectedId) || null
    : null

  if (!selectedVisualElement && !selectedComponent) {
    return (
      <div className="p-4 text-center text-[#B0B0B0] space-y-2 select-none">
        <Layers className="w-8 h-8 text-[#777777] mx-auto mb-2" />
        <h4 className="font-semibold text-[#F3F3F3] text-xs">No element selected</h4>
        <p className="text-[11px] text-[#B0B0B0] max-w-xs mx-auto">
          Click any component or element on the canvas to inspect and edit its visual properties.
        </p>
      </div>
    )
  }

  // Get layout and style based on what is selected
  const layout = selectedVisualElement
    ? selectedVisualElement.layout
    : selectedComponent?.layout || {
        x: 0,
        y: 0,
        width: 1100,
        height: 240,
        rotation: 0,
        isLocked: selectedComponent?.isLocked || false,
        isHidden: selectedComponent?.isHidden || false,
        zIndex: 0,
        aspectRatioLocked: false,
      }

  const style = selectedVisualElement
    ? selectedVisualElement.style
    : selectedComponent?.style || {}

  const handleUpdateLayout = (updates: Partial<typeof layout>) => {
    if (selectedVisualElement) {
      updateVisualElement(selectedPageId, selectedVisualElement.id, {
        layout: { ...layout, ...updates },
      })
    } else if (selectedComponent) {
      updateWireframeComponentLayout(selectedPageId, selectedComponent.id, updates)
    }
  }

  const handleUpdateStyle = (updates: Partial<typeof style>) => {
    if (selectedVisualElement) {
      updateVisualElement(selectedPageId, selectedVisualElement.id, {
        style: { ...style, ...updates },
      })
    } else if (selectedComponent) {
      updateWireframeComponentStyle(selectedPageId, selectedComponent.id, updates)
    }
  }

  const handleUpdateTypography = (updates: Partial<NonNullable<typeof style.typography>>) => {
    handleUpdateStyle({
      typography: {
        ...style.typography,
        ...updates,
      },
    })
  }

  const handleApplyTextStyle = (token: TextStyleToken) => {
    handleUpdateTypography({
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      fontWeight: token.fontWeight,
      lineHeight: token.lineHeight,
      letterSpacing: token.letterSpacing,
      color: token.color || style.typography?.color,
    })
    handleUpdateStyle({ textStyleId: token.id })
    addToast({
      title: 'Style Applied',
      description: `Applied ${token.name} typography token.`,
      type: 'info',
    })
  }

  const handleSaveAsNewTextStyle = () => {
    if (!newStyleName.trim()) return
    const created = addTextStyleToken({
      name: newStyleName.trim(),
      fontFamily: style.typography?.fontFamily || 'Inter',
      fontSize: style.typography?.fontSize || 16,
      fontWeight: style.typography?.fontWeight || 400,
      lineHeight: style.typography?.lineHeight || 1.5,
      letterSpacing: style.typography?.letterSpacing || 0,
      color: style.typography?.color,
    })
    setNewStyleName('')
    setIsCreatingStyle(false)
    addToast({
      title: 'Text Style Created',
      description: `Saved style "${created.name}" to Design System.`,
      type: 'success',
    })
  }

  const colorTokens = project.designSystem?.colors || [
    { id: 'c1', name: 'Primary Blue', hex: '#1769E8', category: 'primary' },
    { id: 'c2', name: 'Purple Accent', hex: '#873FF0', category: 'secondary' },
    { id: 'c3', name: 'Bright Yellow', hex: '#F9E52B', category: 'accent' },
    { id: 'c4', name: 'Dark Surface', hex: '#0D1527', category: 'neutral' },
    { id: 'c5', name: 'White Fill', hex: '#FFFFFF', category: 'neutral' },
    { id: 'c6', name: 'Crimson Red', hex: '#F04444', category: 'semantic' },
    { id: 'c7', name: 'Emerald Green', hex: '#10B981', category: 'semantic' },
  ]

  const textStyleTokens = project.designSystem?.typography || [
    { id: 't1', name: 'Display H1', fontFamily: 'Inter', fontSize: 36, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.5 },
    { id: 't2', name: 'Heading H2', fontFamily: 'Inter', fontSize: 24, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.2 },
    { id: 't3', name: 'Heading H3', fontFamily: 'Inter', fontSize: 18, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
    { id: 't4', name: 'Body Large', fontFamily: 'Inter', fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
    { id: 't5', name: 'Body Default', fontFamily: 'Inter', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
    { id: 't6', name: 'Caption / Meta', fontFamily: 'Inter', fontSize: 12, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0.2 },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-[#F3F3F3] select-none">
      {/* Selected Element Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#3B3B3B]">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-mono text-[#B0B0B0] block">
            {selectedVisualElement ? selectedVisualElement.type : 'Component'}
          </span>
          <h3 className="font-bold text-[#F3F3F3] text-sm truncate">
            {selectedVisualElement?.name || selectedComponent?.name}
          </h3>
        </div>

        <button
          onClick={() => handleUpdateLayout({ isLocked: !layout.isLocked })}
          title={layout.isLocked ? 'Unlock Element' : 'Lock Element'}
          className={`p-1.5 rounded transition-colors ${
            layout.isLocked ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-[#303030] text-[#B0B0B0]'
          }`}
        >
          {layout.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 1. Alignment Quick Actions */}
      <div>
        <label className="block text-[11px] font-semibold text-[#B0B0B0] mb-1.5">
          Alignment & Snapping
        </label>
        <div className="grid grid-cols-6 gap-1 bg-[#202020] p-1 rounded-lg border border-[#3B3B3B]">
          <button
            onClick={() => handleUpdateLayout({ x: 0 })}
            title="Align Left"
            className="p-1.5 hover:bg-[#303030] text-[#B0B0B0] hover:text-[#F3F3F3] rounded text-center flex items-center justify-center transition-colors"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleUpdateLayout({ x: Math.max(0, (1100 - layout.width) / 2) })}
            title="Align Center Horizontally"
            className="p-1.5 hover:bg-[#303030] text-[#B0B0B0] hover:text-[#F3F3F3] rounded text-center flex items-center justify-center transition-colors"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleUpdateLayout({ x: Math.max(0, 1100 - layout.width) })}
            title="Align Right"
            className="p-1.5 hover:bg-[#303030] text-[#B0B0B0] hover:text-[#F3F3F3] rounded text-center flex items-center justify-center transition-colors"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleUpdateLayout({ y: 0 })}
            title="Align Top"
            className="p-1.5 hover:bg-[#303030] text-[#B0B0B0] hover:text-[#F3F3F3] rounded text-center flex items-center justify-center transition-colors"
          >
            <span className="text-[10px] font-bold">⤒</span>
          </button>
          <button
            onClick={() => handleUpdateLayout({ y: Math.max(0, (500 - layout.height) / 2) })}
            title="Align Middle Vertically"
            className="p-1.5 hover:bg-[#303030] text-[#B0B0B0] hover:text-[#F3F3F3] rounded text-center flex items-center justify-center transition-colors"
          >
            <span className="text-[10px] font-bold">⤓⤒</span>
          </button>
          <button
            onClick={() => handleUpdateLayout({ y: Math.max(0, 500 - layout.height) })}
            title="Align Bottom"
            className="p-1.5 hover:bg-[#303030] text-[#B0B0B0] hover:text-[#F3F3F3] rounded text-center flex items-center justify-center transition-colors"
          >
            <span className="text-[10px] font-bold">⤓</span>
          </button>
        </div>
      </div>

      {/* 2. Position & Dimensions (Frame) */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-[#B0B0B0]">
          Position & Dimensions
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* X */}
          <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5">
            <span className="text-[10px] font-mono text-[#777777] w-4">X</span>
            <input
              type="number"
              value={Math.round(layout.x)}
              onChange={(e) => handleUpdateLayout({ x: Number(e.target.value) || 0 })}
              className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
            />
          </div>

          {/* Y */}
          <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5">
            <span className="text-[10px] font-mono text-[#777777] w-4">Y</span>
            <input
              type="number"
              value={Math.round(layout.y)}
              onChange={(e) => handleUpdateLayout({ y: Number(e.target.value) || 0 })}
              className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
            />
          </div>

          {/* W */}
          <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5">
            <span className="text-[10px] font-mono text-[#777777] w-4">W</span>
            <input
              type="number"
              min={16}
              value={Math.round(layout.width)}
              onChange={(e) => handleUpdateLayout({ width: Math.max(16, Number(e.target.value) || 16) })}
              className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
            />
          </div>

          {/* H */}
          <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5">
            <span className="text-[10px] font-mono text-[#777777] w-4">H</span>
            <input
              type="number"
              min={16}
              value={Math.round(layout.height)}
              onChange={(e) => handleUpdateLayout({ height: Math.max(16, Number(e.target.value) || 16) })}
              className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Rotation & Constrain Ratio */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5">
            <span className="text-[10px] font-mono text-[#777777] w-4">°</span>
            <input
              type="number"
              min={0}
              max={360}
              value={layout.rotation || 0}
              onChange={(e) => handleUpdateLayout({ rotation: Number(e.target.value) || 0 })}
              placeholder="0"
              className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={() => handleUpdateLayout({ aspectRatioLocked: !layout.aspectRatioLocked })}
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition-colors ${
              layout.aspectRatioLocked
                ? 'selected-glass text-[#F3F3F3] font-semibold'
                : 'bg-[#303030] border-[#3B3B3B] text-[#B0B0B0] hover:text-[#F3F3F3]'
            }`}
          >
            {layout.aspectRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span className="text-[11px]">Ratio</span>
          </button>
        </div>
      </div>

      {/* 3. Appearance: Opacity & Corner Radius */}
      <div className="space-y-2 pt-2 border-t border-[#3B3B3B]">
        <label className="block text-[11px] font-semibold text-[#B0B0B0]">
          Appearance & Geometry
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Opacity */}
          <div>
            <span className="text-[10px] text-[#777777] mb-1 block">Opacity (%)</span>
            <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1">
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round((style.opacity !== undefined ? style.opacity : 1) * 100)}
                onChange={(e) => handleUpdateStyle({ opacity: (Number(e.target.value) || 0) / 100 })}
                className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
              />
              <span className="text-[10px] text-[#777777]">%</span>
            </div>
          </div>

          {/* Corner Radius */}
          <div>
            <span className="text-[10px] text-[#777777] mb-1 block">Radius (px)</span>
            <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1">
              <input
                type="number"
                min={0}
                max={999}
                value={style.cornerRadius !== undefined ? style.cornerRadius : 8}
                onChange={(e) => handleUpdateStyle({ cornerRadius: Number(e.target.value) || 0 })}
                className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
              />
              <span className="text-[10px] text-[#777777]">px</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Fill Color & Design System Swatches */}
      <div className="space-y-2 pt-2 border-t border-[#3B3B3B]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#B0B0B0]">Fill</label>
          <button
            onClick={() => handleUpdateStyle({ fill: undefined })}
            className="text-[10px] text-[#777777] hover:text-[#F3F3F3]"
          >
            Clear Fill
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={style.fill && style.fill.startsWith('#') ? style.fill : '#1769E8'}
            onChange={(e) => handleUpdateStyle({ fill: e.target.value })}
            className="w-8 h-8 rounded-lg border border-[#3B3B3B] bg-transparent cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={style.fill || ''}
            placeholder="#1769E8 or rgba(...)"
            onChange={(e) => handleUpdateStyle({ fill: e.target.value })}
            className="flex-1 bg-[#303030] border border-[#3B3B3B] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F3F3] font-mono focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Quick Color Swatches from Design System */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {colorTokens.map((c) => (
            <button
              key={c.id}
              onClick={() => handleUpdateStyle({ fill: c.hex })}
              title={`${c.name} (${c.hex})`}
              style={{ backgroundColor: c.hex }}
              className="w-5 h-5 rounded-md border border-white/20 hover:scale-110 transition-transform shadow-sm"
            />
          ))}
        </div>
      </div>

      {/* 5. Stroke & Border */}
      <div className="space-y-2 pt-2 border-t border-[#3B3B3B]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#B0B0B0]">Stroke</label>
          <button
            onClick={() => handleUpdateStyle({ stroke: undefined })}
            className="text-[10px] text-[#777777] hover:text-[#F3F3F3]"
          >
            None
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={style.stroke?.color || '#000000'}
            onChange={(e) =>
              handleUpdateStyle({
                stroke: {
                  color: e.target.value,
                  width: style.stroke?.width || 1,
                  style: style.stroke?.style || 'solid',
                  position: style.stroke?.position || 'inside',
                },
              })
            }
            className="w-8 h-8 rounded-lg border border-[#3B3B3B] bg-transparent cursor-pointer p-0.5"
          />

          <select
            value={style.stroke?.width || 1}
            onChange={(e) =>
              handleUpdateStyle({
                stroke: {
                  color: style.stroke?.color || '#3b82f6',
                  width: Number(e.target.value) || 1,
                  style: style.stroke?.style || 'solid',
                  position: style.stroke?.position || 'inside',
                },
              })
            }
            className="w-20 bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5 text-xs text-[#F3F3F3] font-mono focus:outline-none"
          >
            <option value="1">1 px</option>
            <option value="2">2 px</option>
            <option value="3">3 px</option>
            <option value="4">4 px</option>
          </select>

          <select
            value={style.stroke?.style || 'solid'}
            onChange={(e) =>
              handleUpdateStyle({
                stroke: {
                  color: style.stroke?.color || '#3b82f6',
                  width: style.stroke?.width || 1,
                  style: e.target.value as any,
                  position: style.stroke?.position || 'inside',
                },
              })
            }
            className="flex-1 bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5 text-xs text-[#F3F3F3] focus:outline-none"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
      </div>

      {/* 6. Shadows & Effects */}
      <div className="space-y-2 pt-2 border-t border-[#3B3B3B]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#B0B0B0]">Effects & Shadow</label>
          <button
            onClick={() =>
              handleUpdateStyle({
                shadow: style.shadow
                  ? undefined
                  : { x: 0, y: 4, blur: 16, spread: 0, color: 'rgba(0,0,0,0.25)' },
              })
            }
            className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold"
          >
            {style.shadow ? 'Remove Shadow' : '+ Add Shadow'}
          </button>
        </div>

        {style.shadow && (
          <div className="p-2.5 rounded-lg bg-[#2B2B2B] border border-[#3B3B3B] space-y-2">
            <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center">
              <div>
                <span className="text-[#777777]">X</span>
                <input
                  type="number"
                  value={style.shadow.x}
                  onChange={(e) =>
                    handleUpdateStyle({ shadow: { ...style.shadow!, x: Number(e.target.value) || 0 } })
                  }
                  className="w-full bg-[#202020] border border-[#3B3B3B] rounded px-1 py-0.5 text-[#F3F3F3] text-center"
                />
              </div>
              <div>
                <span className="text-[#777777]">Y</span>
                <input
                  type="number"
                  value={style.shadow.y}
                  onChange={(e) =>
                    handleUpdateStyle({ shadow: { ...style.shadow!, y: Number(e.target.value) || 0 } })
                  }
                  className="w-full bg-[#202020] border border-[#3B3B3B] rounded px-1 py-0.5 text-[#F3F3F3] text-center"
                />
              </div>
              <div>
                <span className="text-[#777777]">Blur</span>
                <input
                  type="number"
                  min={0}
                  value={style.shadow.blur}
                  onChange={(e) =>
                    handleUpdateStyle({ shadow: { ...style.shadow!, blur: Number(e.target.value) || 0 } })
                  }
                  className="w-full bg-[#202020] border border-[#3B3B3B] rounded px-1 py-0.5 text-[#F3F3F3] text-center"
                />
              </div>
              <div>
                <span className="text-[#777777]">Spread</span>
                <input
                  type="number"
                  value={style.shadow.spread}
                  onChange={(e) =>
                    handleUpdateStyle({ shadow: { ...style.shadow!, spread: Number(e.target.value) || 0 } })
                  }
                  className="w-full bg-[#202020] border border-[#3B3B3B] rounded px-1 py-0.5 text-[#F3F3F3] text-center"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Typography Workspace & Reusable Text Styles */}
      <div className="space-y-2.5 pt-2 border-t border-[#3B3B3B]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#B0B0B0]">Typography</label>
          <button
            onClick={() => setIsCreatingStyle(!isCreatingStyle)}
            className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            <Bookmark className="w-3 h-3" />
            <span>Save Style</span>
          </button>
        </div>

        {/* Create new reusable text style modal row */}
        {isCreatingStyle && (
          <div className="p-2 rounded-lg bg-[#2B2B2B] border border-purple-500 space-y-1.5">
            <input
              type="text"
              placeholder="Style Name (e.g. Hero Display)"
              value={newStyleName}
              onChange={(e) => setNewStyleName(e.target.value)}
              className="w-full bg-[#303030] border border-[#3B3B3B] rounded px-2 py-1 text-xs text-[#F3F3F3]"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setIsCreatingStyle(false)}
                className="px-2 py-0.5 text-[10px] text-[#B0B0B0] hover:text-[#F3F3F3]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsNewTextStyle}
                className="px-2 py-0.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white rounded font-bold"
              >
                Save Token
              </button>
            </div>
          </div>
        )}

        {/* Text Style Token Presets Selector */}
        <div>
          <span className="text-[10px] text-[#777777] block mb-1">Reusable Text Styles</span>
          <select
            value={style.textStyleId || ''}
            onChange={(e) => {
              const token = textStyleTokens.find((t) => t.id === e.target.value)
              if (token) handleApplyTextStyle(token)
            }}
            className="w-full bg-[#303030] border border-[#3B3B3B] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F3F3] focus:outline-none focus:border-purple-500"
          >
            <option value="">Custom (Not Linked)</option>
            {textStyleTokens.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.fontSize}px {t.fontFamily}
              </option>
            ))}
          </select>
        </div>

        {/* Font Family & Weight */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-[#777777] block mb-1">Font Family</span>
            <select
              value={style.typography?.fontFamily || 'Inter'}
              onChange={(e) => handleUpdateTypography({ fontFamily: e.target.value })}
              className="w-full bg-[#303030] border border-[#3B3B3B] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F3F3] focus:outline-none"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-[#777777] block mb-1">Weight</span>
            <select
              value={style.typography?.fontWeight || 400}
              onChange={(e) => handleUpdateTypography({ fontWeight: Number(e.target.value) || 400 })}
              className="w-full bg-[#303030] border border-[#3B3B3B] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F3F3] focus:outline-none"
            >
              {FONT_WEIGHTS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Font Size, Line Height & Letter Spacing */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5">
            <span className="text-[10px] font-mono text-[#777777] w-7">Size</span>
            <input
              type="number"
              min={8}
              max={144}
              value={style.typography?.fontSize || 16}
              onChange={(e) => handleUpdateTypography({ fontSize: Number(e.target.value) || 16 })}
              className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
            />
            <span className="text-[9px] text-[#777777]">px</span>
          </div>

          <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5">
            <span className="text-[10px] font-mono text-[#777777] w-7">Line</span>
            <input
              type="number"
              step={0.1}
              min={0.8}
              max={3}
              value={style.typography?.lineHeight || 1.4}
              onChange={(e) => handleUpdateTypography({ lineHeight: Number(e.target.value) || 1.4 })}
              className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-[#303030] border border-[#3B3B3B] rounded-lg px-2 py-1.5">
            <span className="text-[10px] font-mono text-[#777777] w-8">Track</span>
            <input
              type="number"
              step={0.5}
              min={-5}
              max={20}
              value={style.typography?.letterSpacing || 0}
              onChange={(e) => handleUpdateTypography({ letterSpacing: Number(e.target.value) || 0 })}
              className="w-full bg-transparent text-[#F3F3F3] text-xs font-mono focus:outline-none"
            />
            <span className="text-[9px] text-[#777777]">px</span>
          </div>
        </div>

        {/* Alignment & Transform */}
        <div className="flex items-center justify-between gap-1 bg-[#202020] p-1 rounded-lg border border-[#3B3B3B]">
          <button
            onClick={() => handleUpdateTypography({ textAlign: 'left' })}
            title="Align Text Left"
            className={`p-1.5 rounded flex-1 flex justify-center transition-all ${
              (style.typography?.textAlign || 'left') === 'left'
                ? 'selected-glass text-[#F3F3F3] font-bold shadow-sm'
                : 'text-[#B0B0B0] hover:text-[#F3F3F3]'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleUpdateTypography({ textAlign: 'center' })}
            title="Align Text Center"
            className={`p-1.5 rounded flex-1 flex justify-center transition-all ${
              style.typography?.textAlign === 'center'
                ? 'selected-glass text-[#F3F3F3] font-bold shadow-sm'
                : 'text-[#B0B0B0] hover:text-[#F3F3F3]'
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleUpdateTypography({ textAlign: 'right' })}
            title="Align Text Right"
            className={`p-1.5 rounded flex-1 flex justify-center transition-all ${
              style.typography?.textAlign === 'right'
                ? 'selected-glass text-[#F3F3F3] font-bold shadow-sm'
                : 'text-[#B0B0B0] hover:text-[#F3F3F3]'
            }`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleUpdateTypography({ textAlign: 'justify' })}
            title="Justify Text"
            className={`p-1.5 rounded flex-1 flex justify-center transition-all ${
              style.typography?.textAlign === 'justify'
                ? 'selected-glass text-[#F3F3F3] font-bold shadow-sm'
                : 'text-[#B0B0B0] hover:text-[#F3F3F3]'
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
