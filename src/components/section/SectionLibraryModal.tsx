import React, { useState } from 'react'
import {
  X,
  Search,
  Globe,
  Plus,
  Sparkles,
  Layout,
  Navigation,
  FileText,
  Tag,
  HelpCircle,
  Mail,
  Table,
  CheckSquare,
  PieChart,
  Users,
  Megaphone,
  Columns,
  BarChart2,
  MessageSquare,
  LayoutGrid,
} from 'lucide-react'
import { SECTION_PRESETS, SectionPreset } from './presets'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { SectionType } from '../../types'

const ICON_MAP: Record<string, React.FC<any>> = {
  Navigation,
  Sparkles,
  LayoutGrid,
  BarChart2,
  FileText,
  MessageSquare,
  Tag,
  HelpCircle,
  Mail,
  Layout,
  Table,
  CheckSquare,
  PieChart,
  Users,
  Megaphone,
  Columns,
}

export const SectionLibraryModal: React.FC = () => {
  const isSectionLibraryOpen = useUIStore((s) => s.isSectionLibraryOpen)
  const setSectionLibraryOpen = useUIStore((s) => s.setSectionLibraryOpen)
  const sectionLibraryPageId = useUIStore((s) => s.sectionLibraryPageId)
  const project = useProjectStore((s) => s.project)
  const addSection = useProjectStore((s) => s.addSection)
  const attachGlobalSectionToPage = useProjectStore((s) => s.attachGlobalSectionToPage)
  const createGlobalSection = useProjectStore((s) => s.createGlobalSection)
  const addToast = useUIStore((s) => s.addToast)

  const [activeTab, setActiveTab] = useState<'presets' | 'global' | 'custom'>('presets')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Custom section state
  const [customName, setCustomName] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [customType, setCustomType] = useState<SectionType>('content')
  const [customColor, setCustomColor] = useState('#3b82f6')
  const [customIsGlobal, setCustomIsGlobal] = useState(false)

  if (!isSectionLibraryOpen || !sectionLibraryPageId || !project) return null

  const targetPage = project.pages.find((p) => p.id === sectionLibraryPageId)

  const categories = [
    'all',
    'Navigation',
    'Hero & Intro',
    'Content & Media',
    'Conversion & Sales',
    'Application UI',
    'Support & Contact',
  ]

  const filteredPresets = SECTION_PRESETS.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCat
  })

  const handleAddPreset = (preset: SectionPreset) => {
    addSection(sectionLibraryPageId, {
      name: preset.name,
      description: preset.description,
      type: preset.type,
      color: preset.color,
      isGlobal: false,
    })
    addToast({
      title: 'Section Added',
      description: `Added "${preset.name}" to ${targetPage?.name}`,
      type: 'success',
    })
    setSectionLibraryOpen(false)
  }

  const handleAttachGlobal = (globalSecId: string, globalName: string) => {
    attachGlobalSectionToPage(globalSecId, sectionLibraryPageId)
    addToast({
      title: 'Global Section Linked',
      description: `Linked "${globalName}" to ${targetPage?.name}`,
      type: 'success',
    })
    setSectionLibraryOpen(false)
  }

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim()) return

    if (customIsGlobal) {
      createGlobalSection(
        {
          name: customName.trim(),
          description: customDesc.trim(),
          type: customType,
          color: customColor,
        },
        sectionLibraryPageId,
      )
    } else {
      addSection(sectionLibraryPageId, {
        name: customName.trim(),
        description: customDesc.trim(),
        type: customType,
        color: customColor,
        isGlobal: false,
      })
    }

    addToast({
      title: 'Custom Section Created',
      description: `Added "${customName}" to ${targetPage?.name}`,
      type: 'success',
    })

    setCustomName('')
    setCustomDesc('')
    setSectionLibraryOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              Section Library
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add section to <span className="font-semibold text-slate-700 dark:text-slate-300">"{targetPage?.name}"</span>
            </p>
          </div>
          <button
            onClick={() => setSectionLibraryOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-5 border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Standard Presets ({SECTION_PRESETS.length})
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'global'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Global Sections ({project.globalSections.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Create Custom
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Search and Category Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search sections by name, purpose, or keywords..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of presets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {filteredPresets.map((preset) => {
                  const Icon = ICON_MAP[preset.iconName] || LayoutGrid
                  return (
                    <div
                      key={preset.type}
                      onClick={() => handleAddPreset(preset)}
                      className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                              style={{ backgroundColor: preset.color }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {preset.name}
                              </h4>
                              <span className="text-[10px] text-slate-400">{preset.category}</span>
                            </div>
                          </div>
                          <span className="opacity-0 group-hover:opacity-100 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-0.5 transition-opacity">
                            <Plus className="w-3.5 h-3.5" /> Add
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'global' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                  <Globe className="w-4 h-4" /> Global Shared Sections
                </p>
                Global sections synchronize across all pages. Editing a global navbar or footer will
                automatically update every page it is attached to.
              </div>

              {project.globalSections.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Globe className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No global sections created yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.globalSections.map((gsec) => (
                    <div
                      key={gsec.id}
                      onClick={() => handleAttachGlobal(gsec.id, gsec.name)}
                      className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                            {gsec.name}
                          </h4>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                            {gsec.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {gsec.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        <span>Attach to {targetPage?.name}</span>
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCreateCustom} className="max-w-lg mx-auto space-y-4 py-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Interactive Calculator, Product Comparison"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Section Type
                </label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as SectionType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                >
                  {SECTION_PRESETS.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.name}
                    </option>
                  ))}
                  <option value="custom">Custom Component</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description & Content Requirements
                </label>
                <textarea
                  rows={3}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Describe the layout, purpose, and key content blocks..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                    Save as Global Section
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Make this section available to attach to other pages
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={customIsGlobal}
                  onChange={(e) => setCustomIsGlobal(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSectionLibraryOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-medium text-white shadow-sm"
                >
                  Create & Add Section
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
