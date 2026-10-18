import React, { useState, useRef } from 'react'
import {
  X,
  Upload,
  FileCode,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { importProjectFromJsonFile } from '../../services/export/jsonExport'

export const ImportModal: React.FC = () => {
  const isImportOpen = useUIStore((s) => s.isImportOpen)
  const setImportOpen = useUIStore((s) => s.setImportOpen)
  const replaceEntireProject = useProjectStore((s) => s.replaceEntireProject)
  const addToast = useUIStore((s) => s.addToast)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isImportOpen) return null

  const handleFileProcess = async (file: File) => {
    setIsLoading(true)
    setErrorMessage(null)

    const res = await importProjectFromJsonFile(file)
    setIsLoading(false)

    if (res.success && res.project) {
      replaceEntireProject(res.project)
      addToast({
        title: 'Project Imported Successfully',
        description: `Imported "${res.project.name}" with ${res.project.pages.length} pages.`,
        type: 'success',
      })
      setImportOpen(false)
    } else {
      setErrorMessage(res.error || 'Failed to import project file.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Import Project
              </h2>
              <p className="text-[11px] text-slate-500">
                Restore a project from an OpenSitemap JSON export
              </p>
            </div>
          </div>

          <button
            onClick={() => setImportOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-blue-500 transition-all cursor-pointer text-center space-y-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputChange}
              accept=".json,application/json"
              className="hidden"
            />

            {isLoading ? (
              <div className="py-4 flex flex-col items-center gap-2 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs">Validating project structure...</span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Click to browse or drag and drop your JSON file
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports all OpenSitemap exports with full Zod validation
                  </p>
                </div>
              </>
            )}
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Import Error</span>
                <p className="text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setImportOpen(false)}
              className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
