import React, { useState } from 'react'
import {
  Layers,
  Layout,
  Printer,
  Sparkles,
  Download,
  Upload,
  FolderOpen,
  Sun,
  Moon,
  Laptop,
  RotateCcw,
  RotateCw,
  Cpu,
  CheckCircle2,
  Loader2,
  Edit2,
  Share2,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore, ActiveView, ThemeMode } from '../../store/useUIStore'

export const Header: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const isSaving = useProjectStore((s) => s.isSaving)
  const lastSaved = useProjectStore((s) => s.lastSaved)
  const setProjectDetails = useProjectStore((s) => s.setProjectDetails)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const canUndo = useProjectStore((s) => s.canUndo())
  const canRedo = useProjectStore((s) => s.canRedo())

  const activeView = useUIStore((s) => s.activeView)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const setGeneratorOpen = useUIStore((s) => s.setGeneratorOpen)
  const setExportOpen = useUIStore((s) => s.setExportOpen)
  const setImportOpen = useUIStore((s) => s.setImportOpen)
  const setDashboardOpen = useUIStore((s) => s.setDashboardOpen)
  const setOllamaSettingsOpen = useUIStore((s) => s.setOllamaSettingsOpen)

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(project?.name || 'Untitled Sitemap')

  const handleSaveTitle = () => {
    if (titleVal.trim() && project) {
      setProjectDetails(titleVal.trim())
    }
    setIsEditingTitle(false)
  }

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light')
    else if (theme === 'light') setTheme('system')
    else setTheme('dark')
  }

  return (
    <header className="h-13 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-30 flex-shrink-0 select-none">
      {/* Left: Project title & status */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setDashboardOpen(true)}
          title="Open Project Dashboard & Templates"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
            OpenSitemap
          </span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Project Name */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            className="px-2 py-0.5 rounded border border-blue-500 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            autoFocus
          />
        ) : (
          <div
            onClick={() => {
              setTitleVal(project?.name || '')
              setIsEditingTitle(true)
            }}
            className="group/title flex items-center gap-1.5 cursor-pointer max-w-[180px] sm:max-w-xs truncate"
          >
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {project?.name || 'Untitled Sitemap'}
            </span>
            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/title:opacity-100" />
          </div>
        )}

        {/* Autosave status indicator */}
        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
          {isSaving ? (
            <span className="flex items-center gap-1 text-blue-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          ) : (
            <span
              title={`Saved locally in IndexedDB ${lastSaved ? new Date(lastSaved).toLocaleTimeString() : ''}`}
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Center: View Switcher (Sitemap vs Wireframe vs Print) */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveView('canvas')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            activeView === 'canvas'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Sitemap</span>
        </button>

        <button
          onClick={() => setActiveView('wireframe')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            activeView === 'wireframe'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Wireframes</span>
        </button>

        <button
          onClick={() => setActiveView('print')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            activeView === 'print'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Print / Outline</span>
        </button>
      </div>

      {/* Right: Actions (AI, Export, Import, Theme, Settings) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setGeneratorOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-medium shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate
        </button>

        <button
          onClick={() => setExportOpen(true)}
          title="Export Project (JSON, SVG, Markdown)"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export</span>
        </button>

        <button
          onClick={() => setImportOpen(true)}
          title="Import JSON Project"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Upload className="w-4 h-4" />
        </button>

        <button
          onClick={() => setOllamaSettingsOpen(true)}
          title="Local AI & Ollama Setup"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Cpu className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTheme}
          title={`Theme: ${theme}`}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-purple-400" />
          ) : theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Laptop className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  )
}
