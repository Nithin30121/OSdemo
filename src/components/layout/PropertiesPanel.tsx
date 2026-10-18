import React from 'react'
import {
  X,
  FileText,
  Layers,
  Globe,
  Settings,
  Plus,
  Trash2,
  FolderTree,
  ChevronRight,
  Info,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { PageEditor } from '../page/PageEditor'
import { SectionList } from '../section/SectionList'

export const PropertiesPanel: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const isPropertiesPanelOpen = useUIStore((s) => s.isPropertiesPanelOpen)
  const setPropertiesPanelOpen = useUIStore((s) => s.setPropertiesPanelOpen)
  const selectedPageId = useUIStore((s) => s.selectedPageId)
  const setSelectedPageId = useUIStore((s) => s.setSelectedPageId)
  const propertiesActiveTab = useUIStore((s) => s.propertiesActiveTab)
  const setPropertiesActiveTab = useUIStore((s) => s.setPropertiesActiveTab)

  const updateGlobalSection = useProjectStore((s) => s.updateGlobalSection)
  const createGlobalSection = useProjectStore((s) => s.createGlobalSection)
  const addGroup = useProjectStore((s) => s.addGroup)
  const deleteGroup = useProjectStore((s) => s.deleteGroup)

  if (!isPropertiesPanelOpen || !project) return null

  const selectedPage = project.pages.find((p) => p.id === selectedPageId)

  return (
    <aside className="w-80 sm:w-96 h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-20 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {selectedPage ? (
            <>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedPage.color || '#3b82f6' }}
              />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                {selectedPage.name}
              </h3>
            </>
          ) : (
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              Project Properties
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1">
          {selectedPage && (
            <button
              onClick={() => setSelectedPageId(null)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded"
            >
              Deselect
            </button>
          )}
          <button
            onClick={() => setPropertiesPanelOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs if page is selected */}
      {selectedPage ? (
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => setPropertiesActiveTab('page')}
            className={`py-2.5 border-b-2 mr-4 transition-colors flex items-center gap-1.5 ${
              propertiesActiveTab === 'page'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Page Settings
          </button>
          <button
            onClick={() => setPropertiesActiveTab('sections')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              propertiesActiveTab === 'sections'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Sections (
            {project.sections.filter((s) => s.pageId === selectedPage.id).length})
          </button>
        </div>
      ) : null}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedPage ? (
          propertiesActiveTab === 'page' ? (
            <PageEditor page={selectedPage} />
          ) : (
            <SectionList page={selectedPage} />
          )
        ) : (
          /* Project Overview when no page is selected */
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Pages
                </span>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {project.pages.length}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Sections
                </span>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {project.sections.length}
                </p>
              </div>
            </div>

            {/* Global Sections Manager */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  Global Sections ({project.globalSections.length})
                </h4>
                <button
                  onClick={() => {
                    const name = prompt('Enter new global section name:')
                    if (name) {
                      createGlobalSection({
                        name,
                        description: 'Site-wide synchronized section',
                        type: 'navbar',
                        color: '#3b82f6',
                      })
                    }
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              {project.globalSections.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No global sections defined yet.</p>
              ) : (
                <div className="space-y-2">
                  {project.globalSections.map((gsec) => {
                    const linkedCount = project.sections.filter(
                      (s) => s.globalSectionId === gsec.id,
                    ).length

                    return (
                      <div
                        key={gsec.id}
                        className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-blue-500" />
                            {gsec.name}
                          </span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full font-medium">
                            {linkedCount} {linkedCount === 1 ? 'page' : 'pages'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {gsec.description}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Page Groups */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-purple-500" />
                  Page Groups ({project.groups.length})
                </h4>
                <button
                  onClick={() => {
                    const name = prompt('Enter new group name:')
                    if (name) addGroup(name)
                  }}
                  className="text-[11px] text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Group
                </button>
              </div>

              {project.groups.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No page groups created yet.</p>
              ) : (
                <div className="space-y-2">
                  {project.groups.map((group) => {
                    const groupPages = project.pages.filter((p) => p.groupId === group.id)
                    return (
                      <div
                        key={group.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-md"
                            style={{ backgroundColor: group.color }}
                          />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {group.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {groupPages.length} {groupPages.length === 1 ? 'page' : 'pages'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteGroup(group.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
