import React, { useState } from 'react'
import {
  Globe,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Edit2,
  Unlink,
  Check,
  Tag,
} from 'lucide-react'
import { Section, SectionType } from '../../types'
import { useProjectStore } from '../../store/useProjectStore'

interface SectionCardProps {
  section: Section
  index: number
  totalSections: number
  onMoveUp: () => void
  onMoveDown: () => void
}

const SECTION_TYPE_OPTIONS: Array<{ value: SectionType; label: string }> = [
  { value: 'navbar', label: 'Navbar (Header)' },
  { value: 'hero', label: 'Hero Header' },
  { value: 'features', label: 'Features Grid' },
  { value: 'statistics', label: 'Statistics & Metrics' },
  { value: 'content', label: 'Content / Bento Box' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'pricing', label: 'Pricing Comparison' },
  { value: 'faq', label: 'FAQ Accordion' },
  { value: 'contact', label: 'Contact Form' },
  { value: 'footer', label: 'Site Footer' },
  { value: 'dashboard', label: 'Dashboard Cards' },
  { value: 'table', label: 'Data Table' },
  { value: 'form', label: 'Forms & Inputs' },
  { value: 'chart', label: 'Charts & Analytics' },
  { value: 'team', label: 'Team Grid' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'custom', label: 'Custom Section' },
]

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  index,
  totalSections,
  onMoveUp,
  onMoveDown,
}) => {
  const updateSection = useProjectStore((s) => s.updateSection)
  const deleteSection = useProjectStore((s) => s.deleteSection)
  const duplicateSection = useProjectStore((s) => s.duplicateSection)
  const detachGlobalSection = useProjectStore((s) => s.detachGlobalSection)
  const createGlobalSection = useProjectStore((s) => s.createGlobalSection)

  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(section.name)

  const handleSaveName = () => {
    if (nameVal.trim()) {
      updateSection(section.id, { name: nameVal.trim() })
    }
    setIsEditingName(false)
  }

  const handleMakeGlobal = () => {
    createGlobalSection({
      name: section.name,
      description: section.description,
      type: section.type,
      color: section.color,
      notes: section.notes,
    })
    updateSection(section.id, { isGlobal: true })
  }

  return (
    <div
      className={`rounded-xl border transition-all text-xs ${section.isGlobal
          ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
        }`}
    >
      {/* Top Main Bar */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Section index number badge */}
          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>

          {/* Section color indicator */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: section.color || '#3b82f6' }}
          />

          {/* Name & Type */}
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="px-1.5 py-0.5 rounded border border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-full text-xs"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="cursor-pointer group/title flex items-center gap-1.5"
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {section.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditingName(true)
                  }}
                  className="opacity-0 group-hover/title:opacity-100 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                {section.type}
              </span>
              {section.isGlobal && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium bg-blue-100/60 dark:bg-blue-900/40 px-1.5 py-0.2 rounded-full">
                  <Globe className="w-2.5 h-2.5" /> Global Synced
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move Up"
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 disabled:opacity-20"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalSections - 1}
            title="Move Down"
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 disabled:opacity-20"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => duplicateSection(section.id)}
            title="Duplicate Section"
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteSection(section.id)}
            title="Delete Section"
            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Details & Form */}
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-2.5">
          {/* Section Type Selector */}
          <div>
            <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">
              Section Type
            </label>
            <select
              value={section.type}
              onChange={(e) => updateSection(section.id, { type: e.target.value as SectionType })}
              className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs"
            >
              {SECTION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">
              Description & Content Goals
            </label>
            <textarea
              value={section.description}
              onChange={(e) => updateSection(section.id, { description: e.target.value })}
              placeholder="What information or layout is in this section?"
              rows={2}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs resize-none"
            />
          </div>

          {/* Section Notes */}
          <div>
            <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">
              Design Notes / Guidelines
            </label>
            <input
              type="text"
              value={section.notes || ''}
              onChange={(e) => updateSection(section.id, { notes: e.target.value })}
              placeholder="e.g. 3-column card layout, sticky scroll"
              className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs"
            />
          </div>

          {/* Global Section Controls */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            {section.isGlobal ? (
              <button
                onClick={() => detachGlobalSection(section.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                <Unlink className="w-3 h-3 text-amber-500" />
                Detach from Global
              </button>
            ) : (
              <button
                onClick={handleMakeGlobal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-medium transition-colors"
              >
                <Globe className="w-3 h-3" />
                Make Global Section
              </button>
            )}

            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-600 text-[11px]"
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
