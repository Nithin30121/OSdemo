import React, { useRef, useEffect } from 'react'
import { StudioNode } from '../../types/studio'
import { useStudioStore } from '../../store/useStudioStore'

interface StudioNodeRendererProps {
  node: StudioNode
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
  onDoubleClick: (e: React.MouseEvent) => void
}

export const StudioNodeRenderer: React.FC<StudioNodeRendererProps> = ({
  node,
  isSelected,
  onClick,
  onDoubleClick,
}) => {
  const editingTextId = useStudioStore((s) => s.editingTextId)
  const setEditingTextId = useStudioStore((s) => s.setEditingTextId)
  const updateNode = useStudioStore((s) => s.updateNode)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isEditingThisText = editingTextId === node.id && node.type === 'text'

  useEffect(() => {
    if (isEditingThisText && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditingThisText])

  if (node.isHidden) return null

  // Style calculations
  const fillStyle: React.CSSProperties = {}
  if (node.fill) {
    if (node.fill.type === 'none') {
      fillStyle.backgroundColor = 'transparent'
    } else if (node.fill.type === 'gradient' && node.fill.gradientStops && node.fill.gradientStops.length > 0) {
      const angle = node.fill.gradientAngle || 90
      const stops = node.fill.gradientStops.map((s) => `${s.color} ${s.offset}%`).join(', ')
      fillStyle.background = `linear-gradient(${angle}deg, ${stops})`
    } else {
      fillStyle.backgroundColor = node.fill.color || '#1769E8'
    }
  }

  const borderStyle: React.CSSProperties = {}
  if (node.stroke && node.stroke.width > 0) {
    borderStyle.borderWidth = `${node.stroke.width}px`
    borderStyle.borderColor = node.stroke.color
    borderStyle.borderStyle = node.stroke.style || 'solid'
  }

  const shadowStyle: React.CSSProperties = {}
  if (node.shadow) {
    const { x, y, blur, spread, color, inset } = node.shadow
    shadowStyle.boxShadow = `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}`
  }

  const transformStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${node.x}px`,
    top: `${node.y}px`,
    width: `${node.width}px`,
    height: `${node.height}px`,
    opacity: node.opacity ?? 1,
    borderRadius: `${node.cornerRadius || 0}px`,
    transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
    transformOrigin: 'center center',
    ...fillStyle,
    ...borderStyle,
    ...shadowStyle,
  }

  // 1. Text Node
  if (node.type === 'text') {
    const textConfig = node.text || {
      content: 'Text',
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
      textAlign: 'left',
      color: '#FFFFFF',
    }

    const textInlineStyle: React.CSSProperties = {
      fontFamily: textConfig.fontFamily,
      fontSize: `${textConfig.fontSize}px`,
      fontWeight: textConfig.fontWeight,
      lineHeight: textConfig.lineHeight,
      letterSpacing: `${textConfig.letterSpacing}px`,
      textAlign: textConfig.textAlign,
      color: textConfig.color || '#FFFFFF',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }

    return (
      <div
        id={`node-${node.id}`}
        onClick={onClick}
        onDoubleClick={(e) => {
          e.stopPropagation()
          setEditingTextId(node.id)
          onDoubleClick(e)
        }}
        style={transformStyle}
        className={`cursor-pointer transition-shadow select-none ${
          isSelected ? 'ring-2 ring-[#1769E8]' : 'hover:ring-1 hover:ring-blue-400/50'
        }`}
      >
        {isEditingThisText ? (
          <textarea
            ref={textareaRef}
            value={textConfig.content}
            onChange={(e) =>
              updateNode(node.id, {
                text: { ...textConfig, content: e.target.value },
              })
            }
            onBlur={() => setEditingTextId(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditingTextId(null)
            }}
            style={{
              ...textInlineStyle,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid #873FF0',
              borderRadius: '4px',
              padding: '2px 4px',
              outline: 'none',
              resize: 'none',
            }}
          />
        ) : (
          <div style={textInlineStyle} className="w-full h-full">
            {textConfig.content}
          </div>
        )}
      </div>
    )
  }

  // 2. Image Node
  if (node.type === 'image') {
    const fitMode = node.image?.fit === 'fit' ? 'contain' : node.image?.fit === 'crop' ? 'cover' : 'fill'

    return (
      <div
        id={`node-${node.id}`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={transformStyle}
        className={`cursor-pointer overflow-hidden transition-shadow select-none ${
          isSelected ? 'ring-2 ring-[#1769E8]' : 'hover:ring-1 hover:ring-blue-400/50'
        }`}
      >
        {node.image?.src ? (
          <img
            src={node.image.src}
            alt={node.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: fitMode,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
            No Image Source
          </div>
        )}
      </div>
    )
  }

  // 3. Freehand Drawing Node (SVG Path)
  if (node.type === 'drawing' && node.drawing?.points) {
    const pts = node.drawing.points
    const pathD = pts.length > 0
      ? `M ${pts[0].x - node.x} ${pts[0].y - node.y} ` +
        pts.slice(1).map((p) => `L ${p.x - node.x} ${p.y - node.y}`).join(' ')
      : ''

    return (
      <div
        id={`node-${node.id}`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={{
          position: 'absolute',
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${node.height}px`,
          pointerEvents: 'auto',
        }}
        className={`cursor-pointer ${isSelected ? 'ring-2 ring-[#1769E8]' : ''}`}
      >
        <svg width={node.width} height={node.height} className="overflow-visible">
          <path
            d={pathD}
            fill="none"
            stroke={node.drawing.strokeColor || '#873FF0'}
            strokeWidth={node.drawing.strokeWidth || 3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  // 4. Polygon / Triangle / Star Node
  if (node.type === 'polygon') {
    const sides = node.polygon?.sides || 3
    let pointsStr = ''
    const cx = node.width / 2
    const cy = node.height / 2
    const rx = node.width / 2
    const ry = node.height / 2

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
      const x = cx + rx * Math.cos(angle)
      const y = cy + ry * Math.sin(angle)
      pointsStr += `${x},${y} `
    }

    return (
      <div
        id={`node-${node.id}`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={{
          position: 'absolute',
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${node.height}px`,
          opacity: node.opacity ?? 1,
          transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
        }}
        className={`cursor-pointer select-none ${isSelected ? 'ring-2 ring-[#1769E8]' : ''}`}
      >
        <svg width={node.width} height={node.height}>
          <polygon
            points={pointsStr.trim()}
            fill={node.fill?.color || '#F9E52B'}
            stroke={node.stroke?.color || 'none'}
            strokeWidth={node.stroke?.width || 0}
          />
        </svg>
      </div>
    )
  }

  // 5. Line and Arrow Nodes
  if (node.type === 'line' || node.type === 'arrow') {
    const strokeColor = node.stroke?.color || node.fill?.color || '#38BDF8'
    const strokeWidth = node.stroke?.width || 2

    return (
      <div
        id={`node-${node.id}`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={{
          position: 'absolute',
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${Math.max(16, node.height)}px`,
          opacity: node.opacity ?? 1,
          transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
        }}
        className={`cursor-pointer flex items-center select-none ${isSelected ? 'ring-2 ring-[#1769E8]' : ''}`}
      >
        <svg width={node.width} height={Math.max(16, node.height)} className="overflow-visible">
          <defs>
            {node.type === 'arrow' && (
              <marker
                id={`arrowhead-${node.id}`}
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={strokeColor} />
              </marker>
            )}
          </defs>
          <line
            x1="0"
            y1={Math.max(8, node.height / 2)}
            x2={node.width}
            y2={Math.max(8, node.height / 2)}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={node.stroke?.style === 'dashed' ? '6,6' : node.stroke?.style === 'dotted' ? '2,4' : undefined}
            markerEnd={node.type === 'arrow' ? `url(#arrowhead-${node.id})` : undefined}
          />
        </svg>
      </div>
    )
  }

  // 6. Component Master or Instance with text content
  if ((node.type === 'component' || node.type === 'instance') && node.text?.content) {
    return (
      <div
        id={`node-${node.id}`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={transformStyle}
        className={`cursor-pointer transition-shadow select-none flex items-center justify-center font-medium ${
          node.type === 'component'
            ? isSelected
              ? 'ring-2 ring-[#873FF0]'
              : 'hover:ring-1 hover:ring-purple-400'
            : isSelected
            ? 'ring-2 ring-[#1769E8]'
            : 'hover:ring-1 hover:ring-blue-400'
        }`}
      >
        <span
          style={{
            fontFamily: node.text.fontFamily,
            fontSize: `${node.text.fontSize}px`,
            fontWeight: node.text.fontWeight,
            color: node.text.color || '#FFFFFF',
          }}
        >
          {node.text.content}
        </span>
      </div>
    )
  }

  // 7. Generic Rectangle / Container
  return (
    <div
      id={`node-${node.id}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={transformStyle}
      className={`cursor-pointer transition-shadow select-none ${
        isSelected ? 'ring-2 ring-[#1769E8]' : 'hover:ring-1 hover:ring-blue-400/50'
      }`}
    />
  )
}
