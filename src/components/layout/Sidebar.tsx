import React from 'react'
import {
  Folder,
  Layout,
  Workflow,
  Palette,
  Box,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Search,
  MoreHorizontal,
  PenTool,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { LayersPanel } from '../design/LayersPanel'

const COLOR_DOTS: Record<string, string> = {
  blue: '#1769E8',
  cobalt: '#1769E8',
  yellow: '#F9E52B',
  red: '#F04444',
  purple: '#873FF0',
  teal: '#29C7A3',
  pink: '#F45AA8',
  cream: '#F4E8D6',
}

function getPageDotColor(color?: string, pageType?: string): string {
  if (color && COLOR_DOTS[color.toLowerCase()]) {
    return COLOR_DOTS[color.toLowerCase()]
  }
  const c = (color || '').toLowerCase()
  if (c.includes('red') || c === '#f04444') return COLOR_DOTS.red
  if (c.includes('yellow') || c === '#f9e52b') return COLOR_DOTS.yellow
  if (c.includes('purple') || c === '#873ff0') return COLOR_DOTS.purple
  if (c.includes('teal') || c.includes('cyan') || c === '#29c7a3') return COLOR_DOTS.teal
  if (c.includes('pink') || c === '#f45aa8') return COLOR_DOTS.pink
  if (c.includes('cream') || c === '#f4e8d6') return COLOR_DOTS.cream
  if (c.includes('blue') || c === '#1769e8') return COLOR_DOTS.cobalt

  switch (pageType) {
    case 'landing':
    case 'dashboard':
      return COLOR_DOTS.cobalt
    case 'product':
    case 'content':
      return COLOR_DOTS.yellow
    case 'checkout':
    case 'auth':
      return COLOR_DOTS.red
    case 'blog':
      return COLOR_DOTS.purple
    default:
      return COLOR_DOTS.cobalt
  }
}

export const Sidebar: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const addPage = useProjectStore((s) => s.addPage)
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const setDashboardOpen = useUIStore((s) => s.setDashboardOpen)
  const activeView = useUIStore((s) => s.activeView)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const selectedPageId = useUIStore((s) => s.selectedPageId)
  const setSelectedPageId = useUIStore((s) => s.setSelectedPageId)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const sidebarActiveTab = useUIStore((s) => s.sidebarActiveTab)
  const setSidebarActiveTab = useUIStore((s) => s.setSidebarActiveTab)

  if (!isSidebarOpen) {
    return (
      <aside className="w-12 h-full flex flex-col items-center py-4 bg-[#252525] border-r border-[#3B3B3B] z-20 select-none">
        <button
          onClick={() => setSidebarOpen(true)}
          title="Expand Sidebar"
          className="p-2 rounded-lg text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030] transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </aside>
    )
  }

  const handleAddPage = () => {
    addPage({
      name: `Page ${(project?.pages.length || 0) + 1}`,
      slug: `/page-${(project?.pages.length || 0) + 1}`,
      color: 'cobalt',
    })
  }

  const filteredPages = (project?.pages || []).filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase().trim()
    return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
  })

  const effectivePageId = selectedPageId || project?.pages[0]?.id || ''

  return (
    <aside className="w-64 h-full flex flex-col bg-[#252525] border-r border-[#3B3B3B] z-20 flex-shrink-0 select-none text-[#F3F3F3] overflow-hidden">
      {/* 1. Top Project Card */}
      <div className="p-3">
        <div
          onClick={() => setDashboardOpen(true)}
          className="bg-[#2B2B2B] hover:bg-[#303030] border border-[#3B3B3B] rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#353535] flex items-center justify-center text-[#F3F3F3] flex-shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-[#F3F3F3] truncate">
                {project?.name || 'KLConnect'}
              </h2>
              <span className="text-[10px] text-[#B0B0B0] block truncate">
                {project?.pages.length || 12} pages · Saved
              </span>
            </div>
          </div>

          <button
            title="Switch Project"
            className="text-[#B0B0B0] hover:text-[#F3F3F3] p-1 rounded hover:bg-[#353535]"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Workspace Navigation */}
      <div className="px-3 space-y-1">
        <button
          onClick={() => setActiveView('canvas')}
          className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold transition-all ${
            activeView === 'canvas'
              ? 'selected-glass text-[#F3F3F3] shadow-sm font-semibold'
              : 'text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030]/60'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>Sitemap</span>
        </button>

        <button
          onClick={() => setActiveView('wireframe')}
          className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all ${
            activeView === 'wireframe'
              ? 'selected-glass text-[#F3F3F3] shadow-sm font-semibold'
              : 'text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030]/60'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Wireframes & Design</span>
        </button>

        <button
          onClick={() => setActiveView('studio')}
          id="nav-studio-btn"
          className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold transition-all ${
            activeView === 'studio'
              ? 'selected-glass text-[#F3F3F3] shadow-sm font-semibold'
              : 'text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030]/60'
          }`}
        >
          <PenTool className="w-4 h-4 text-purple-300" />
          <span>Studio</span>
          <span className="ml-auto text-[9px] uppercase tracking-wider bg-purple-500/25 border border-purple-400/30 text-purple-200 px-1.5 py-0.5 rounded font-mono font-bold">
            PRO
          </span>
        </button>

        <button
          onClick={() => setActiveView('design')}
          className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all ${
            activeView === 'design'
              ? 'selected-glass text-[#F3F3F3] shadow-sm font-semibold'
              : 'text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030]/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Style Guide</span>
        </button>

        <button
          onClick={() => setActiveView('print')}
          className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all ${
            activeView === 'print'
              ? 'selected-glass text-[#F3F3F3] shadow-sm font-semibold'
              : 'text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030]/60'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Export Spec</span>
        </button>
      </div>

      {/* 3. Tab Switcher: Pages vs Layers */}
      <div className="px-3 pt-4 pb-1">
        <div className="grid grid-cols-2 bg-[#202020] border border-[#3B3B3B] p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setSidebarActiveTab('pages')}
            className={`py-1 rounded-md text-center font-bold text-[11px] transition-all ${
              sidebarActiveTab === 'pages'
                ? 'selected-glass text-[#F3F3F3] shadow-sm'
                : 'text-[#B0B0B0] hover:text-[#F3F3F3]'
            }`}
          >
            Pages
          </button>
          <button
            onClick={() => setSidebarActiveTab('layers')}
            className={`py-1 rounded-md text-center font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
              sidebarActiveTab === 'layers'
                ? 'selected-glass text-[#F3F3F3] shadow-sm'
                : 'text-[#B0B0B0] hover:text-[#F3F3F3]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Layers</span>
          </button>
        </div>
      </div>

      {/* 4. Tab Body: Pages list or Hierarchical Layers */}
      {sidebarActiveTab === 'layers' ? (
        <LayersPanel pageId={effectivePageId} />
      ) : (
        <>
          {/* Pages Header with Warm Cream Add Button */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F3F3F3]">Pages</h3>

            <button
              onClick={handleAddPage}
              title="Add New Page"
              className="w-6 h-6 rounded bg-[#F4E8D6] hover:bg-[#E5D7C2] active:scale-95 text-slate-950 flex items-center justify-center font-bold text-xs transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Search Filter for Pages */}
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 bg-[#303030] border border-[#3B3B3B] rounded-lg px-2.5 py-1 text-xs">
              <Search className="w-3 h-3 text-[#777777]" />
              <input
                type="text"
                placeholder="Filter pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[#F3F3F3] outline-none placeholder:text-[#777777] text-[11px]"
              />
            </div>
          </div>

          {/* Pages List with Colored Dots and Section Counts */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
            {filteredPages.map((p) => {
              const isSelected = selectedPageId === p.id
              const dotColor = getPageDotColor(p.color, p.type)
              const sectionCount = (project?.sections || []).filter((s) => s.pageId === p.id).length

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPageId(p.id)}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors group ${
                    isSelected
                      ? 'bg-[#303030] text-[#F3F3F3] border-l-2 border-[#1769E8] font-bold shadow-sm'
                      : 'text-[#F3F3F3] hover:bg-[#2B2B2B] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      style={{ backgroundColor: dotColor }}
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                    />
                    <span className="truncate">{p.name}</span>
                  </div>

                  <span className="text-[11px] font-semibold text-[#B0B0B0] group-hover:text-[#F3F3F3] ml-2">
                    {sectionCount}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* 5. Bottom Collapse Toggle */}
      <div className="p-2 border-t border-[#3B3B3B] flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(false)}
          title="Collapse Sidebar"
          className="p-1.5 rounded-lg text-[#B0B0B0] hover:text-[#F3F3F3] hover:bg-[#303030] transition-colors flex items-center gap-1.5 text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Collapse</span>
        </button>
      </div>
    </aside>
  )
}

