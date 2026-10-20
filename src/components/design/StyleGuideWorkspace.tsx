import React, { useState } from 'react'
import {
  Palette,
  Type,
  Box,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  ArrowLeft,
  Sliders,
  Sparkles,
  CreditCard,
  Square,
  CheckSquare,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { ColorToken, TextStyleToken } from '../../types'

export const StyleGuideWorkspace: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const addColorToken = useProjectStore((s) => s.addColorToken)
  const updateColorToken = useProjectStore((s) => s.updateColorToken)
  const deleteColorToken = useProjectStore((s) => s.deleteColorToken)
  const addTextStyleToken = useProjectStore((s) => s.addTextStyleToken)
  const updateTextStyleToken = useProjectStore((s) => s.updateTextStyleToken)
  const deleteTextStyleToken = useProjectStore((s) => s.deleteTextStyleToken)
  const addVisualElement = useProjectStore((s) => s.addVisualElement)

  const setActiveView = useUIStore((s) => s.setActiveView)
  const selectedPageId = useUIStore((s) => s.selectedPageId) || project?.pages[0]?.id || ''
  const addToast = useUIStore((s) => s.addToast)

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'components'>('colors')
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#1769E8')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const colorTokens = project?.designSystem?.colors || [
    { id: 'c1', name: 'Primary Blue', hex: '#1769E8', category: 'primary' },
    { id: 'c2', name: 'Secondary Purple', hex: '#873FF0', category: 'secondary' },
    { id: 'c3', name: 'Accent Yellow', hex: '#F9E52B', category: 'accent' },
    { id: 'c4', name: 'Deep Background', hex: '#080D19', category: 'neutral' },
    { id: 'c5', name: 'Card Surface', hex: '#0D1527', category: 'neutral' },
    { id: 'c6', name: 'Text Light', hex: '#F8F5EF', category: 'neutral' },
    { id: 'c7', name: 'Crimson Alert', hex: '#F04444', category: 'semantic' },
    { id: 'c8', name: 'Emerald Success', hex: '#10B981', category: 'semantic' },
  ]

  const textStyleTokens = project?.designSystem?.typography || [
    { id: 't1', name: 'Display H1', fontFamily: 'Inter', fontSize: 36, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.5 },
    { id: 't2', name: 'Heading H2', fontFamily: 'Inter', fontSize: 24, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.2 },
    { id: 't3', name: 'Heading H3', fontFamily: 'Inter', fontSize: 18, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
    { id: 't4', name: 'Body Large', fontFamily: 'Inter', fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
    { id: 't5', name: 'Body Default', fontFamily: 'Inter', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
    { id: 't6', name: 'Caption / Meta', fontFamily: 'Inter', fontSize: 12, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0.2 },
  ]

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    addToast({
      title: 'Copied to Clipboard',
      description: text,
      type: 'info',
    })
  }

  const handleAddColor = () => {
    if (!newColorName.trim()) return
    addColorToken({
      name: newColorName.trim(),
      hex: newColorHex,
      category: 'primary',
    })
    setNewColorName('')
    addToast({
      title: 'Color Added',
      description: `Added ${newColorName} to design tokens.`,
      type: 'success',
    })
  }

  const handleInsertComponent = (type: string, name: string, props: any, style: any) => {
    if (!selectedPageId) {
      addToast({
        title: 'Select a Page',
        description: 'Please select a page first before inserting components.',
        type: 'warning',
      })
      return
    }

    addVisualElement(selectedPageId, {
      name,
      type: type as any,
      content: props.label || props.title || name,
      layout: {
        x: 60,
        y: 60,
        width: type === 'button' ? 140 : type === 'card' ? 320 : 260,
        height: type === 'button' ? 44 : type === 'card' ? 200 : 48,
        rotation: 0,
        isLocked: false,
        isHidden: false,
      },
      style,
      props,
    })

    addToast({
      title: 'Component Inserted',
      description: `Inserted ${name} into active wireframe page.`,
      type: 'success',
    })
  }

  const handleExportTokens = () => {
    const cssVariables = colorTokens
      .map((c) => `  --color-${c.name.toLowerCase().replace(/\s+/g, '-')}: ${c.hex};`)
      .join('\n')

    const typographyTokens = textStyleTokens
      .map(
        (t) =>
          `  --font-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}: ${t.fontWeight} ${t.fontSize}px/${t.lineHeight} ${t.fontFamily};`,
      )
      .join('\n')

    const fileContent = `:root {\n  /* Colors */\n${cssVariables}\n\n  /* Typography */\n${typographyTokens}\n}\n`

    const blob = new Blob([fileContent], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.name || 'design'}-tokens.css`
    a.click()
    URL.revokeObjectURL(url)

    addToast({
      title: 'Tokens Exported',
      description: 'Downloaded design tokens as CSS variables.',
      type: 'success',
    })
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-[#050B17] text-[#F8F5EF] select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-14 bg-[#080D19] border-b border-[#151F32] px-6 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('canvas')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Canvas</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#873FF0]" />
            <h2 className="text-sm font-bold text-white">Style Guide & Design System</h2>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#0D1527] border border-[#1E293B] p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'colors' ? 'bg-[#1769E8] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Colors ({colorTokens.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'typography' ? 'bg-[#1769E8] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Typography ({textStyleTokens.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'components' ? 'bg-[#1769E8] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Components</span>
          </button>
        </div>

        {/* Export Tokens */}
        <button
          onClick={handleExportTokens}
          className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 text-white transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSS Tokens</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-8">
        {/* TAB 1: COLORS */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Color Palette & Design Tokens</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reusable brand colors and tokens synchronized with your wireframes and sitemap cards.
                </p>
              </div>

              {/* Add Color Token Form */}
              <div className="flex items-center gap-2 bg-[#0D1527] border border-[#1E293B] p-1.5 rounded-xl">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  placeholder="Token Name"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="bg-transparent text-xs text-white px-2 py-1 outline-none w-32 font-medium"
                />
                <button
                  onClick={handleAddColor}
                  className="px-2.5 py-1 rounded-lg bg-[#873FF0] hover:bg-[#7834E0] text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Colors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {colorTokens.map((token) => (
                <div
                  key={token.id}
                  className="bg-[#0D1527] border border-[#1E293B] hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition-all group"
                >
                  <div
                    style={{ backgroundColor: token.hex }}
                    className="h-28 w-full relative flex items-end justify-between p-3"
                  >
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {token.hex.toUpperCase()}
                    </span>

                    <button
                      onClick={() => handleCopy(token.hex, token.id)}
                      title="Copy Hex"
                      className="p-1.5 rounded bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                    >
                      {copiedId === token.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{token.name}</h4>
                      <span className="text-[10px] uppercase font-mono text-slate-500">
                        {token.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteColorToken(token.id)}
                        title="Delete Token"
                        className="p-1 hover:text-rose-400 text-slate-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Typography Hierarchy & Scale</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Curated typography styles used across headlines, body copy, and UI controls.
              </p>
            </div>

            <div className="divide-y divide-[#151F32] bg-[#0D1527] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
              {textStyleTokens.map((style) => (
                <div key={style.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-[#101D38]/50 transition-colors">
                  <div className="space-y-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{style.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1769E8]/20 text-[#1769E8]">
                        {style.fontSize}px
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {style.fontFamily} • Weight {style.fontWeight} • Line {style.lineHeight}
                    </div>
                  </div>

                  <div className="flex-1 truncate">
                    <p
                      style={{
                        fontFamily: style.fontFamily,
                        fontSize: `${style.fontSize}px`,
                        fontWeight: style.fontWeight,
                        lineHeight: style.lineHeight,
                        letterSpacing: `${style.letterSpacing}px`,
                      }}
                      className="text-white truncate"
                    >
                      {style.name.includes('Display') || style.name.includes('Heading')
                        ? 'Digital Architecture for Next-Gen Teams'
                        : 'Clean, modular, and structured visual sitemaps with rapid wireframing.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleInsertComponent(
                          'text',
                          style.name,
                          { label: style.name },
                          {
                            typography: {
                              fontFamily: style.fontFamily,
                              fontSize: style.fontSize,
                              fontWeight: style.fontWeight,
                              lineHeight: style.lineHeight,
                              letterSpacing: style.letterSpacing,
                            },
                          },
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-[#155ECC] text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Use on Canvas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMPONENTS & VARIANTS */}
        {activeTab === 'components' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-bold text-white">Component Library & Variants</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready-to-use reusable components. Click any component to instantly insert it into your active wireframe!
              </p>
            </div>

            {/* Buttons Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Buttons & Controls
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Primary Button */}
                <div className="p-4 rounded-xl bg-[#0D1527] border border-[#1E293B] space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 uppercase">Primary Button</span>
                    <h5 className="font-bold text-xs text-white">Call to Action</h5>
                  </div>
                  <button
                    onClick={() =>
                      handleInsertComponent(
                        'button',
                        'Primary Button',
                        { label: 'Get Started' },
                        { fill: '#1769E8', cornerRadius: 8, typography: { color: '#FFFFFF', fontWeight: 600 } },
                      )
                    }
                    className="w-full py-2.5 rounded-lg bg-[#1769E8] hover:bg-[#155ECC] text-white font-bold text-xs shadow-md transition-colors"
                  >
                    + Insert Primary
                  </button>
                </div>

                {/* Secondary Button */}
                <div className="p-4 rounded-xl bg-[#0D1527] border border-[#1E293B] space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 uppercase">Secondary Button</span>
                    <h5 className="font-bold text-xs text-white">Alternative Action</h5>
                  </div>
                  <button
                    onClick={() =>
                      handleInsertComponent(
                        'button',
                        'Secondary Button',
                        { label: 'Learn More' },
                        { fill: '#873FF0', cornerRadius: 8, typography: { color: '#FFFFFF', fontWeight: 600 } },
                      )
                    }
                    className="w-full py-2.5 rounded-lg bg-[#873FF0] hover:bg-[#7834E0] text-white font-bold text-xs shadow-md transition-colors"
                  >
                    + Insert Secondary
                  </button>
                </div>

                {/* Outline Button */}
                <div className="p-4 rounded-xl bg-[#0D1527] border border-[#1E293B] space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 uppercase">Outline Button</span>
                    <h5 className="font-bold text-xs text-white">Bordered Pill</h5>
                  </div>
                  <button
                    onClick={() =>
                      handleInsertComponent(
                        'button',
                        'Outline Button',
                        { label: 'View Documentation' },
                        {
                          fill: 'transparent',
                          cornerRadius: 8,
                          stroke: { color: '#3b82f6', width: 1.5, style: 'solid', position: 'inside' },
                          typography: { color: '#3b82f6', fontWeight: 600 },
                        },
                      )
                    }
                    className="w-full py-2.5 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-950/30 font-bold text-xs transition-colors"
                  >
                    + Insert Outline
                  </button>
                </div>

                {/* Danger Button */}
                <div className="p-4 rounded-xl bg-[#0D1527] border border-[#1E293B] space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-rose-400 uppercase">Destructive Button</span>
                    <h5 className="font-bold text-xs text-white">Danger Action</h5>
                  </div>
                  <button
                    onClick={() =>
                      handleInsertComponent(
                        'button',
                        'Danger Button',
                        { label: 'Delete Project' },
                        { fill: '#F04444', cornerRadius: 8, typography: { color: '#FFFFFF', fontWeight: 600 } },
                      )
                    }
                    className="w-full py-2.5 rounded-lg bg-[#F04444] hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    + Insert Danger
                  </button>
                </div>
              </div>
            </div>

            {/* Cards & Content Containers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cards & Containers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Feature Card */}
                <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    ★
                  </div>
                  <h5 className="font-bold text-sm text-white">Feature Highlight Card</h5>
                  <p className="text-xs text-slate-400">
                    High-conversion feature card component with icon header and description.
                  </p>
                  <button
                    onClick={() =>
                      handleInsertComponent(
                        'card',
                        'Feature Card',
                        { description: 'High-conversion feature card component with icon header.' },
                        { fill: '#0E172A', cornerRadius: 12 },
                      )
                    }
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                  >
                    + Insert Feature Card
                  </button>
                </div>

                {/* Input Form Field */}
                <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✎
                  </div>
                  <h5 className="font-bold text-sm text-white">Input Field</h5>
                  <p className="text-xs text-slate-400">
                    Clean modern form text input with label and placeholder.
                  </p>
                  <button
                    onClick={() =>
                      handleInsertComponent(
                        'input',
                        'Form Input',
                        { label: 'Work Email Address' },
                        { fill: '#080D19', cornerRadius: 8 },
                      )
                    }
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                  >
                    + Insert Input Field
                  </button>
                </div>

                {/* Data Table */}
                <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    ▦
                  </div>
                  <h5 className="font-bold text-sm text-white">Data Table</h5>
                  <p className="text-xs text-slate-400">
                    Tabular layout with headers and alternating row styles.
                  </p>
                  <button
                    onClick={() =>
                      handleInsertComponent('table', 'Data Table', {}, { fill: '#080D19', cornerRadius: 8 })
                    }
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                  >
                    + Insert Data Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
