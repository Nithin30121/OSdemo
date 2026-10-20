import React from 'react'
import { StudioFrame, StudioNode } from '../../types/studio'
import { StudioNodeRenderer } from './StudioNodeRenderer'
import { Monitor, Smartphone, Tablet, Laptop, Square, Frame } from 'lucide-react'
import { useStudioStore } from '../../store/useStudioStore'

interface StudioFrameRendererProps {
  frame: StudioFrame
  childNodes: StudioNode[]
  selectedIds: string[]
  onSelectFrame: (e: React.MouseEvent) => void
  onSelectNode: (nodeId: string, e: React.MouseEvent) => void
  onDoubleClickNode: (nodeId: string, e: React.MouseEvent) => void
}

export const StudioFrameRenderer: React.FC<StudioFrameRendererProps> = ({
  frame,
  childNodes,
  selectedIds,
  onSelectFrame,
  onSelectNode,
  onDoubleClickNode,
}) => {
  const canvasDropTargetFrameId = useStudioStore((s) => s.canvasDropTargetFrameId)
  if (frame.isHidden) return null

  const isFrameSelected = selectedIds.includes(frame.id)
  const isDropTarget = canvasDropTargetFrameId === frame.id

  const getDeviceIcon = () => {
    switch (frame.preset) {
      case 'desktop':
        return <Monitor className="w-3 h-3 text-blue-400" />
      case 'macbook':
        return <Laptop className="w-3 h-3 text-cyan-400" />
      case 'iphone':
      case 'android':
        return <Smartphone className="w-3 h-3 text-emerald-400" />
      case 'ipad':
        return <Tablet className="w-3 h-3 text-purple-400" />
      case 'social-square':
        return <Square className="w-3 h-3 text-pink-400" />
      default:
        return <Frame className="w-3 h-3 text-slate-400" />
    }
  }

  // Auto-Layout position calculation if enabled
  const layoutCalculatedNodes = childNodes.map((node, index) => {
    if (!frame.autoLayout?.enabled) return node

    const { direction, gap, padding } = frame.autoLayout
    let computedX = node.x
    let computedY = node.y

    if (direction === 'vertical') {
      computedX = padding.left
      let yOffset = padding.top
      for (let i = 0; i < index; i++) {
        yOffset += childNodes[i].height + gap
      }
      computedY = yOffset
    } else {
      computedY = padding.top
      let xOffset = padding.left
      for (let i = 0; i < index; i++) {
        xOffset += childNodes[i].width + gap
      }
      computedX = xOffset
    }

    return {
      ...node,
      x: computedX,
      y: computedY,
    }
  })

  return (
    <div
      id={`frame-${frame.id}`}
      style={{
        position: 'absolute',
        left: `${frame.x}px`,
        top: `${frame.y}px`,
        width: `${frame.width}px`,
        height: `${frame.height}px`,
      }}
      className="group select-none"
    >
      {/* 1. Frame Title Header Tab */}
      <div
        onClick={onSelectFrame}
        style={{
          position: 'absolute',
          top: '-26px',
          left: '0px',
        }}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-t-md text-[11px] font-bold cursor-pointer transition-all ${
          isDropTarget
            ? 'bg-[#1769E8] text-white shadow-md ring-2 ring-blue-400'
            : isFrameSelected
            ? 'bg-[#1769E8] text-white shadow-md'
            : 'text-[#A8A8A8] hover:text-[#F2F2F2] bg-[#292929] border-t border-l border-r border-[#424242]'
        }`}
      >
        {getDeviceIcon()}
        <span>{frame.name}</span>
        <span className="text-[9px] font-mono opacity-60">
          {frame.width}×{frame.height}
        </span>
      </div>

      {/* 2. Main Frame Surface */}
      <div
        onClick={onSelectFrame}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: frame.background || '#0F172A',
          overflow: frame.clipsContent !== false ? 'hidden' : 'visible',
          borderRadius: frame.preset === 'iphone' ? '44px' : frame.preset === 'android' ? '28px' : '4px',
          boxShadow: isDropTarget
            ? '0 0 0 2.5px #1769E8, 0 0 30px rgba(23, 105, 232, 0.45)'
            : isFrameSelected
            ? '0 0 0 2px #1769E8, 0 20px 50px rgba(0,0,0,0.6)'
            : '0 10px 30px rgba(0,0,0,0.4)',
        }}
        className="relative transition-all cursor-default"
      >
        {/* Visual drop indicator overlay when object is dragged over frame */}
        {isDropTarget && (
          <div className="absolute inset-0 border-2 border-dashed border-[#1769E8] bg-[#1769E8]/5 pointer-events-none z-30 rounded-[inherit] flex items-center justify-center">
            <div className="px-2.5 py-1 rounded-md bg-[#242424]/95 border border-blue-500 text-blue-300 text-xs font-semibold shadow-2xl backdrop-blur pointer-events-none animate-in fade-in duration-100">
              Drop into {frame.name}
            </div>
          </div>
        )}

        {/* Child Nodes inside Frame */}
        {layoutCalculatedNodes.map((node) => (
          <StudioNodeRenderer
            key={node.id}
            node={node}
            isSelected={selectedIds.includes(node.id)}
            onClick={(e) => {
              e.stopPropagation()
              onSelectNode(node.id, e)
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              onDoubleClickNode(node.id, e)
            }}
          />
        ))}
      </div>
    </div>
  )
}
