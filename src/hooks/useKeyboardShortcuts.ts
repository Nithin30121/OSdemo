import { useEffect } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { useUIStore } from '../store/useUIStore'

export function useKeyboardShortcuts() {
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const save = useProjectStore((s) => s.save)
  const canUndo = useProjectStore((s) => s.canUndo())
  const canRedo = useProjectStore((s) => s.canRedo())
  const clearSelection = useUIStore((s) => s.clearSelection)
  const setGeneratorOpen = useUIStore((s) => s.setGeneratorOpen)
  const isGeneratorOpen = useUIStore((s) => s.isGeneratorOpen)
  const addToast = useUIStore((s) => s.addToast)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input or textarea
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (e.key === 'Escape') {
        clearSelection()
        return
      }

      if (modifier && !isInput) {
        if (e.key === 'z' || e.key === 'Z') {
          if (e.shiftKey) {
            e.preventDefault()
            if (canRedo) redo()
          } else {
            e.preventDefault()
            if (canUndo) undo()
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault()
          if (canRedo) redo()
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault()
          save()
          addToast({
            title: 'Saved',
            description: 'Project saved locally to IndexedDB.',
            type: 'success',
          })
        } else if (e.key === 'g' || e.key === 'G') {
          e.preventDefault()
          setGeneratorOpen(!isGeneratorOpen)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, save, canUndo, canRedo, clearSelection, setGeneratorOpen, isGeneratorOpen, addToast])
}
