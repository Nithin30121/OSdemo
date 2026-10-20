import React from 'react'
import { useStudioStore } from '../../store/useStudioStore'

interface StudioSmartGuidesOverlayProps {
  zoom: number
}

export const StudioSmartGuidesOverlay: React.FC<StudioSmartGuidesOverlayProps> = ({ zoom }) => {
  const smartGuides = useStudioStore((s) => s.smartGuides)

  if (!smartGuides || (smartGuides.lines.length === 0 && smartGuides.spacings.length === 0)) {
    return null
  }

  const { lines, spacings } = smartGuides
  const strokeW = Math.max(1, 1.25 / zoom)
  const tickSize = Math.max(3, 4 / zoom)

  return (
    <div
      id="studio-smart-guides-overlay"
      className="absolute inset-0 pointer-events-none select-none z-20"
      style={{ overflow: 'visible' }}
    >
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter id="guide-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FF4DCE" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* 1. Magenta Alignment Guide Lines */}
        {lines.map((line) => {
          if (line.orientation === 'vertical') {
            const x = line.position
            const y1 = line.start
            const y2 = line.end

            return (
              <g key={line.id} filter="url(#guide-glow)">
                <line
                  x1={x}
                  y1={y1}
                  x2={x}
                  y2={y2}
                  stroke="#FF4DCE"
                  strokeWidth={strokeW}
                  strokeDasharray={`${6 / zoom} ${3 / zoom}`}
                />
                {/* Top and Bottom Ticks */}
                <line
                  x1={x - tickSize}
                  y1={y1}
                  x2={x + tickSize}
                  y2={y1}
                  stroke="#FF4DCE"
                  strokeWidth={strokeW}
                />
                <line
                  x1={x - tickSize}
                  y1={y2}
                  x2={x + tickSize}
                  y2={y2}
                  stroke="#FF4DCE"
                  strokeWidth={strokeW}
                />
              </g>
            )
          } else {
            const y = line.position
            const x1 = line.start
            const x2 = line.end

            return (
              <g key={line.id} filter="url(#guide-glow)">
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke="#FF4DCE"
                  strokeWidth={strokeW}
                  strokeDasharray={`${6 / zoom} ${3 / zoom}`}
                />
                {/* Left and Right Ticks */}
                <line
                  x1={x1}
                  y1={y - tickSize}
                  x2={x1}
                  y2={y + tickSize}
                  stroke="#FF4DCE"
                  strokeWidth={strokeW}
                />
                <line
                  x1={x2}
                  y1={y - tickSize}
                  x2={x2}
                  y2={y + tickSize}
                  stroke="#FF4DCE"
                  strokeWidth={strokeW}
                />
              </g>
            )
          }
        })}

        {/* 2. Equal Spacing Guides Lines */}
        {spacings.map((sp) => {
          const isH = sp.orientation === 'horizontal'
          return (
            <g key={sp.id} filter="url(#guide-glow)">
              <line
                x1={sp.start.x}
                y1={sp.start.y}
                x2={sp.end.x}
                y2={sp.end.y}
                stroke="#FF4DCE"
                strokeWidth={strokeW * 1.5}
              />
              {/* Terminal Ticks */}
              {isH ? (
                <>
                  <line
                    x1={sp.start.x}
                    y1={sp.start.y - tickSize * 1.5}
                    x2={sp.start.x}
                    y2={sp.start.y + tickSize * 1.5}
                    stroke="#FF4DCE"
                    strokeWidth={strokeW * 1.5}
                  />
                  <line
                    x1={sp.end.x}
                    y1={sp.end.y - tickSize * 1.5}
                    x2={sp.end.x}
                    y2={sp.end.y + tickSize * 1.5}
                    stroke="#FF4DCE"
                    strokeWidth={strokeW * 1.5}
                  />
                </>
              ) : (
                <>
                  <line
                    x1={sp.start.x - tickSize * 1.5}
                    y1={sp.start.y}
                    x2={sp.start.x + tickSize * 1.5}
                    y2={sp.start.y}
                    stroke="#FF4DCE"
                    strokeWidth={strokeW * 1.5}
                  />
                  <line
                    x1={sp.end.x - tickSize * 1.5}
                    y1={sp.end.y}
                    x2={sp.end.x + tickSize * 1.5}
                    y2={sp.end.y}
                    stroke="#FF4DCE"
                    strokeWidth={strokeW * 1.5}
                  />
                </>
              )}
            </g>
          )
        })}
      </svg>

      {/* 3. Distance Pill Badges (HTML for crisp text and backdrop) */}
      {spacings.map((sp) => {
        const midX = (sp.start.x + sp.end.x) / 2
        const midY = (sp.start.y + sp.end.y) / 2

        return (
          <div
            key={`badge-${sp.id}`}
            style={{
              position: 'absolute',
              left: `${midX}px`,
              top: `${midY}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="flex items-center justify-center pointer-events-none"
          >
            <span
              style={{
                fontSize: `${Math.max(9, 10 / Math.max(0.7, zoom))}px`,
                transform: zoom < 0.7 ? `scale(${0.7 / zoom})` : undefined,
              }}
              className="bg-[#0B1120]/95 text-[#FF4DCE] border border-[#FF4DCE] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg backdrop-blur whitespace-nowrap"
            >
              {sp.distance}px
            </span>
          </div>
        )
      })}
    </div>
  )
}
