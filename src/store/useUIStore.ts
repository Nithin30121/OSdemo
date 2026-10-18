import { create } from 'zustand'
import { PageType } from '../types'

export type ActiveView = 'canvas' | 'wireframe' | 'print'
export type ThemeMode = 'light' | 'dark' | 'system'

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
  isPropertiesPanelOpen: boolean
  togglePropertiesPanel: () => void
  setPropertiesPanelOpen: (open: boolean) => void
  propertiesActiveTab: 'page' | 'sections' | 'wireframe'
  setPropertiesActiveTab: (tab: 'page' | 'sections' | 'wireframe') => void

  // Modals
  isGeneratorOpen: boolean
  setGeneratorOpen: (open: boolean) => void
  isTemplatePickerOpen: boolean
  setTemplatePickerOpen: (open: boolean) => void
  isDashboardOpen: boolean
  setDashboardOpen: (open: boolean) => void
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

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem('opensitemap_theme') as ThemeMode
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'dark'
}

export const useUIStore = create<UIStoreState>((set, get) => ({
  activeView: 'canvas',
  setActiveView: (view) => set({ activeView: view }),

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
  clearSelection: () => set({ selectedPageId: null, selectedSectionId: null, multiSelectedPageIds: [] }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterType: 'all',
  setFilterType: (type) => set({ filterType: type }),
  filterGroupId: 'all',
  setFilterGroupId: (groupId) => set({ filterGroupId: groupId }),

  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  isPropertiesPanelOpen: true,
  togglePropertiesPanel: () => set((s) => ({ isPropertiesPanelOpen: !s.isPropertiesPanelOpen })),
  setPropertiesPanelOpen: (open) => set({ isPropertiesPanelOpen: open }),

  propertiesActiveTab: 'page',
  setPropertiesActiveTab: (tab) => set({ propertiesActiveTab: tab }),

  isGeneratorOpen: false,
  setGeneratorOpen: (open) => set({ isGeneratorOpen: open }),
  isTemplatePickerOpen: false,
  setTemplatePickerOpen: (open) => set({ isTemplatePickerOpen: open }),
  isDashboardOpen: false,
  setDashboardOpen: (open) => set({ isDashboardOpen: open }),
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
    localStorage.setItem('opensitemap_theme', theme)
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(isDark ? 'dark' : 'light')
    } else {
      root.classList.add(theme)
    }
    set({ theme })
  },

  ollamaEndpoint: localStorage.getItem('opensitemap_ollama_endpoint') || 'http://localhost:11434',
  setOllamaEndpoint: (endpoint) => {
    localStorage.setItem('opensitemap_ollama_endpoint', endpoint)
    set({ ollamaEndpoint: endpoint })
  },
  ollamaModel: localStorage.getItem('opensitemap_ollama_model') || 'llama3',
  setOllamaModel: (model) => {
    localStorage.setItem('opensitemap_ollama_model', model)
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
