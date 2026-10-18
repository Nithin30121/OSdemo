import React, { useState } from 'react'
import {
  X,
  Download,
  FileCode,
  FileText,
  Image,
  Copy,
  Check,
  Printer,
  Sparkles,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { exportProjectToJson } from '../../services/export/jsonExport'
import { generateProjectMarkdown, downloadProjectMarkdown } from '../../services/export/markdownExport'
import { generateSitemapSvg, downloadSitemapSvg } from '../../services/export/svgExport'

export const ExportModal: React.FC = () => {
  const isExportOpen = useUIStore((s) => s.isExportOpen)
  const setExportOpen = useUIStore((s) => s.setExportOpen)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const project = useProjectStore((s) => s.project)
  const addToast = useUIStore((s) => s.addToast)

  const [activeTab, setActiveTab] = useState<'svg' | 'json' | 'markdown'>('svg')
  const [copied, setCopied] = useState(false)

  if (!isExportOpen || !project) return null

  const handleCopyMarkdown = async () => {
    const md = generateProjectMarkdown(project)
    await navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast({
      title: 'Copied to Clipboard',
      description: 'Markdown sitemap specification copied.',
      type: 'success',
    })
  }

  const handleCopyJson = async () => {
    const jsonStr = JSON.stringify(project, null, 2)
    await navigator.clipboard.writeText(jsonStr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast({
      title: 'Copied to Clipboard',
      description: 'Project JSON data copied.',
      type: 'success',
    })
  }

  const handlePrintView = () => {
    setExportOpen(false)
    setActiveView('print')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Export Project
              </h2>
              <p className="text-[11px] text-slate-500">
                Export to vector SVG, structured Markdown outline, or full JSON
              </p>
            </div>
          </div>

          <button
            onClick={() => setExportOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('svg')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'svg'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            Vector SVG
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'markdown'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Markdown Spec
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'json'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Project JSON
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'svg' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  High-Resolution Vector Graphics (.svg)
                </span>
                <p className="text-slate-500">
                  Exports your complete visual sitemap with cards, connecting arrows, and section
                  tags. Ready to import directly into Figma, Adobe Illustrator, Miro, or presentations
                  at infinite resolution.
                </p>
                <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-400">
                  <span>• {project.pages.length} Pages</span>
                  <span>• {project.edges.length} Connecting Lines</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => downloadSitemapSvg(project)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download SVG File
                </button>
              </div>
            </div>
          )}

          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Structured Markdown Architecture Spec (.md)
                </span>
                <p className="text-slate-500">
                  Clean textual hierarchy containing every page, URL route, internal notes, and detailed
                  breakdown of page sections. Perfect for GitHub documentation, developer briefs, or Notion
                  wikis.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Markdown'}
                </button>
                <button
                  onClick={() => downloadProjectMarkdown(project)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Markdown
                </button>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Complete Project Backup (.json)
                </span>
                <p className="text-slate-500">
                  Full fidelity backup of all pages, sections, coordinates, global sections, and
                  wireframe component data. Can be re-imported into OpenSitemap anytime on any machine.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCopyJson}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
                <button
                  onClick={() => exportProjectToJson(project)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Project JSON
                </button>
              </div>
            </div>
          )}

          {/* Quick Print Preview Link */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need a printable executive document?</span>
            <button
              onClick={handlePrintView}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> Open Print View
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
