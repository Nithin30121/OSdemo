import React from 'react'
import {
  Printer,
  ArrowLeft,
  Download,
  Share2,
  FileText,
  Globe,
  Layers,
  CheckCircle,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { Page } from '../../types'
import { downloadProjectMarkdown } from '../../services/export/markdownExport'

export const PrintPreviewModal: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const setActiveView = useUIStore((s) => s.setActiveView)

  if (!project) return null

  const handlePrint = () => {
    window.print()
  }

  // Children mapping for tree rendering
  const childrenMap = new Map<string | null, Page[]>()
  project.pages.forEach((p) => {
    const list = childrenMap.get(p.parentId) || []
    list.push(p)
    childrenMap.set(p.parentId, list)
  })

  const renderPrintHierarchy = (parentId: string | null, depth = 0): React.ReactNode => {
    const children = childrenMap.get(parentId) || []
    if (children.length === 0) return null

    return (
      <ul className={`space-y-1.5 ${depth > 0 ? 'ml-6 pl-3 border-l-2 border-slate-200' : ''}`}>
        {children.map((page) => (
          <li key={page.id} className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{page.name}</span>
              <span className="font-mono text-slate-500 text-[11px]">{page.slug}</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {page.type}
              </span>
            </div>
            {page.description && (
              <p className="text-[11px] text-slate-600 mt-0.5 pl-1">{page.description}</p>
            )}
            {renderPrintHierarchy(page.id, depth + 1)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 flex flex-col items-center">
      {/* Non-printed Toolbar */}
      <div className="no-print w-full max-w-4xl flex items-center justify-between mb-6 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <button
          onClick={() => setActiveView('canvas')}
          className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sitemap Canvas
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadProjectMarkdown(project)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download .md
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="w-full max-w-4xl bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 space-y-8 font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600">
              OpenSitemap Specification
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {project.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              {project.description || 'Visual architecture and sitemap specification report.'}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <div>
              <span className="font-semibold text-slate-700">Date:</span>{' '}
              {new Date(project.updatedAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Total Pages:</span>{' '}
              {project.pages.length}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Total Sections:</span>{' '}
              {project.sections.length}
            </div>
          </div>
        </div>

        {/* Section 1: Sitemap Hierarchy Tree */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <Layers className="w-4 h-4 text-blue-600" />
            1. Sitemap Navigation Hierarchy
          </h2>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            {renderPrintHierarchy(null, 0)}
          </div>
        </section>

        {/* Section 2: Detailed Page Breakdown */}
        <section className="space-y-6">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            2. Detailed Page & Section Breakdown
          </h2>

          <div className="space-y-6">
            {project.pages.map((page, pIdx) => {
              const pageSections = project.sections
                .filter((s) => s.pageId === page.id)
                .sort((a, b) => a.position - b.position)

              return (
                <div key={page.id} className="p-5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{pIdx + 1}. {page.name}</span>
                        <span className="font-mono text-xs text-slate-500 font-normal">
                          ({page.slug})
                        </span>
                      </h3>
                      {page.description && (
                        <p className="text-xs text-slate-600 mt-0.5">{page.description}</p>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {page.type}
                    </span>
                  </div>

                  {page.notes && (
                    <div className="text-[11px] text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-200">
                      Note: {page.notes}
                    </div>
                  )}

                  {/* Sections Table */}
                  <div className="mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Sections ({pageSections.length})
                    </span>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden text-xs">
                      {pageSections.map((sec, sIdx) => (
                        <div
                          key={sec.id}
                          className="p-2.5 flex items-start justify-between bg-white hover:bg-slate-50"
                        >
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span>
                                {sIdx + 1}. {sec.name}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 uppercase">
                                [{sec.type}]
                              </span>
                              {sec.isGlobal && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded">
                                  Global Synced
                                </span>
                              )}
                            </div>
                            {sec.description && (
                              <p className="text-[11px] text-slate-500">{sec.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 3: Global Reusable Components */}
        {project.globalSections.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              3. Shared Global Components
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.globalSections.map((gsec) => (
                <div key={gsec.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    {gsec.name} ({gsec.type})
                  </div>
                  <p className="text-[11px] text-slate-600">{gsec.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          Generated automatically by OpenSitemap • Free and Open-Source Architectural Platform
        </div>
      </div>
    </div>
  )
}
