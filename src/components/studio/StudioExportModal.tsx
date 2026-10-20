import React, { useState } from 'react'
import {
  X,
  Download,
  Upload,
  FileCode,
  Image as ImageIcon,
  Check,
  Copy,
  Layers,
} from 'lucide-react'
import { useStudioStore } from '../../store/useStudioStore'

interface StudioExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const StudioExportModal: React.FC<StudioExportModalProps> = ({ isOpen, onClose }) => {
  const document = useStudioStore((s) => s.document)
  const initDocument = useStudioStore((s) => s.initDocument)

  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'json'>('png')
  const [selectedFrameId, setSelectedFrameId] = useState<string>('all')
  const [resolutionScale, setResolutionScale] = useState<number>(1)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // 1. JSON Export & Import
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(document, null, 2))
    const downloadAnchor = window.document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${document.name.toLowerCase().replace(/\s+/g, '-')}-studio.json`)
    window.document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (parsed.frames && parsed.nodes) {
          await initDocument(parsed)
          onClose()
        }
      } catch {
        alert('Invalid Studio JSON format')
      }
    }
    reader.readAsText(file)
  }

  // 2. SVG Export
  const generateSVGString = () => {
    const targetFrames = selectedFrameId === 'all'
      ? document.frames
      : document.frames.filter((f) => f.id === selectedFrameId)

    if (targetFrames.length === 0) return ''

    const minX = Math.min(...targetFrames.map((f) => f.x))
    const minY = Math.min(...targetFrames.map((f) => f.y))
    const maxX = Math.max(...targetFrames.map((f) => f.x + f.width))
    const maxY = Math.max(...targetFrames.map((f) => f.y + f.height))
    const totalW = maxX - minX
    const totalH = maxY - minY

    let svgInner = ''

    targetFrames.forEach((frame) => {
      svgInner += `<rect x="${frame.x - minX}" y="${frame.y - minY}" width="${frame.width}" height="${frame.height}" fill="${frame.background || '#0F172A'}" rx="8" />\n`

      const childNodes = document.nodes.filter((n) => n.frameId === frame.id)
      childNodes.forEach((node) => {
        const nx = frame.x - minX + node.x
        const ny = frame.y - minY + node.y

        if (node.type === 'text' && node.text) {
          svgInner += `<text x="${nx}" y="${ny + (node.text.fontSize || 16)}" font-family="${node.text.fontFamily || 'Inter'}" font-size="${node.text.fontSize || 16}" font-weight="${node.text.fontWeight || 400}" fill="${node.text.color || '#FFFFFF'}">${node.text.content.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>\n`
        } else if (node.type === 'ellipse') {
          svgInner += `<ellipse cx="${nx + node.width / 2}" cy="${ny + node.height / 2}" rx="${node.width / 2}" ry="${node.height / 2}" fill="${node.fill?.color || '#873FF0'}" />\n`
        } else {
          svgInner += `<rect x="${nx}" y="${ny}" width="${node.width}" height="${node.height}" rx="${node.cornerRadius || 0}" fill="${node.fill?.color || '#1769E8'}" />\n`
        }
      })
    })

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">\n${svgInner}</svg>`
  }

  const handleExportSVG = () => {
    const svgContent = generateSVGString()
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const downloadAnchor = window.document.createElement('a')
    downloadAnchor.setAttribute('href', url)
    downloadAnchor.setAttribute('download', `${document.name.toLowerCase().replace(/\s+/g, '-')}.svg`)
    window.document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    URL.revokeObjectURL(url)
  }

  // 3. PNG Export via Offscreen HTML5 Canvas
  const handleExportPNG = async () => {
    const targetFrames = selectedFrameId === 'all'
      ? document.frames
      : document.frames.filter((f) => f.id === selectedFrameId)

    if (targetFrames.length === 0) return

    const minX = Math.min(...targetFrames.map((f) => f.x))
    const minY = Math.min(...targetFrames.map((f) => f.y))
    const maxX = Math.max(...targetFrames.map((f) => f.x + f.width))
    const maxY = Math.max(...targetFrames.map((f) => f.y + f.height))
    const totalW = (maxX - minX) * resolutionScale
    const totalH = (maxY - minY) * resolutionScale

    const canvas = window.document.createElement('canvas')
    canvas.width = totalW
    canvas.height = totalH
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Scale
    ctx.scale(resolutionScale, resolutionScale)

    // Draw background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, maxX - minX, maxY - minY)

    targetFrames.forEach((frame) => {
      const fx = frame.x - minX
      const fy = frame.y - minY

      // Draw Frame Background
      ctx.fillStyle = frame.background || '#0F172A'
      ctx.beginPath()
      ctx.roundRect(fx, fy, frame.width, frame.height, [8])
      ctx.fill()

      // Draw Children
      const childNodes = document.nodes.filter((n) => n.frameId === frame.id)
      childNodes.forEach((node) => {
        const nx = fx + node.x
        const ny = fy + node.y

        ctx.save()
        ctx.globalAlpha = node.opacity ?? 1

        if (node.type === 'text' && node.text) {
          ctx.fillStyle = node.text.color || '#FFFFFF'
          ctx.font = `${node.text.fontWeight || 400} ${node.text.fontSize || 16}px ${node.text.fontFamily || 'Inter'}, sans-serif`
          ctx.fillText(node.text.content, nx, ny + (node.text.fontSize || 16))
        } else if (node.type === 'ellipse') {
          ctx.fillStyle = node.fill?.color || '#873FF0'
          ctx.beginPath()
          ctx.ellipse(nx + node.width / 2, ny + node.height / 2, node.width / 2, node.height / 2, 0, 0, 2 * Math.PI)
          ctx.fill()
        } else {
          ctx.fillStyle = node.fill?.color || '#1769E8'
          ctx.beginPath()
          ctx.roundRect(nx, ny, node.width, node.height, [node.cornerRadius || 0])
          ctx.fill()
        }
        ctx.restore()
      })
    })

    const pngUrl = canvas.toDataURL('image/png')
    const downloadAnchor = window.document.createElement('a')
    downloadAnchor.setAttribute('href', pngUrl)
    downloadAnchor.setAttribute('download', `${document.name.toLowerCase().replace(/\s+/g, '-')}${resolutionScale > 1 ? '@2x' : ''}.png`)
    window.document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleCopySVG = () => {
    const svg = generateSVGString()
    navigator.clipboard.writeText(svg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#292929] border border-[#424242] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none text-[#F2F2F2]">
        {/* Header */}
        <div className="p-4 border-b border-[#424242] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm text-[#F2F2F2]">Export Studio Design</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#A8A8A8] hover:text-[#F2F2F2] p-1 rounded hover:bg-[#353535] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Format Selection */}
          <div>
            <label className="text-[#A8A8A8] font-semibold block mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExportFormat('png')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'png'
                    ? 'selected-glass text-white font-bold'
                    : 'border-[#424242] bg-[#303030] text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535]'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>PNG Image</span>
              </button>
              <button
                onClick={() => setExportFormat('svg')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'svg'
                    ? 'selected-glass text-white font-bold'
                    : 'border-[#424242] bg-[#303030] text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535]'
                }`}
              >
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>SVG Vector</span>
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'json'
                    ? 'selected-glass text-white font-bold'
                    : 'border-[#424242] bg-[#303030] text-[#A8A8A8] hover:text-[#F2F2F2] hover:bg-[#353535]'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>JSON Project</span>
              </button>
            </div>
          </div>

          {/* Scope: Specific Frame or All Frames */}
          {exportFormat !== 'json' && (
            <div>
              <label className="text-[#A8A8A8] font-semibold block mb-1.5">Export Scope</label>
              <select
                value={selectedFrameId}
                onChange={(e) => setSelectedFrameId(e.target.value)}
                className="w-full bg-[#353535] border border-[#424242] rounded-lg px-3 py-2 text-xs text-[#F2F2F2] outline-none focus:border-[#707070]"
              >
                <option value="all">Entire Canvas (All Frames & Elements)</option>
                {document.frames.map((frame) => (
                  <option key={frame.id} value={frame.id}>
                    {frame.name} ({frame.width}×{frame.height})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Resolution scale for PNG */}
          {exportFormat === 'png' && (
            <div>
              <label className="text-[#A8A8A8] font-semibold block mb-1.5">Resolution Scale</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setResolutionScale(1)}
                  className={`py-1.5 rounded-lg border font-mono transition-all ${
                    resolutionScale === 1
                      ? 'selected-glass text-white font-bold'
                      : 'border-[#424242] bg-[#303030] text-[#A8A8A8] hover:text-[#F2F2F2]'
                  }`}
                >
                  1x Standard
                </button>
                <button
                  onClick={() => setResolutionScale(2)}
                  className={`py-1.5 rounded-lg border font-mono transition-all ${
                    resolutionScale === 2
                      ? 'selected-glass text-white font-bold'
                      : 'border-[#424242] bg-[#303030] text-[#A8A8A8] hover:text-[#F2F2F2]'
                  }`}
                >
                  2x Retina (@2x)
                </button>
              </div>
            </div>
          )}

          {/* JSON Import option */}
          {exportFormat === 'json' && (
            <div className="pt-2 border-t border-[#424242]">
              <label className="text-[#A8A8A8] font-semibold block mb-1.5">Import Existing JSON</label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#424242] hover:border-emerald-500/50 cursor-pointer bg-[#303030] hover:bg-[#353535] transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span className="text-[#F2F2F2] font-medium">Choose Studio JSON File</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#242424] border-t border-[#424242] flex items-center justify-between">
          {exportFormat === 'svg' ? (
            <button
              onClick={handleCopySVG}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#303030] hover:bg-[#353535] border border-[#424242] text-[#A8A8A8] hover:text-[#F2F2F2] text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SVG!' : 'Copy SVG'}</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-[#A8A8A8] hover:text-[#F2F2F2] text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (exportFormat === 'png') handleExportPNG()
                else if (exportFormat === 'svg') handleExportSVG()
                else handleExportJSON()
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#873FF0] to-[#1769E8] hover:opacity-95 text-white text-xs font-bold shadow-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {exportFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
