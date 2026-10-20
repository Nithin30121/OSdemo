import { create } from 'zustand'
import { PageType } from '../types'

export type ActiveView = 'canvas' | 'wireframe' | 'print' | 'design' | 'studio'
export type ThemeMode = 'light' | 'dark' | 'system'

function getInitialView(): ActiveView {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.pathname.includes('studio') || window.location.hash.includes('studio')) {
      return 'studio'
    }
  }
  return 'canvas'
}

interface ToastMessage {
  id: string
  title: string
  description?: string
  type: 'info' | 'success' | 'warning' | 'error'
}

interface UIStoreState {
  // Navigation & View
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void

  // Selection
  selectedPageId: string | null
  setSelectedPageId: (id: string | null) => void
  selectedSectionId: string | null
  setSelectedSectionId: (id: string | null) => void
  multiSelectedPageIds: string[]
  setMultiSelectedPageIds: (ids: string[]) => void
  togglePageSelection: (id: string) => void
  clearSelection: () => void

  // Visual Canvas & Element Selection
  selectedElementIds: string[]
  setSelectedElementIds: (ids: string[]) => void
  toggleElementSelection: (id: string, multi?: boolean) => void
  clearElementSelection: () => void
  activeWireframeTool: 'select' | 'frame' | 'text' | 'button' | 'shape' | 'image' | 'container' | 'card' | 'input' | 'table'
  setActiveWireframeTool: (tool: 'select' | 'frame' | 'text' | 'button' | 'shape' | 'image' | 'container' | 'card' | 'input' | 'table') => void

  // Search & Filter
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterType: PageType | 'all'
  setFilterType: (type: PageType | 'all') => void
  filterGroupId: string | 'all'
  setFilterGroupId: (groupId: string | 'all') => void

  // Panels
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  sidebarActiveTab: 'pages' | 'layers'
  setSidebarActiveTab: (tab: 'pages' | 'layers') => void
  isPropertiesPanelOpen: boolean
  togglePropertiesPanel: () => void
  setPropertiesPanelOpen: (open: boolean) => void
  propertiesActiveTab: 'page' | 'sections' | 'wireframe' | 'design'
  setPropertiesActiveTab: (tab: 'page' | 'sections' | 'wireframe' | 'design') => void
  activeDesignTab: 'design' | 'styleguide' | 'typography'
  setActiveDesignTab: (tab: 'design' | 'styleguide' | 'typography') => void

  // Modals
  isGeneratorOpen: boolean
  setGeneratorOpen: (open: boolean) => void
  isTemplatePickerOpen: boolean
  setTemplatePickerOpen: (open: boolean) => void
  isDashboardOpen: boolean
  setDashboardOpen: (open: boolean) => void
  isStyleGuideOpen: boolean
  setStyleGuideOpen: (open: boolean) => void
  isExportOpen: boolean
  setExportOpen: (open: boolean) => void
  isImportOpen: boolean
  setImportOpen: (open: boolean) => void
  isOllamaSettingsOpen: boolean
  setOllamaSettingsOpen: (open: boolean) => void
  isSectionLibraryOpen: boolean
  setSectionLibraryOpen: (open: boolean) => void
  sectionLibraryPageId: string | null
  openSectionLibraryForPage: (pageId: string) => void

  // Theme
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void

  // Ollama Config
  ollamaEndpoint: string
  setOllamaEndpoint: (endpoint: string) => void
  ollamaModel: string
  setOllamaModel: (model: string) => void

  // Toast notifications
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

function safeGetStorage(key: string, fallback: string): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key) || fallback
    } catch {
      return fallback
    }
  }
  return fallback
}

function getInitialTheme(): ThemeMode {
  const stored = safeGetStorage('opensitemap_theme', 'dark') as ThemeMode
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'dark'
}

export const useUIStore = create<UIStoreState>((set, get) => ({
  activeView: getInitialView(),
  setActiveView: (view) => {
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      try {
        const targetPath = view === 'studio' ? '/studio' : '/'
        if (window.location.pathname !== targetPath) {
          window.history.pushState(null, '', targetPath)
        }
      } catch {}
    }
    set({ activeView: view })
  },

  selectedPageId: null,
  setSelectedPageId: (id) =>
    set({
      selectedPageId: id,
      selectedSectionId: null,
      isPropertiesPanelOpen: id !== null ? true : get().isPropertiesPanelOpen,
    }),

  selectedSectionId: null,
  setSelectedSectionId: (id) => set({ selectedSectionId: id }),

  multiSelectedPageIds: [],
  setMultiSelectedPageIds: (ids) => set({ multiSelectedPageIds: ids }),
  togglePageSelection: (id) => {
    const current = get().multiSelectedPageIds
    if (current.includes(id)) {
      set({ multiSelectedPageIds: current.filter((item) => item !== id) })
    } else {
      set({ multiSelectedPageIds: [...current, id] })
    }
  },
  clearSelection: () => set({ selectedPageId: null, selectedSectionId: null, multiSelectedPageIds: [], selectedElementIds: [] }),

  // Visual Canvas & Element Selection
  selectedElementIds: [],
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
  toggleElementSelection: (id, multi = false) => {
    const current = get().selectedElementIds
    if (!multi) {
      set({ selectedElementIds: [id] })
      return
    }
    if (current.includes(id)) {
      set({ selectedElementIds: current.filter((x) => x !== id) })
    } else {
      set({ selectedElementIds: [...current, id] })
    }
  },
  clearElementSelection: () => set({ selectedElementIds: [] }),
  activeWireframeTool: 'select',
  setActiveWireframeTool: (tool) => set({ activeWireframeTool: tool }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterType: 'all',
  setFilterType: (type) => set({ filterType: type }),
  filterGroupId: 'all',
  setFilterGroupId: (groupId) => set({ filterGroupId: groupId }),

  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  sidebarActiveTab: 'pages',
  setSidebarActiveTab: (tab) => set({ sidebarActiveTab: tab }),

  isPropertiesPanelOpen: true,
  togglePropertiesPanel: () => set((s) => ({ isPropertiesPanelOpen: !s.isPropertiesPanelOpen })),
  setPropertiesPanelOpen: (open) => set({ isPropertiesPanelOpen: open }),

  propertiesActiveTab: 'page',
  setPropertiesActiveTab: (tab) => set({ propertiesActiveTab: tab }),
  activeDesignTab: 'design',
  setActiveDesignTab: (tab) => set({ activeDesignTab: tab }),

  isGeneratorOpen: false,
  setGeneratorOpen: (open) => set({ isGeneratorOpen: open }),
  isTemplatePickerOpen: false,
  setTemplatePickerOpen: (open) => set({ isTemplatePickerOpen: open }),
  isDashboardOpen: false,
  setDashboardOpen: (open) => set({ isDashboardOpen: open }),
  isStyleGuideOpen: false,
  setStyleGuideOpen: (open) => set({ isStyleGuideOpen: open }),
  isExportOpen: false,
  setExportOpen: (open) => set({ isExportOpen: open }),
  isImportOpen: false,
  setImportOpen: (open) => set({ isImportOpen: open }),
  isOllamaSettingsOpen: false,
  setOllamaSettingsOpen: (open) => set({ isOllamaSettingsOpen: open }),
  isSectionLibraryOpen: false,
  setSectionLibraryOpen: (open) => set({ isSectionLibraryOpen: open }),
  sectionLibraryPageId: null,
  openSectionLibraryForPage: (pageId) =>
    set({
      isSectionLibraryOpen: true,
      sectionLibraryPageId: pageId,
    }),

  theme: getInitialTheme(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('opensitemap_theme', theme)
      } catch {}
    }
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('light', 'dark')

      if (theme === 'system') {
        const isDark = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
        root.classList.add(isDark ? 'dark' : 'light')
      } else {
        root.classList.add(theme)
      }
    }
    set({ theme })
  },

  ollamaEndpoint: safeGetStorage('opensitemap_ollama_endpoint', 'http://localhost:11434'),
  setOllamaEndpoint: (endpoint) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('opensitemap_ollama_endpoint', endpoint)
      } catch {}
    }
    set({ ollamaEndpoint: endpoint })
  },
  ollamaModel: safeGetStorage('opensitemap_ollama_model', 'llama3'),
  setOllamaModel: (model) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('opensitemap_ollama_model', model)
      } catch {}
    }
    set({ ollamaModel: model })
  },

  toasts: [],
  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => {
      get().removeToast(id)
    }, 4500)
  },
  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))
