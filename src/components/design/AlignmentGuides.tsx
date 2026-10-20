import React from 'react'

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical'
  position: number // Y for horizontal, X for vertical
  start?: number
  end?: number
  label?: string
}

interface AlignmentGuidesProps {
  guides: AlignmentGuide[]
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ guides }) => {
  if (guides.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {guides.map((g, idx) => {
        if (g.type === 'vertical') {
          return (
            <div
              key={`vg_${idx}_${g.position}`}
              style={{ left: `${g.position}px` }}
              className="absolute top-0 bottom-0 w-px bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.6)]"
            >
              {g.label && (
                <span className="absolute top-2 left-1.5 px-1 py-0.5 rounded bg-rose-600 text-white text-[9px] font-mono">
                  {g.label}
                </span>
              )}
            </div>
          )
        }

        return (
          <div
            key={`hg_${idx}_${g.position}`}
            style={{ top: `${g.position}px` }}
            className="absolute left-0 right-0 h-px bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.6)]"
          >
            {g.label && (
              <span className="absolute left-2 -top-4 px-1 py-0.5 rounded bg-rose-600 text-white text-[9px] font-mono">
                {g.label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
