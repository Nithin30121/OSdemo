import React, { useState, useEffect } from 'react'
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Plus,
  Sliders,
  Layers,
  Sparkles,
  Tag,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { WireframeComponentRenderer } from './WireframeComponentRenderer'
import { ViewportMode, WireframePageData } from '../../types'

export const WireframeWorkspace: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const selectedPageId = useUIStore((s) => s.selectedPageId)
  const setSelectedPageId = useUIStore((s) => s.setSelectedPageId)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const openSectionLibraryForPage = useUIStore((s) => s.openSectionLibraryForPage)
  const updateWireframe = useProjectStore((s) => s.updateWireframe)
  const syncWireframeFromSections = useProjectStore((s) => s.syncWireframeFromSections)
  const updateWireframeComponentProps = useProjectStore((s) => s.updateWireframeComponentProps)
  const addToast = useUIStore((s) => s.addToast)

  // Default active page: selected page or first page
  const [activePageId, setActivePageId] = useState<string>(
    selectedPageId || (project?.pages[0]?.id ?? ''),
  )

  useEffect(() => {
    if (selectedPageId) {
      setActivePageId(selectedPageId)
    } else if (project?.pages.length && !activePageId) {
      setActivePageId(project.pages[0].id)
    }
  }, [selectedPageId, project])

  if (!project || project.pages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <Layers className="w-12 h-12 text-slate-400 mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No pages to wireframe yet
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
          Create pages on the Sitemap Canvas or generate a full architecture with AI first.
        </p>
        <button
          onClick={() => setActiveView('canvas')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
        >
          Return to Sitemap Canvas
        </button>
      </div>
    )
  }

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0]
  const currentWf: WireframePageData = project.wireframes[activePage.id] || {
    pageId: activePage.id,
    components: [],
    viewport: 'desktop',
    layoutConfiguration: {
      spacing: 'comfortable',
      showWireframeLabels: true,
      theme: 'wireframe-clean',
    },
  }

  const viewport = currentWf.viewport || 'desktop'
  const layoutConfig = currentWf.layoutConfiguration || {
    spacing: 'comfortable',
    showWireframeLabels: true,
    theme: 'wireframe-clean',
  }

  const setViewport = (mode: ViewportMode) => {
    updateWireframe(activePage.id, {
      ...currentWf,
      viewport: mode,
    })
  }

  const toggleLabels = () => {
    updateWireframe(activePage.id, {
      ...currentWf,
      layoutConfiguration: {
        ...layoutConfig,
        showWireframeLabels: !layoutConfig.showWireframeLabels,
      },
    })
  }

  const setSpacing = (spacing: 'compact' | 'comfortable' | 'spacious') => {
    updateWireframe(activePage.id, {
      ...currentWf,
      layoutConfiguration: {
        ...layoutConfig,
        spacing,
      },
    })
  }

  const handleSyncFromSections = () => {
    syncWireframeFromSections(activePage.id)
    addToast({
      title: 'Wireframes Synchronized',
      description: `Synced low-fi wireframe blocks to match sitemap sections for ${activePage.name}`,
      type: 'success',
    })
  }

  const handleMoveComponent = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= currentWf.components.length) return

    const reordered = [...currentWf.components]
    const temp = reordered[index]
    reordered[index] = reordered[target]
    reordered[target] = temp

    updateWireframe(activePage.id, {
      ...currentWf,
      components: reordered,
    })
  }

  const handleDeleteComponent = (compId: string) => {
    updateWireframe(activePage.id, {
      ...currentWf,
      components: currentWf.components.filter((c) => c.id !== compId),
    })
  }

  // Device container width based on viewport mode
  const containerWidthClass =
    viewport === 'mobile'
      ? 'w-[375px]'
      : viewport === 'tablet'
      ? 'w-[768px]'
      : 'w-full max-w-[1100px]'

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-100 dark:bg-slate-950/80 overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-10">
        {/* Left: Page Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('canvas')}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Canvas</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Page Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden md:inline">Page:</span>
            <select
              value={activePage.id}
              onChange={(e) => {
                setActivePageId(e.target.value)
                setSelectedPageId(e.target.value)
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100"
            >
              {project.pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setViewport('desktop')}
            title="Desktop View (1100px)"
            className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
              viewport === 'desktop'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>

          <button
            onClick={() => setViewport('tablet')}
            title="Tablet View (768px)"
            className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
              viewport === 'tablet'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>

          <button
            onClick={() => setViewport('mobile')}
            title="Mobile View (375px)"
            className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
              viewport === 'mobile'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Spacing, Labels, Sync */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLabels}
            title="Toggle Wireframe Component Labels"
            className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
              layoutConfig.showWireframeLabels
                ? 'border-blue-300 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-3 h-3 inline mr-1" />
            <span className="hidden sm:inline">Labels</span>
          </button>

          <select
            value={layoutConfig.spacing}
            onChange={(e) => setSpacing(e.target.value as any)}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 hidden md:block"
          >
            <option value="compact">Compact Spacing</option>
            <option value="comfortable">Comfortable Spacing</option>
            <option value="spacious">Spacious Spacing</option>
          </select>

          <button
            onClick={handleSyncFromSections}
            title="Regenerate Wireframe Layout from Sitemap Sections"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Sync Sections</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        <div
          className={`${containerWidthClass} transition-all duration-200 flex flex-col min-h-[700px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden`}
        >
          {/* Device Browser Header Bar */}
          <div className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="flex-1 max-w-sm mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-1 px-3 rounded-full text-center text-[10px] font-mono text-slate-400 truncate shadow-inner">
              https://yoursite.com{activePage.slug}
            </div>

            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {viewport}
            </div>
          </div>

          {/* Wireframe Components Stack */}
          <div className="flex-1 p-3 sm:p-4 space-y-4">
            {currentWf.components.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Layers className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No wireframe components for this page
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click below to generate initial wireframes automatically from your sitemap sections.
                </p>
                <button
                  onClick={handleSyncFromSections}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow"
                >
                  Generate Wireframes from Sections
                </button>
              </div>
            ) : (
              currentWf.components.map((comp, idx) => {
                const sec = project.sections.find((s) => s.id === comp.sectionId)
                return (
                  <WireframeComponentRenderer
                    key={comp.id}
                    component={comp}
                    isGlobal={sec?.isGlobal}
                    showLabels={layoutConfig.showWireframeLabels}
                    spacing={layoutConfig.spacing}
                    viewport={viewport}
                    onUpdateProps={(newProps) =>
                      updateWireframeComponentProps(activePage.id, comp.id, newProps)
                    }
                    onMoveUp={idx > 0 ? () => handleMoveComponent(idx, 'up') : undefined}
                    onMoveDown={
                      idx < currentWf.components.length - 1
                        ? () => handleMoveComponent(idx, 'down')
                        : undefined
                    }
                    onDelete={() => handleDeleteComponent(comp.id)}
                  />
                )
              })
            )}

            {/* Quick Add Section Button at bottom of wireframe */}
            <div className="pt-4 text-center">
              <button
                onClick={() => openSectionLibraryForPage(activePage.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-600 dark:text-slate-400 hover:text-blue-600 text-xs font-medium transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Section to {activePage.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
