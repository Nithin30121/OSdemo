import React, { useState, useEffect } from 'react'
import {
  X,
  Sparkles,
  Zap,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  HelpCircle,
  Plus,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { generateRuleBasedSitemap } from '../../services/generator/ruleBasedGenerator'
import { checkOllamaStatus, generateSitemapWithOllama } from '../../services/generator/ollamaService'
import { GeneratorPromptInput } from '../../types'

const WEBSITE_TYPES = [
  { value: 'saas', label: 'SaaS / Cloud Application' },
  { value: 'ecommerce', label: 'E-Commerce / Online Store' },
  { value: 'agency', label: 'Design Agency / Portfolio' },
  { value: 'corporate', label: 'Corporate / Business Services' },
  { value: 'blog', label: 'Blog / Editorial Publication' },
  { value: 'healthcare', label: 'Healthcare & Medical Clinic' },
  { value: 'realestate', label: 'Real Estate & Properties' },
  { value: 'education', label: 'Education / Online Courses' },
]

const FEATURE_CHECKBOXES = [
  { id: 'auth', label: 'User Authentication & Login' },
  { id: 'dashboard', label: 'Web App Dashboard & Analytics' },
  { id: 'pricing', label: 'Pricing Tiers & Plan Comparison' },
  { id: 'blog', label: 'Blog & Editorial Articles' },
  { id: 'faq', label: 'Help Center & FAQ Accordion' },
  { id: 'testimonials', label: 'Customer Reviews & Social Proof' },
  { id: 'contact', label: 'Contact & Lead Capture Form' },
  { id: 'legal', label: 'Privacy Policy & Terms' },
]

export const GeneratorModal: React.FC = () => {
  const isGeneratorOpen = useUIStore((s) => s.isGeneratorOpen)
  const setGeneratorOpen = useUIStore((s) => s.setGeneratorOpen)
  const ollamaEndpoint = useUIStore((s) => s.ollamaEndpoint)
  const ollamaModel = useUIStore((s) => s.ollamaModel)
  const addToast = useUIStore((s) => s.addToast)

  const project = useProjectStore((s) => s.project)
  const applyGeneratedSitemap = useProjectStore((s) => s.applyGeneratedSitemap)

  // Form State
  const [description, setDescription] = useState('An all-in-one developer analytics and performance observability platform.')
  const [targetAudience, setTargetAudience] = useState('Engineering teams, CTOs, and DevOps leads')
  const [websiteGoals, setWebsiteGoals] = useState('Drive signups for 14-day free trials and book enterprise sales demos')
  const [websiteType, setWebsiteType] = useState('saas')
  const [pageCount, setPageCount] = useState(6)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['auth', 'dashboard', 'pricing', 'faq'])
  const [generationMode, setGenerationMode] = useState<'rule' | 'ollama'>('rule')

  // Execution state
  const [isGenerating, setIsGenerating] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState<{ isAvailable: boolean; models: string[]; error?: string } | null>(null)
  const [checkingOllama, setCheckingOllama] = useState(false)
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false)
  const [pendingGenerated, setPendingGenerated] = useState<any>(null)

  useEffect(() => {
    if (isGeneratorOpen && generationMode === 'ollama') {
      setCheckingOllama(true)
      checkOllamaStatus(ollamaEndpoint)
        .then((res) => {
          setOllamaStatus(res)
          setCheckingOllama(false)
        })
        .catch(() => setCheckingOllama(false))
    }
  }, [isGeneratorOpen, generationMode, ollamaEndpoint])

  if (!isGeneratorOpen) return null

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    )
  }

  const handleGenerateClick = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setIsGenerating(true)

    const input: GeneratorPromptInput = {
      description,
      targetAudience,
      websiteGoals,
      websiteType,
      pageCount,
      requirements: selectedFeatures,
      useAI: generationMode === 'ollama',
      ollamaEndpoint,
      ollamaModel,
    }

    try {
      let resultData: any

      if (generationMode === 'ollama') {
        const { projectData, usedFallback, notice } = await generateSitemapWithOllama(
          input,
          ollamaEndpoint,
          ollamaModel,
        )
        resultData = projectData
        if (usedFallback && notice) {
          addToast({
            title: 'Fallback Applied',
            description: notice,
            type: 'warning',
          })
        }
      } else {
        resultData = generateRuleBasedSitemap(input)
      }

      setPendingGenerated(resultData)
      setIsGenerating(false)

      // If current project has pages, prompt for overwrite mode
      if (project && project.pages.length > 0) {
        setOverwriteConfirmOpen(true)
      } else {
        applyGeneratedSitemap(resultData, 'replace')
        addToast({
          title: 'Sitemap Generated!',
          description: `Generated ${resultData.pages.length} pages and ${resultData.sections.length} sections.`,
          type: 'success',
        })
        setGeneratorOpen(false)
      }
    } catch (err: any) {
      setIsGenerating(false)
      addToast({
        title: 'Generation Failed',
        description: err.message || 'Unknown error during generation',
        type: 'error',
      })
    }
  }

  const handleConfirmMerge = (mode: 'replace' | 'append') => {
    if (pendingGenerated) {
      applyGeneratedSitemap(pendingGenerated, mode)
      addToast({
        title: mode === 'replace' ? 'Sitemap Replaced' : 'Sitemap Appended',
        description: `Successfully added ${pendingGenerated.pages.length} pages to canvas.`,
        type: 'success',
      })
    }
    setOverwriteConfirmOpen(false)
    setGeneratorOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                AI Sitemap Generator
              </h2>
              <p className="text-xs text-slate-500">
                Describe your website concept to generate pages, sections, and wireframes
              </p>
            </div>
          </div>

          <button
            onClick={() => setGeneratorOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overwrite Confirmation Dialog */}
        {overwriteConfirmOpen ? (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-900 dark:text-amber-300 text-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Existing Sitemap Detected</h4>
                <p>
                  Your current project already contains{' '}
                  <span className="font-bold">{project?.pages.length} pages</span>. How would you like
                  to proceed with the generated sitemap?
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleConfirmMerge('replace')}
                className="w-full p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-left transition-colors"
              >
                <div className="font-semibold text-rose-700 dark:text-rose-300 text-xs">
                  Replace Current Sitemap
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Removes all existing pages and starts fresh with the {pendingGenerated?.pages.length}{' '}
                  new generated pages. (Can be undone via Cmd+Z).
                </div>
              </button>

              <button
                onClick={() => handleConfirmMerge('append')}
                className="w-full p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-left transition-colors"
              >
                <div className="font-semibold text-blue-700 dark:text-blue-300 text-xs">
                  Append to Existing Sitemap
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Keeps all existing pages and adds the new generated pages as a new branch on the
                  canvas.
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setOverwriteConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Main Generator Form */
          <form onSubmit={handleGenerateClick} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Generation Mode Selector */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setGenerationMode('rule')}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  generationMode === 'rule'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Offline Smart Engine (100% Local)</span>
              </button>

              <button
                type="button"
                onClick={() => setGenerationMode('ollama')}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  generationMode === 'ollama'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-purple-500" />
                <span>Local Ollama AI</span>
              </button>
            </div>

            {/* Ollama Status Alert if Ollama mode selected */}
            {generationMode === 'ollama' && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs">
                {checkingOllama ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Connecting to local Ollama at {ollamaEndpoint}...
                  </div>
                ) : ollamaStatus?.isAvailable ? (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Connected to Ollama (
                      {ollamaStatus.models.length} local models detected)
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      Model: {ollamaModel}
                    </span>
                  </div>
                ) : (
                  <div className="text-amber-600 dark:text-amber-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" /> Ollama not detected at {ollamaEndpoint}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      If Ollama isn't running, OpenSitemap will safely generate using the rule-based
                      offline engine with zero errors.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Website Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website or Product Description *
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Modern AI customer service platform with real-time analytics and omnichannel routing..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 resize-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Target Audience & Goals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. B2B Founders, Small Business Owners"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Website Goals
                </label>
                <input
                  type="text"
                  value={websiteGoals}
                  onChange={(e) => setWebsiteGoals(e.target.value)}
                  placeholder="e.g. Free trial registrations, lead bookings"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Website Type & Desired Page Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website Type
                </label>
                <select
                  value={websiteType}
                  onChange={(e) => setWebsiteType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                >
                  {WEBSITE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Desired Page Count: {pageCount} pages</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={16}
                  step={1}
                  value={pageCount}
                  onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                  <span>3 pages</span>
                  <span>8 pages</span>
                  <span>16 pages</span>
                </div>
              </div>
            </div>

            {/* Optional Features & Requirements */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Included Features & Architectural Requirements
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {FEATURE_CHECKBOXES.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat.id)
                  return (
                    <label
                      key={feat.id}
                      onClick={() => toggleFeature(feat.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-colors ${
                        isChecked
                          ? 'border-purple-300 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200 font-medium'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-purple-600 pointer-events-none"
                      />
                      <span className="truncate">{feat.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setGeneratorOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-medium shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Sitemap & Wireframes...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Sitemap
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
