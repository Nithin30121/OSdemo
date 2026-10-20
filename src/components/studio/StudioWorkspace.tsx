import React, { useEffect, useState } from 'react'
import { useStudioStore } from '../../store/useStudioStore'
import { StudioTopBar } from './StudioTopBar'
import { StudioLeftSidebar } from './StudioLeftSidebar'
import { StudioCanvas } from './StudioCanvas'
import { StudioRightSidebar } from './StudioRightSidebar'
import { StudioPrototypeModal } from './StudioPrototypeModal'
import { StudioExportModal } from './StudioExportModal'
import { StudioAssetPreviewModal } from './StudioAssetPreviewModal'

export const StudioWorkspace: React.FC = () => {
  const initDocument = useStudioStore((s) => s.initDocument)
  const isLoaded = useStudioStore((s) => s.isLoaded)
  const loadAssets = useStudioStore((s) => s.loadAssets)
  const previewingAssetId = useStudioStore((s) => s.previewingAssetId)

  const undo = useStudioStore((s) => s.undo)
  const redo = useStudioStore((s) => s.redo)
  const deleteSelected = useStudioStore((s) => s.deleteSelected)
  const duplicateSelected = useStudioStore((s) => s.duplicateSelected)
  const groupSelected = useStudioStore((s) => s.groupSelected)
  const ungroupSelected = useStudioStore((s) => s.ungroupSelected)
  const setActiveTool = useStudioStore((s) => s.setActiveTool)
  const clearSelection = useStudioStore((s) => s.clearSelection)
  const createComponentFromSelection = useStudioStore((s) => s.createComponentFromSelection)
  const zoomIn = useStudioStore((s) => s.zoomIn)
  const zoomOut = useStudioStore((s) => s.zoomOut)
  const zoomTo100 = useStudioStore((s) => s.zoomTo100)
  const fitAll = useStudioStore((s) => s.fitAll)
  const fitSelection = useStudioStore((s) => s.fitSelection)

  const [isExportOpen, setIsExportOpen] = useState(false)

  // Initialize document & assets on mount
  useEffect(() => {
    initDocument()
    loadAssets()
  }, [initDocument, loadAssets])

  // Global Keyboard Shortcuts for Studio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If full-screen asset preview is open, let preview modal handle keys
      if (useStudioStore.getState().previewingAssetId) return

      const activeEl = window.document.activeElement
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA'

      // If user is editing text in an input or textarea, let default input behavior handle it
      if (isInput) return

      // Zoom In (⌘+ or ⌘=)
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        zoomIn()
        return
      }

      // Zoom Out (⌘-)
      if ((e.metaKey || e.ctrlKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault()
        zoomOut()
        return
      }

      // Reset Zoom to 100% (⌘0)
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault()
        zoomTo100()
        return
      }

      // Fit All (Shift + 1)
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && e.key === '1') {
        e.preventDefault()
        fitAll()
        return
      }

      // Fit Selection (Shift + 2)
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && e.key === '2') {
        e.preventDefault()
        fitSelection()
        return
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        redo()
        return
      }

      // Duplicate
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        duplicateSelected()
        return
      }

      // Group (⌘G) / Ungroup (⌘⇧G)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        groupSelected()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        ungroupSelected()
        return
      }

      // Create Component (⌥⌘K)
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        createComponentFromSelection()
        return
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
        return
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
        return
      }

      // Tool shortcuts (without modifier keys)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key.toLowerCase() === 'v') setActiveTool('select')
        if (e.key.toLowerCase() === 'h') setActiveTool('hand')
        if (e.key.toLowerCase() === 'f') setActiveTool('frame')
        if (e.key.toLowerCase() === 'r') setActiveTool('rectangle')
        if (e.key.toLowerCase() === 'o') setActiveTool('ellipse')
        if (e.key.toLowerCase() === 't') setActiveTool('text')
        if (e.key.toLowerCase() === 'p') setActiveTool('pen')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, deleteSelected, duplicateSelected, groupSelected, ungroupSelected, setActiveTool, clearSelection, createComponentFromSelection, zoomIn, zoomOut, zoomTo100, fitAll, fitSelection])

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#242424] text-[#A8A8A8]">
        <span>Loading Studio...</span>
      </div>
    )
  }

  return (
    <div
      id="studio-workspace"
      className="h-full w-full flex flex-col bg-[#242424] text-[#F2F2F2] overflow-hidden relative select-none"
    >
      {/* 1. Dedicated Studio Top Toolbar */}
      <StudioTopBar onOpenExport={() => setIsExportOpen(true)} />

      {/* 2. Main Studio Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Layers & Assets) */}
        <StudioLeftSidebar />

        {/* Large Central Freeform Design Canvas */}
        <StudioCanvas />

        {/* Right Properties & Prototype Sidebar */}
        <StudioRightSidebar />
      </div>

      {/* 3. Interactive Prototype Presentation Modal */}
      <StudioPrototypeModal />

      {/* 4. Export Spec Modal */}
      <StudioExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      {/* 5. Full-Screen Asset Image Preview Overlay */}
      <StudioAssetPreviewModal />
    </div>
  )
}
