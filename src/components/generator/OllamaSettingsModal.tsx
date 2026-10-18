import React, { useState } from 'react'
import {
  X,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'
import { checkOllamaStatus } from '../../services/generator/ollamaService'

export const OllamaSettingsModal: React.FC = () => {
  const isOllamaSettingsOpen = useUIStore((s) => s.isOllamaSettingsOpen)
  const setOllamaSettingsOpen = useUIStore((s) => s.setOllamaSettingsOpen)
  const ollamaEndpoint = useUIStore((s) => s.ollamaEndpoint)
  const setOllamaEndpoint = useUIStore((s) => s.setOllamaEndpoint)
  const ollamaModel = useUIStore((s) => s.ollamaModel)
  const setOllamaModel = useUIStore((s) => s.setOllamaModel)
  const addToast = useUIStore((s) => s.addToast)

  const [endpointInput, setEndpointInput] = useState(ollamaEndpoint)
  const [modelInput, setModelInput] = useState(ollamaModel)
  const [isChecking, setIsChecking] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    models?: string[]
  } | null>(null)

  if (!isOllamaSettingsOpen) return null

  const handleTestConnection = async () => {
    setIsChecking(true)
    setTestResult(null)

    const status = await checkOllamaStatus(endpointInput)
    setIsChecking(false)

    if (status.isAvailable) {
      setTestResult({
        success: true,
        message: `Successfully connected to Ollama! Found ${status.models.length} model(s).`,
        models: status.models,
      })
      if (status.models.length > 0 && !status.models.includes(modelInput)) {
        setModelInput(status.models[0])
      }
    } else {
      setTestResult({
        success: false,
        message: status.error || 'Connection failed',
      })
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setOllamaEndpoint(endpointInput)
    setOllamaModel(modelInput)
    addToast({
      title: 'Ollama Settings Saved',
      description: `Targeting ${endpointInput} with model ${modelInput}`,
      type: 'success',
    })
    setOllamaSettingsOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Local Ollama AI Configuration
              </h2>
              <p className="text-[11px] text-slate-500">
                Configure your free, private, offline local LLM server
              </p>
            </div>
          </div>

          <button
            onClick={() => setOllamaSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ollama Server Endpoint
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isChecking}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 disabled:opacity-50"
              >
                {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Test
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Model Name
            </label>
            {testResult?.models && testResult.models.length > 0 ? (
              <select
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              >
                {testResult.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="llama3, mistral, gemma2, qwen2.5"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
            )}
            <p className="text-[10px] text-slate-400 mt-1">
              Recommended models: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">llama3</code>,{' '}
              <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">mistral</code>, or{' '}
              <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">qwen2.5</code>
            </p>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                testResult.success
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                  : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium mb-1">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                {testResult.message}
              </div>
              {testResult.models && testResult.models.length > 0 && (
                <div className="text-[11px] opacity-80 pl-5">
                  Available models: {testResult.models.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Quick Setup Instructions */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-blue-500" /> How to run Ollama locally:
            </span>
            <p className="text-[11px] text-slate-500">
              1. Download and install Ollama from{' '}
              <a
                href="https://ollama.ai"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                ollama.ai <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
            <p className="text-[11px] text-slate-500">
              2. Open your terminal and run:{' '}
              <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">
                ollama run llama3
              </code>
            </p>
            <p className="text-[11px] text-slate-400 italic">
              Note: Local AI is 100% optional. The rule-based generator works without any installation.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOllamaSettingsOpen(false)}
              className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
