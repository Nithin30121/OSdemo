import React from 'react'
import {
  Folder,
  Layers,
  Search,
  Plus,
  Filter,
  ChevronDown,
  Globe,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { PageHierarchyTree } from '../page/PageHierarchyTree'
import { PageType } from '../../types'

export const Sidebar: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const addPage = useProjectStore((s) => s.addPage)
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const setDashboardOpen = useUIStore((s) => s.setDashboardOpen)
  const setGeneratorOpen = useUIStore((s) => s.setGeneratorOpen)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const setFilterType = useUIStore((s) => s.setFilterType)
  const filterGroupId = useUIStore((s) => s.filterGroupId)
  const setFilterGroupId = useUIStore((s) => s.setFilterGroupId)

  if (!isSidebarOpen) {
    return (
      <aside className="w-12 h-full flex flex-col items-center py-4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-20">
        <button
          onClick={() => setSidebarOpen(true)}
          title="Expand Sidebar"
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-64 sm:w-72 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-20 flex-shrink-0">
      {/* Brand & Project Switcher */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setDashboardOpen(true)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left min-w-0"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {project?.name || 'OpenSitemap'}
            </h2>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              Switch Project <ChevronDown className="w-2.5 h-2.5" />
            </span>
          </div>
        </button>

        <button
          onClick={() => setSidebarOpen(false)}
          title="Collapse Sidebar"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages or slug..."
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as PageType | 'all')}
            className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Types</option>
            <option value="landing">Landing</option>
            <option value="content">Content</option>
            <option value="product">Product</option>
            <option value="checkout">Checkout</option>
            <option value="dashboard">Dashboard</option>
            <option value="auth">Auth</option>
            <option value="blog">Blog</option>
          </select>

          <select
            value={filterGroupId}
            onChange={(e) => setFilterGroupId(e.target.value)}
            className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Groups</option>
            {project?.groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pages Tree Header */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Page Structure ({project?.pages.length || 0})
        </span>

        <button
          onClick={() =>
            addPage({
              name: `Page ${(project?.pages.length || 0) + 1}`,
              slug: `/page-${(project?.pages.length || 0) + 1}`,
            })
          }
          className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-0.5"
        >
          <Plus className="w-3 h-3" /> Add Page
        </button>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        <PageHierarchyTree parentId={null} />
      </div>

      {/* Bottom Shortcuts */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-1 text-xs">
        <button
          onClick={() => setGeneratorOpen(true)}
          className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate with AI
        </button>
      </div>
    </aside>
  )
}
