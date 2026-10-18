import React, { useState, useEffect } from 'react'
import {
  X,
  Layers,
  Plus,
  Copy,
  Trash2,
  FolderOpen,
  Calendar,
  Sparkles,
  ExternalLink,
  Edit2,
  Check,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import {
  listProjects,
  ProjectSummary,
  duplicateProject as dupProj,
  deleteProject as delProj,
} from '../../services/storage/projectStorage'
import { TEMPLATES } from '../../services/generator/templates'

export const ProjectDashboardModal: React.FC = () => {
  const isDashboardOpen = useUIStore((s) => s.isDashboardOpen)
  const setDashboardOpen = useUIStore((s) => s.setDashboardOpen)
  const currentProject = useProjectStore((s) => s.project)
  const loadProject = useProjectStore((s) => s.load)
  const loadTemplate = useProjectStore((s) => s.loadTemplate)
  const addPage = useProjectStore((s) => s.addPage)
  const addToast = useUIStore((s) => s.addToast)

  const [projectList, setProjectList] = useState<ProjectSummary[]>([])
  const [activeTab, setActiveTab] = useState<'recent' | 'templates'>('recent')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')

  const refreshList = async () => {
    const list = await listProjects()
    setProjectList(list)
  }

  useEffect(() => {
    if (isDashboardOpen) {
      refreshList()
    }
  }, [isDashboardOpen])

  if (!isDashboardOpen) return null

  const handleSelectProject = async (id: string) => {
    await loadProject(id)
    setDashboardOpen(false)
    addToast({
      title: 'Project Loaded',
      description: 'Switched active workspace project.',
      type: 'info',
    })
  }

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const duplicate = await dupProj(id)
    await refreshList()
    addToast({
      title: 'Project Duplicated',
      description: `Created copy "${duplicate.name}"`,
      type: 'success',
    })
  }

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete project "${name}"? This cannot be undone.`)) {
      await delProj(id)
      await refreshList()
      addToast({
        title: 'Project Deleted',
        description: `Removed "${name}" from local storage.`,
        type: 'info',
      })
    }
  }

  const handleApplyTemplate = (tmplId: string) => {
    loadTemplate(tmplId)
    setDashboardOpen(false)
    addToast({
      title: 'Template Loaded',
      description: 'Initialized project with template architecture.',
      type: 'success',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Project Dashboard
              </h2>
              <p className="text-xs text-slate-500">
                Manage local sitemaps or jumpstart a new project from proven templates
              </p>
            </div>
          </div>

          <button
            onClick={() => setDashboardOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center px-5 border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('recent')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'recent'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Recent Local Projects ({projectList.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Starter Architecture Templates ({TEMPLATES.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'recent' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  IndexedDB Storage
                </span>
                <button
                  onClick={() => handleApplyTemplate('blank')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Blank Sitemap
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projectList.map((p) => {
                  const isCurrent = p.id === currentProject?.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProject(p.id)}
                      className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate flex items-center gap-2">
                            {p.name}
                            {isCurrent && (
                              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                Active
                              </span>
                            )}
                          </h4>

                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                            <button
                              onClick={(e) => handleDuplicate(p.id, e)}
                              title="Duplicate"
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(p.id, p.name, e)}
                              title="Delete"
                              className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {p.description || 'Visual sitemap and architecture map'}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>{p.pageCount} pages</span>
                        <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl.id)}
                  className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                        {tmpl.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">{tmpl.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{tmpl.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {tmpl.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    <span>Use Template</span>
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
