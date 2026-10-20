import React, { useState, useEffect } from 'react'
import {
  Plus,
  Sparkles,
  Workflow,
  Maximize2,
  RotateCcw,
  RotateCw,
  Search,
  ChevronDown,
  Download,
  Settings,
  FolderOpen,
  Upload,
  Cpu,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'

export const Header: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const addPage = useProjectStore((s) => s.addPage)
  const applyAutoLayout = useProjectStore((s) => s.applyAutoLayout)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const canUndo = useProjectStore((s) => s.canUndo())
  const canRedo = useProjectStore((s) => s.canRedo())

  const setGeneratorOpen = useUIStore((s) => s.setGeneratorOpen)
  const setExportOpen = useUIStore((s) => s.setExportOpen)
  const setImportOpen = useUIStore((s) => s.setImportOpen)
  const setDashboardOpen = useUIStore((s) => s.setDashboardOpen)
  const setOllamaSettingsOpen = useUIStore((s) => s.setOllamaSettingsOpen)
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  const [zoomMenuOpen, setZoomMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(100)

  // Safe access to react flow instance provided by ReactFlowProvider in App.tsx
  const reactFlow = useReactFlow()

  useEffect(() => {
    if (!reactFlow) return
    const updateZoom = () => {
      try {
        const z = reactFlow.getZoom()
        if (typeof z === 'number' && !isNaN(z)) {
          setCurrentZoom(Math.round(z * 100))
        }
      } catch {
        // Safe fallback
      }
    }
    const interval = setInterval(updateZoom, 500)
    return () => clearInterval(interval)
  }, [reactFlow])

  const handleAddPage = () => {
    addPage({
      name: `Page ${(project?.pages.length || 0) + 1}`,
      slug: `/page-${(project?.pages.length || 0) + 1}`,
      color: 'cobalt',
    })
  }

  const handleAutoLayout = () => {
    applyAutoLayout('TB')
    setTimeout(() => {
      try {
        reactFlow.fitView({ padding: 0.15, maxZoom: 1.0 })
      } catch {
        // Fallback
      }
    }, 50)
  }

  const handleFitView = () => {
    try {
      reactFlow.fitView({ padding: 0.15, maxZoom: 1.0 })
    } catch {
      // Fallback
    }
  }

  const handleSetZoom = (scale: number) => {
    try {
      reactFlow.zoomTo(scale, { duration: 200 })
      setCurrentZoom(Math.round(scale * 100))
    } catch {
      // Fallback
    }
    setZoomMenuOpen(false)
  }

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light')
    else if (theme === 'light') setTheme('system')
    else setTheme('dark')
  }

  return (
    <header className="h-14 bg-[#202020] border-b border-[#3B3B3B] px-4 flex items-center justify-between z-30 flex-shrink-0 select-none text-[#F3F3F3]">
      {/* 1. Left: Brand Icon, Condensed Wordmark & Mission Tagline */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDashboardOpen(true)}
          title="Project Dashboard & Templates"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          {/* Purple 8-Petal Asterisk Flower Logo */}
          <div className="w-8 h-8 rounded-xl bg-[#873FF0] flex items-center justify-center shadow-md flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <circle cx="12" cy="12" r="2.8" />
              <circle cx="12" cy="4.2" r="2.4" />
              <circle cx="12" cy="19.8" r="2.4" />
              <circle cx="4.2" cy="12" r="2.4" />
              <circle cx="19.8" cy="12" r="2.4" />
              <circle cx="6.5" cy="6.5" r="2.4" />
              <circle cx="17.5" cy="17.5" r="2.4" />
              <circle cx="6.5" cy="17.5" r="2.4" />
              <circle cx="17.5" cy="6.5" r="2.4" />
            </svg>
          </div>

          {/* Bold Condensed Title */}
          <div className="flex flex-col text-left leading-none">
            <span className="font-display font-black text-white text-base tracking-tight uppercase leading-[0.9]">
              OPEN
            </span>
            <span className="font-display font-black text-white text-base tracking-tight uppercase leading-[0.9]">
              SITEMAP
            </span>
          </div>
        </button>

        {/* 4-Line Mission Tagline */}
        <div className="hidden xl:flex flex-col text-[7.5px] font-extrabold text-[#B0B0B0] tracking-wider uppercase leading-[1.1] pl-3 border-l border-[#3B3B3B] select-none">
          <span>PLAN</span>
          <span>DESIGN</span>
          <span>STRUCTURE</span>
          <span>BUILD</span>
        </div>

        {/* Add Page Button */}
        <button
          onClick={handleAddPage}
          className="ml-3 h-8 px-3.5 rounded-lg bg-[#2B2B2B] hover:bg-[#353535] active:scale-[0.98] border border-[#3B3B3B] text-[#F3F3F3] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Page</span>
        </button>

        {/* Generate with AI Button */}
        <button
          onClick={() => setGeneratorOpen(true)}
          className="h-8 px-3.5 rounded-lg bg-[#873FF0] hover:bg-[#7834E0] active:scale-[0.98] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Generate with AI</span>
        </button>
      </div>

      {/* 2. Center: Canvas Controls Pill (Auto Layout, Fit View, Undo, Redo, Zoom) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#2B2B2B] border border-[#3B3B3B] rounded-lg p-0.5 text-[#B0B0B0]">
          {/* Auto Layout */}
          <button
            onClick={handleAutoLayout}
            title="Auto Layout Tree"
            className="p-1.5 rounded hover:bg-[#353535] hover:text-[#F3F3F3] transition-colors"
          >
            <Workflow className="w-4 h-4" />
          </button>

          {/* Fit to View */}
          <button
            onClick={handleFitView}
            title="Fit to Screen"
            className="p-1.5 rounded hover:bg-[#353535] hover:text-[#F3F3F3] transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Undo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
            className="p-1.5 rounded hover:bg-[#353535] hover:text-[#F3F3F3] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
            className="p-1.5 rounded hover:bg-[#353535] hover:text-[#F3F3F3] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#3B3B3B] mx-0.5" />

          {/* Zoom Dropdown */}
          <div className="relative">
            <button
              onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
              className="px-2 py-1 rounded hover:bg-[#353535] hover:text-[#F3F3F3] flex items-center gap-1 text-xs font-medium transition-colors"
            >
              <Search className="w-3 h-3 text-[#B0B0B0]" />
              <span className="text-[#F3F3F3]">{currentZoom}%</span>
              <ChevronDown className="w-3 h-3 text-[#B0B0B0]" />
            </button>

            {zoomMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 w-32 bg-[#252525] border border-[#3B3B3B] rounded-lg shadow-2xl py-1 text-xs text-[#B0B0B0] z-50"
              >
                {[50, 75, 100, 125, 150, 200].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleSetZoom(val / 100)}
                    className={`w-full px-3 py-1.5 text-left hover:bg-[#303030] hover:text-[#F3F3F3] flex items-center justify-between ${
                      currentZoom === val ? 'text-[#F3F3F3] font-bold bg-[#303030]' : ''
                    }`}
                  >
                    <span>{val}%</span>
                  </button>
                ))}
                <div className="border-t border-[#3B3B3B] my-1" />
                <button
                  onClick={() => {
                    handleFitView()
                    setZoomMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#303030] text-purple-400 font-medium"
                >
                  Fit to Screen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Right: Export button & User Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Export Button */}
        <button
          onClick={() => setExportOpen(true)}
          className="h-8 px-3.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export</span>
        </button>

        {/* User Profile Avatar (Red circle with 'NK') */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            title="User Profile & Settings"
            className="w-8 h-8 rounded-full bg-[#F04444] text-white font-extrabold text-xs flex items-center justify-center select-none shadow-sm hover:ring-2 hover:ring-white/20 transition-all"
          >
            NK
          </button>

          {profileMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 w-52 bg-[#252525] border border-[#3B3B3B] rounded-xl shadow-2xl py-1.5 text-xs text-[#B0B0B0] z-50 divide-y divide-[#3B3B3B]"
            >
              <div className="px-3 py-2">
                <p className="font-bold text-[#F3F3F3]">Nithin Kumar</p>
                <p className="text-[10px] text-[#B0B0B0] truncate">nithin@opensitemap.dev</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setDashboardOpen(true)
                    setProfileMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#303030] hover:text-[#F3F3F3] flex items-center gap-2"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#B0B0B0]" />
                  <span>Projects & Templates</span>
                </button>
                <button
                  onClick={() => {
                    setImportOpen(true)
                    setProfileMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#303030] hover:text-[#F3F3F3] flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-[#B0B0B0]" />
                  <span>Import Project</span>
                </button>
                <button
                  onClick={() => {
                    setOllamaSettingsOpen(true)
                    setProfileMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#303030] hover:text-[#F3F3F3] flex items-center gap-2"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#B0B0B0]" />
                  <span>Local AI / Ollama</span>
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    toggleTheme()
                    setProfileMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#303030] hover:text-[#F3F3F3] flex items-center gap-2"
                >
                  {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-purple-400" />
                  ) : theme === 'light' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Laptop className="w-3.5 h-3.5 text-[#B0B0B0]" />
                  )}
                  <span>Theme: {theme}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

