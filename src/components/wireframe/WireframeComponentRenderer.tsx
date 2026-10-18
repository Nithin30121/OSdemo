import React, { useState } from 'react'
import {
  WireframeComponent,
  SectionType,
  ViewportMode,
} from '../../types'
import {
  Layers,
  ChevronDown,
  Globe,
  MoveUp,
  MoveDown,
  Trash2,
  Edit3,
  Check,
} from 'lucide-react'

interface WireframeComponentRendererProps {
  component: WireframeComponent
  isGlobal?: boolean
  showLabels?: boolean
  spacing?: 'compact' | 'comfortable' | 'spacious'
  viewport?: ViewportMode
  onUpdateProps?: (newProps: Partial<WireframeComponent['props']>) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onDelete?: () => void
}

export const WireframeComponentRenderer: React.FC<WireframeComponentRendererProps> = ({
  component,
  isGlobal = false,
  showLabels = true,
  spacing = 'comfortable',
  viewport = 'desktop',
  onUpdateProps,
  onMoveUp,
  onMoveDown,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [headline, setHeadline] = useState(component.props.headline || component.name)
  const [subtext, setSubtext] = useState(component.props.subtext || '')

  const handleSaveText = () => {
    if (onUpdateProps) {
      onUpdateProps({ headline, subtext })
    }
    setIsEditing(false)
  }

  const paddingClass =
    spacing === 'compact' ? 'py-4 px-4' : spacing === 'spacious' ? 'py-10 px-8' : 'py-6 px-6'

  // Render Wireframe Component by Type
  const renderComponentBody = () => {
    switch (component.type) {
      case 'navbar':
        return (
          <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-700 py-3 px-4 bg-slate-100/70 dark:bg-slate-800/60 rounded-t-lg">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 dark:text-slate-200">
                <div className="w-5 h-5 rounded bg-slate-400 dark:bg-slate-600" />
                <span>{headline || 'BrandLogo'}</span>
              </div>
              {viewport !== 'mobile' && (
                <div className="hidden sm:flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="hover:underline">Product</span>
                  <span className="hover:underline">Features</span>
                  <span className="hover:underline">Pricing</span>
                  <span className="hover:underline">Resources</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium">
                {component.props.buttonText || 'Sign Up'}
              </div>
            </div>
          </div>
        )

      case 'hero':
        return (
          <div className={`${paddingClass} text-center space-y-4 max-w-2xl mx-auto`}>
            {component.props.badgeText && (
              <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {component.props.badgeText}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {headline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              {subtext || 'The fastest visual platform for digital strategy and information architecture.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow">
                {component.props.buttonText || 'Get Started Free'}
              </div>
              {component.props.secondaryButtonText && (
                <div className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {component.props.secondaryButtonText}
                </div>
              )}
            </div>

            {/* Wireframe Hero Media Placeholder Box */}
            <div className="mt-6 aspect-[16/8] w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/40 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-full h-px bg-slate-900 rotate-12" />
                <div className="w-full h-px bg-slate-900 -rotate-12" />
              </div>
              <span className="text-xs font-mono text-slate-400">
                [ Hero Mockup / Dashboard Preview ]
              </span>
            </div>
          </div>
        )

      case 'features':
        return (
          <div className={`${paddingClass} space-y-5`}>
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{headline}</h3>
              <p className="text-xs text-slate-500">{subtext}</p>
            </div>
            <div
              className={`grid gap-4 ${
                viewport === 'mobile'
                  ? 'grid-cols-1'
                  : viewport === 'tablet'
                  ? 'grid-cols-2'
                  : 'grid-cols-3'
              }`}
            >
              {(component.props.placeholderItems || [
                { title: 'Feature One', desc: 'Detailed explanation of platform functionality.' },
                { title: 'Feature Two', desc: 'Seamless integration with existing developer workflows.' },
                { title: 'Feature Three', desc: 'Real-time synchronization and high-availability backup.' },
              ]).map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-300 dark:bg-slate-700" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'statistics':
        return (
          <div className={`${paddingClass} bg-slate-50 dark:bg-slate-800/30 rounded-xl`}>
            <div
              className={`grid gap-4 text-center ${
                viewport === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
              }`}
            >
              {(component.props.placeholderItems || [
                { title: '99.9%', desc: 'Uptime SLA' },
                { title: '10M+', desc: 'API Calls / Day' },
                { title: '4.9/5', desc: 'Customer Rating' },
                { title: '<50ms', desc: 'Global Latency' },
              ]).map((stat, idx) => (
                <div key={idx} className="p-2 space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                    {stat.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className={`${paddingClass} space-y-6`}>
            <div className="text-center max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{headline}</h3>
              <p className="text-xs text-slate-500">{subtext}</p>
            </div>
            <div
              className={`grid gap-4 ${
                viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'
              }`}
            >
              {[
                { name: 'Starter', price: '$19', popular: false },
                { name: 'Professional', price: '$49', popular: true },
                { name: 'Enterprise', price: '$199', popular: false },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-3 relative ${
                    tier.popular
                      ? 'border-slate-800 dark:border-slate-200 bg-slate-100/50 dark:bg-slate-800/80 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-bold">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{tier.name}</h4>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                      {tier.price} <span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">✓ Full sitemap canvas</div>
                    <div className="flex items-center gap-1.5">✓ Export SVG & Markdown</div>
                    <div className="flex items-center gap-1.5">✓ Unlimited pages & wireframes</div>
                  </div>
                  <div className="w-full py-1.5 rounded-lg text-center text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                    Choose {tier.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'faq':
        return (
          <div className={`${paddingClass} max-w-xl mx-auto space-y-4`}>
            <div className="text-center space-y-1 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{headline}</h3>
              <p className="text-xs text-slate-500">{subtext}</p>
            </div>
            <div className="space-y-2">
              {[
                { q: 'How does the offline rule generator work?', a: 'It plans pages, slugs, and section hierarchies automatically without requiring an active internet connection.' },
                { q: 'Can I link sections across multiple pages?', a: 'Yes! Global sections synchronize whenever modified on any page.' },
                { q: 'Are projects saved automatically?', a: 'All project data is persisted safely in browser IndexedDB.' },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'contact':
        return (
          <div className={`${paddingClass} max-w-lg mx-auto space-y-4`}>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{headline}</h3>
              <p className="text-xs text-slate-500">{subtext}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-slate-200 dark:bg-slate-700 px-2 flex items-center text-[11px] text-slate-400">
                  Full Name
                </div>
                <div className="h-8 rounded bg-slate-200 dark:bg-slate-700 px-2 flex items-center text-[11px] text-slate-400">
                  Email Address
                </div>
              </div>
              <div className="h-16 rounded bg-slate-200 dark:bg-slate-700 p-2 text-[11px] text-slate-400">
                Message & inquiry details...
              </div>
              <div className="w-full py-2 rounded-lg text-center text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                {component.props.buttonText || 'Send Inquiry'}
              </div>
            </div>
          </div>
        )

      case 'footer':
        return (
          <div className="border-t border-slate-300 dark:border-slate-700 py-6 px-6 bg-slate-100 dark:bg-slate-800/80 rounded-b-lg space-y-4 text-xs">
            <div
              className={`grid gap-4 ${
                viewport === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
              }`}
            >
              <div className="space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {headline || 'Brand'}
                </span>
                <p className="text-[11px] text-slate-500">
                  Open-source visual sitemaps and wireframe architecture.
                </p>
              </div>
              <div className="space-y-1 text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Product</span>
                <div>Overview</div>
                <div>Features</div>
                <div>Pricing</div>
              </div>
              <div className="space-y-1 text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Resources</span>
                <div>Documentation</div>
                <div>API Reference</div>
                <div>Community</div>
              </div>
              <div className="space-y-1 text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Legal</span>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Security</div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 text-center">
              © {new Date().getFullYear()} {headline || 'Company Inc'}. All rights reserved.
            </div>
          </div>
        )

      default:
        // Generic content / card / dashboard fallback
        return (
          <div className={`${paddingClass} space-y-3`}>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{headline}</h3>
              <p className="text-xs text-slate-500">{subtext}</p>
            </div>
            <div className="aspect-[16/6] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center text-xs text-slate-400 font-mono">
              [ {component.name} — {component.type.toUpperCase()} COMPONENT ]
            </div>
          </div>
        )
    }
  }

  return (
    <div className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Top Section Tag / Controls Overlay */}
      {showLabels && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 rounded-t-xl select-none">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="uppercase text-slate-700 dark:text-slate-300">{component.type}</span>
            <span>•</span>
            <span className="font-normal truncate max-w-[150px]">{component.name}</span>
            {isGlobal && (
              <span className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-1 rounded">
                <Globe className="w-2.5 h-2.5" /> Global
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isEditing ? (
              <button
                onClick={handleSaveText}
                className="px-2 py-0.5 rounded bg-emerald-600 text-white font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                title="Edit Placeholder Text"
                className="p-1 hover:text-slate-900 dark:hover:text-slate-100 rounded"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}

            {onMoveUp && (
              <button
                onClick={onMoveUp}
                title="Move Section Up"
                className="p-1 hover:text-slate-900 dark:hover:text-slate-100 rounded"
              >
                <MoveUp className="w-3 h-3" />
              </button>
            )}

            {onMoveDown && (
              <button
                onClick={onMoveDown}
                title="Move Section Down"
                className="p-1 hover:text-slate-900 dark:hover:text-slate-100 rounded"
              >
                <MoveDown className="w-3 h-3" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                title="Delete Section"
                className="p-1 hover:text-rose-600 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inline Text Edit Bar */}
      {isEditing && (
        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-900 space-y-2 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
              Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-2 py-1 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
              Subtext
            </label>
            <input
              type="text"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              className="w-full px-2 py-1 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      {/* Render Component Layout */}
      {renderComponentBody()}
    </div>
  )
}
