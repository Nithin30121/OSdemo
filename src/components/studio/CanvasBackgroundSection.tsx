import React, { useRef, useState, useEffect } from 'react'
import { Palette, RotateCcw, Pipette, Check } from 'lucide-react'
import { useStudioStore } from '../../store/useStudioStore'

const CHECKERBOARD_PATTERN: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(45deg, #404040 25%, transparent 25%),
    linear-gradient(-45deg, #404040 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #404040 75%),
    linear-gradient(-45deg, transparent 75%, #404040 75%)
  `,
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  backgroundColor: '#262626',
}

export const CANVAS_BG_PRESETS = [
  { id: 'black', label: 'Black', value: '#000000', hexText: '#000000', isTransparent: false },
  { id: 'charcoal', label: 'Charcoal', value: '#181818', hexText: '#181818', isTransparent: false },
  { id: 'dark-grey', label: 'Dark Grey', value: '#2B2B2B', hexText: '#2B2B2B', isTransparent: false },
  { id: 'light-grey', label: 'Light Grey', value: '#E5E5E5', hexText: '#E5E5E5', isTransparent: false },
  { id: 'white', label: 'White', value: '#FFFFFF', hexText: '#FFFFFF', isTransparent: false },
  { id: 'transparent', label: 'Checkerboard Transparency', value: 'transparent', hexText: 'transparent', isTransparent: true },
]

export const CanvasBackgroundSection: React.FC = () => {
  const canvasBackground = useStudioStore((s) => s.canvasBackground) || '#000000'
  const setCanvasBackground = useStudioStore((s) => s.setCanvasBackground)
  const resetCanvasBackground = useStudioStore((s) => s.resetCanvasBackground)

  const nativeColorInputRef = useRef<HTMLInputElement>(null)
  const [hexInput, setHexInput] = useState(canvasBackground)

  // Keep hexInput synced when canvasBackground changes externally
  useEffect(() => {
    setHexInput(canvasBackground)
  }, [canvasBackground])

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)

    const trimmed = val.trim().toLowerCase()
    if (trimmed === 'transparent') {
      setCanvasBackground('transparent')
      return
    }
    const hexPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
    if (hexPattern.test(trimmed)) {
      let fullHex = trimmed
      if (trimmed.length === 4) {
        fullHex = `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
      }
      setCanvasBackground(fullHex.toUpperCase())
    }
  }

  const handleHexBlur = () => {
    const trimmed = hexInput.trim().toLowerCase()
    if (trimmed === 'transparent') {
      setHexInput('transparent')
      return
    }
    const hexPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
    if (!hexPattern.test(trimmed)) {
      setHexInput(canvasBackground)
    }
  }

  const isTransparent = canvasBackground === 'transparent'
  const pickerColor = isTransparent || !canvasBackground.startsWith('#') || canvasBackground.length !== 7
    ? '#000000'
    : canvasBackground

  return (
    <div id="studio-canvas-background-section" className="bg-[#303030] border border-[#424242] rounded-xl p-3 space-y-3">
      {/* Header with Title and Reset Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-bold text-[#F2F2F2] text-xs">Canvas Background</span>
        </div>
        <button
          id="studio-canvas-bg-reset-btn"
          onClick={resetCanvasBackground}
          title="Reset to default pure black (#000000)"
          className="text-[10px] text-[#A8A8A8] hover:text-[#F2F2F2] flex items-center gap-1 hover:bg-[#383838] px-1.5 py-0.5 rounded transition-colors"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Color Swatch & Native Color Picker & Hex Input */}
      <div className="flex items-center gap-2">
        {/* Swatch Button */}
        <button
          id="studio-canvas-bg-swatch"
          type="button"
          onClick={() => nativeColorInputRef.current?.click()}
          title="Click to open color picker"
          style={isTransparent ? CHECKERBOARD_PATTERN : { backgroundColor: canvasBackground }}
          className="w-8 h-8 rounded-lg border border-[#424242] shadow-inner relative flex-shrink-0 cursor-pointer hover:border-[#1769E8] transition-all overflow-hidden"
        >
          {/* Native Color Input */}
          <input
            id="studio-canvas-bg-native-picker"
            ref={nativeColorInputRef}
            type="color"
            value={pickerColor}
            onChange={(e) => setCanvasBackground(e.target.value.toUpperCase())}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </button>

        {/* Hex Text Input */}
        <div className="flex-1 relative">
          <input
            id="studio-canvas-bg-hex-input"
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            placeholder="#000000"
            className="w-full bg-[#353535] border border-[#424242] rounded px-2.5 py-1.5 text-xs font-mono uppercase text-[#F2F2F2] outline-none focus:border-[#1769E8] transition-colors"
          />
        </div>

        {/* Open Native Picker Quick Button */}
        <button
          id="studio-canvas-bg-picker-btn"
          type="button"
          onClick={() => nativeColorInputRef.current?.click()}
          title="Open native color picker"
          className="p-1.5 bg-[#353535] hover:bg-[#383838] border border-[#424242] rounded text-[#A8A8A8] hover:text-[#F2F2F2] transition-colors"
        >
          <Pipette className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Swatches */}
      <div>
        <label className="text-[10px] text-[#A8A8A8] block mb-1.5 font-medium">Presets</label>
        <div className="grid grid-cols-6 gap-1.5">
          {CANVAS_BG_PRESETS.map((preset) => {
            const isSelected = canvasBackground.toLowerCase() === preset.value.toLowerCase()
            return (
              <button
                key={preset.id}
                id={`studio-canvas-bg-preset-${preset.id}`}
                type="button"
                data-preset-value={preset.value}
                onClick={() => setCanvasBackground(preset.value)}
                title={`${preset.label} (${preset.hexText})`}
                style={preset.isTransparent ? CHECKERBOARD_PATTERN : { backgroundColor: preset.value }}
                className={`h-7 rounded-md border transition-all relative flex items-center justify-center ${
                  isSelected
                    ? 'border-[#1769E8] ring-2 ring-[#1769E8]/50 scale-105 shadow-sm'
                    : 'border-[#424242] hover:border-[#707070] hover:scale-102'
                }`}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 drop-shadow-md ${
                      preset.id === 'white' || preset.id === 'light-grey'
                        ? 'text-black'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
