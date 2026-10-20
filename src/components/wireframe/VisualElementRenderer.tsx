import React, { useState } from 'react'
import { VisualElement } from '../../types'
import { Image as ImageIcon, Check } from 'lucide-react'

interface VisualElementRendererProps {
  element: VisualElement
  isSelected?: boolean
  zoom?: number
  onSelect?: (e: React.MouseEvent) => void
  onUpdateContent?: (newContent: string) => void
}

export const VisualElementRenderer: React.FC<VisualElementRendererProps> = ({
  element,
  isSelected = false,
  zoom = 1,
  onSelect,
  onUpdateContent,
}) => {
  const [isEditingText, setIsEditingText] = useState(false)
  const [textContent, setTextContent] = useState(element.content || '')

  if (element.layout.isHidden) return null

  const { layout, style } = element

  // Convert element style into React inline CSS
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${layout.x}px`,
    top: `${layout.y}px`,
    width: `${layout.width}px`,
    height: `${layout.height}px`,
    transform: layout.rotation ? `rotate(${layout.rotation}deg)` : undefined,
    zIndex: layout.zIndex || 1,
    opacity: style.opacity !== undefined ? style.opacity : 1,
    backgroundColor: style.fill || undefined,
    borderRadius: style.cornerRadius !== undefined ? `${style.cornerRadius}px` : undefined,
    borderWidth: style.stroke ? `${style.stroke.width}px` : undefined,
    borderStyle: style.stroke?.style || undefined,
    borderColor: style.stroke?.color || undefined,
    boxShadow: style.shadow
      ? `${style.shadow.inset ? 'inset ' : ''}${style.shadow.x}px ${style.shadow.y}px ${style.shadow.blur}px ${style.shadow.spread}px ${style.shadow.color}`
      : undefined,
    fontFamily: style.typography?.fontFamily || undefined,
    fontSize: style.typography?.fontSize ? `${style.typography.fontSize}px` : undefined,
    fontWeight: style.typography?.fontWeight || undefined,
    lineHeight: style.typography?.lineHeight || undefined,
    letterSpacing: style.typography?.letterSpacing ? `${style.typography.letterSpacing}px` : undefined,
    textAlign: style.typography?.textAlign || undefined,
    color: style.typography?.color || undefined,
    textTransform: style.typography?.textTransform || undefined,
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (element.type === 'text' || element.type === 'button') {
      setIsEditingText(true)
      setTextContent(element.content || '')
    }
  }

  const handleFinishEditing = () => {
    setIsEditingText(false)
    if (onUpdateContent && textContent !== element.content) {
      onUpdateContent(textContent)
    }
  }

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        if (isEditingText) {
          return (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              onBlur={handleFinishEditing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleFinishEditing()
                }
              }}
              autoFocus
              className="w-full h-full bg-black/60 border border-purple-500 rounded p-1 text-white resize-none outline-none text-inherit font-inherit"
            />
          )
        }
        return (
          <div className="w-full h-full flex items-center select-none overflow-hidden">
            <span className="w-full leading-normal">
              {element.content || 'Headline Text'}
            </span>
          </div>
        )

      case 'button':
        if (isEditingText) {
          return (
            <input
              type="text"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              onBlur={handleFinishEditing}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishEditing()
              }}
              autoFocus
              className="w-full h-full bg-black/60 border border-purple-500 rounded px-2 text-white text-center outline-none"
            />
          )
        }
        return (
          <button
            type="button"
            className="w-full h-full flex items-center justify-center font-bold px-4 py-2 transition-transform active:scale-95 shadow-sm"
            style={{
              backgroundColor: style.fill || '#1769E8',
              color: style.typography?.color || '#FFFFFF',
              borderRadius: style.cornerRadius !== undefined ? `${style.cornerRadius}px` : '8px',
            }}
          >
            {element.content || 'Action Button'}
          </button>
        )

      case 'shape':
        return (
          <div
            className="w-full h-full select-none flex items-center justify-center transition-all overflow-hidden"
            style={{
              backgroundColor: style.fill || '#1E293B',
              borderRadius: style.cornerRadius !== undefined ? `${style.cornerRadius}px` : '8px',
              borderWidth: style.stroke?.width ? `${style.stroke.width}px` : undefined,
              borderColor: style.stroke?.color,
              borderStyle: style.stroke?.style || 'solid',
            }}
          >
            {element.content && (
              <span className="text-xs text-slate-300 select-none pointer-events-none px-2 text-center font-medium">
                {element.content}
              </span>
            )}
          </div>
        )

      case 'image':
        return (
          <div
            className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/50 rounded-lg overflow-hidden select-none relative"
            style={{
              borderRadius: style.cornerRadius !== undefined ? `${style.cornerRadius}px` : '8px',
            }}
          >
            {element.props?.imageUrl ? (
              <img
                src={element.props.imageUrl}
                alt={element.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                <span className="text-[10px] font-mono text-slate-400">
                  {element.content || '[ Image Placeholder ]'}
                </span>
              </>
            )}
          </div>
        )

      case 'card':
        return (
          <div
            className="w-full h-full p-4 flex flex-col justify-between border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md select-none"
            style={{
              borderRadius: style.cornerRadius !== undefined ? `${style.cornerRadius}px` : '12px',
              backgroundColor: style.fill,
            }}
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                ★
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {element.content || 'Card Feature Title'}
              </h4>
              <p className="text-xs text-slate-500">
                {element.props?.description || 'Customizable card component for modern design systems.'}
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-blue-500">Learn more →</div>
          </div>
        )

      case 'input':
        return (
          <div className="w-full h-full flex flex-col justify-center space-y-1 select-none">
            {element.props?.label && (
              <label className="text-[11px] font-medium text-slate-400">
                {element.props.label}
              </label>
            )}
            <div
              className="w-full flex-1 px-3 flex items-center text-xs text-slate-400 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg shadow-inner"
              style={{
                borderRadius: style.cornerRadius !== undefined ? `${style.cornerRadius}px` : '8px',
              }}
            >
              {element.content || 'Enter text here...'}
            </div>
          </div>
        )

      case 'table':
        return (
          <div
            className="w-full h-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 select-none text-[11px]"
            style={{
              borderRadius: style.cornerRadius !== undefined ? `${style.cornerRadius}px` : '8px',
            }}
          >
            <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 font-bold p-2 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span>Item Name</span>
              <span>Category</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="grid grid-cols-3 p-2 text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-800 dark:text-slate-200">User Profile</span>
                <span>Security</span>
                <span className="text-emerald-500">Active</span>
              </div>
              <div className="grid grid-cols-3 p-2 text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-800 dark:text-slate-200">Billing Plan</span>
                <span>Finance</span>
                <span className="text-blue-500">Pro</span>
              </div>
            </div>
          </div>
        )

      default:
        // Container / Frame
        return (
          <div
            className="w-full h-full border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-2"
            style={{
              borderRadius: style.cornerRadius !== undefined ? `${style.cornerRadius}px` : '8px',
              backgroundColor: style.fill,
            }}
          >
            {element.content && (
              <span className="text-xs text-slate-400 select-none">{element.content}</span>
            )}
          </div>
        )
    }
  }

  return (
    <div
      style={containerStyle}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      className={`group transition-all ${
        isSelected ? 'ring-1 ring-[#1769E8]' : 'hover:ring-1 hover:ring-slate-400/40'
      } ${layout.isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {renderContent()}
    </div>
  )
}
