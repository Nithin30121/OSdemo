import React from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts)
  const removeToast = useUIStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info
        let colorClass =
          'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-100'

        if (toast.type === 'success') {
          Icon = CheckCircle2
          colorClass =
            'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100'
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle
          colorClass =
            'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100'
        } else if (toast.type === 'error') {
          Icon = AlertCircle
          colorClass =
            'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100'
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg backdrop-blur flex items-start gap-2.5 text-xs animate-in slide-in-from-bottom-2 duration-150 ${colorClass}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold block">{toast.title}</span>
              {toast.description && (
                <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 opacity-60 hover:opacity-100 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
