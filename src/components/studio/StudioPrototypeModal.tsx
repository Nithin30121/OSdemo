import React, { useState, useEffect } from 'react'
import {
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useStudioStore } from '../../store/useStudioStore'
import { PrototypeTransition } from '../../types/studio'
import { StudioNodeRenderer } from './StudioNodeRenderer'

export const StudioPrototypeModal: React.FC = () => {
  const isPreviewOpen = useStudioStore((s) => s.isPreviewOpen)
  const setPreviewOpen = useStudioStore((s) => s.setPreviewOpen)
  const document = useStudioStore((s) => s.document)
  const previewFrameId = useStudioStore((s) => s.previewFrameId)
  const setPreviewFrameId = useStudioStore((s) => s.setPreviewFrameId)

  const [activeFrameId, setActiveFrameId] = useState<string>(() => {
    return previewFrameId || document.frames[0]?.id || ''
  })
  const [transitioning, setTransitioning] = useState<PrototypeTransition | null>(null)
  const [showHotspotHint, setShowHotspotHint] = useState(false)

  if (!isPreviewOpen) return null

  const activeFrame = document.frames.find((f) => f.id === activeFrameId) || document.frames[0]
  if (!activeFrame) return null

  const childNodes = document.nodes.filter((n) => n.frameId === activeFrame.id)
  const framePrototypes = document.prototypes.filter((p) =>
    childNodes.some((n) => n.id === p.sourceNodeId)
  )

  const handleTriggerNode = (nodeId: string) => {
    const proto = framePrototypes.find((p) => p.sourceNodeId === nodeId)
    if (!proto) {
      // Flash hotspot hints if user clicks non-interactive element
      setShowHotspotHint(true)
      setTimeout(() => setShowHotspotHint(false), 500)
      return
    }

    const dest = document.frames.find((f) => f.id === proto.destinationFrameId)
    if (!dest) return

    setTransitioning(proto.transition)
    setTimeout(() => {
      setActiveFrameId(dest.id)
      setPreviewFrameId(dest.id)
      setTransitioning(null)
    }, proto.durationMs || 300)
  }

  const handleRestart = () => {
    const first = document.frames[0]
    if (first) {
      setActiveFrameId(first.id)
      setPreviewFrameId(first.id)
    }
  }

  // Animation class for transitions
  let transitionClass = 'transition-all duration-300 '
  if (transitioning === 'dissolve') {
    transitionClass += 'opacity-0 scale-95'
  } else if (transitioning === 'slide-left') {
    transitionClass += '-translate-x-12 opacity-50'
  } else if (transitioning === 'slide-right') {
    transitionClass += 'translate-x-12 opacity-50'
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/95 backdrop-blur-xl flex flex-col items-center justify-between select-none">
      {/* 1. Presentation Header */}
      <header className="h-14 w-full bg-[#242424]/90 border-b border-[#424242] px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-[#F2F2F2] tracking-wide uppercase">
              Prototype Mode
            </span>
          </div>

          <div className="h-4 w-px bg-[#424242]" />

          <select
            value={activeFrame.id}
            onChange={(e) => {
              setActiveFrameId(e.target.value)
              setPreviewFrameId(e.target.value)
            }}
            className="bg-[#353535] border border-[#424242] rounded-lg px-3 py-1.5 text-xs text-[#F2F2F2] outline-none focus:border-[#707070] font-medium"
          >
            {document.frames.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.preset})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            title="Restart Prototype from Beginning"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#303030] hover:bg-[#353535] border border-[#424242] text-[#A8A8A8] hover:text-[#F2F2F2] text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>

          <button
            onClick={() => setPreviewOpen(false)}
            title="Exit Prototype Preview (Esc)"
            className="p-2 rounded-lg bg-[#303030] hover:bg-red-500/20 hover:text-red-300 border border-[#424242] text-[#A8A8A8] hover:border-red-500/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Interactive Presentation Frame Area */}
      <main
        onClick={() => {
          setShowHotspotHint(true)
          setTimeout(() => setShowHotspotHint(false), 500)
        }}
        className="flex-1 w-full flex items-center justify-center p-8 overflow-auto relative cursor-default"
      >
        <div
          style={{
            width: `${activeFrame.width}px`,
            height: `${activeFrame.height}px`,
            backgroundColor: activeFrame.background || '#000000',
            overflow: activeFrame.clipsContent !== false ? 'hidden' : 'visible',
            borderRadius: activeFrame.preset === 'iphone' ? '44px' : activeFrame.preset === 'android' ? '28px' : '8px',
            boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 0 1px #424242',
          }}
          className={`relative ${transitionClass}`}
        >
          {/* Render Frame Children with Hotspots */}
          {childNodes.map((node) => {
            const hasConnection = framePrototypes.some((p) => p.sourceNodeId === node.id)

            return (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTriggerNode(node.id)
                }}
                className={`relative ${hasConnection ? 'cursor-pointer' : ''}`}
              >
                <StudioNodeRenderer
                  node={node}
                  isSelected={false}
                  onClick={() => {}}
                  onDoubleClick={() => {}}
                />

                {/* Hotspot Visual Glow Hint */}
                {hasConnection && showHotspotHint && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      width: `${node.width}px`,
                      height: `${node.height}px`,
                      borderRadius: `${node.cornerRadius || 8}px`,
                    }}
                    className="ring-4 ring-purple-400/80 bg-purple-500/20 animate-ping pointer-events-none z-50"
                  />
                )}
              </div>
            )
          })}
        </div>
      </main>

      {/* 3. Footer Bar with Controls Info */}
      <footer className="h-10 w-full bg-[#242424]/80 border-t border-[#424242] px-6 flex items-center justify-between text-[11px] text-[#A8A8A8]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Click interactive elements with connections to navigate. Non-interactive clicks highlight hotspots.</span>
        </div>
        <div className="flex items-center gap-4 text-[#A8A8A8]">
          <span>{activeFrame.width} × {activeFrame.height} px</span>
          <span>Frame {document.frames.findIndex((f) => f.id === activeFrame.id) + 1} of {document.frames.length}</span>
        </div>
      </footer>
    </div>
  )
}
