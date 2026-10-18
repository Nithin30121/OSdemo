import React, { useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { PropertiesPanel } from './components/layout/PropertiesPanel'
import { SitemapCanvas } from './components/canvas/SitemapCanvas'
import { WireframeWorkspace } from './components/wireframe/WireframeWorkspace'
import { PrintPreviewModal } from './components/export/PrintPreviewModal'
import { GeneratorModal } from './components/generator/GeneratorModal'
import { SectionLibraryModal } from './components/section/SectionLibraryModal'
import { ProjectDashboardModal } from './components/dashboard/ProjectDashboardModal'
import { ExportModal } from './components/export/ExportModal'
import { ImportModal } from './components/export/ImportModal'
import { OllamaSettingsModal } from './components/generator/OllamaSettingsModal'
import { ToastContainer } from './components/common/ToastContainer'
import { useProjectStore } from './store/useProjectStore'
import { useUIStore } from './store/useUIStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Layers, Loader2 } from 'lucide-react'

export function App() {
  const init = useProjectStore((s) => s.init)
  const isLoaded = useProjectStore((s) => s.isLoaded)
  const activeView = useUIStore((s) => s.activeView)
  const theme = useUIStore((s) => s.theme)

  // Initialize store and keyboard shortcuts
  useEffect(() => {
    init()
  }, [init])

  useKeyboardShortcuts()

  // Apply dark mode class to root document element
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(isDark ? 'dark' : 'light')
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl animate-pulse">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Opening OpenSitemap workspace...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Top Main Navigation Toolbar */}
      <Header />

      {/* Main App Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Workspace (Switchable: Sitemap Canvas vs Wireframe Studio vs Print Spec) */}
        <main className="flex-1 h-full overflow-hidden flex relative">
          {activeView === 'canvas' && <SitemapCanvas />}
          {activeView === 'wireframe' && <WireframeWorkspace />}
          {activeView === 'print' && <PrintPreviewModal />}
        </main>

        {/* Right Properties & Section Inspector Panel (only in canvas/wireframe modes) */}
        {activeView !== 'print' && <PropertiesPanel />}
      </div>

      {/* Modals & Dialogs */}
      <GeneratorModal />
      <SectionLibraryModal />
      <ProjectDashboardModal />
      <ExportModal />
      <ImportModal />
      <OllamaSettingsModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}

export default App
