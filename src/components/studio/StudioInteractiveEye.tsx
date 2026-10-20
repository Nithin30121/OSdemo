import React from 'react'

/**
 * StudioCanvasCenterPoint
 * 
 * Minimal solid red dot (~6px in diameter) marking world coordinate (0, 0)
 * on the infinite canvas.
 * 
 * - Rendered inside the transformed canvas layer (#studio-canvas-transform-layer)
 *   alongside ordinary images, frames, and nodes.
 * - Moves and scales naturally with canvas pan and zoom.
 * - Pointer / trackpad movement alone does not move the dot.
 * - Not dynamically centered in the viewport.
 * - Non-selectable, non-draggable, pointer-events: none.
 * - Excluded from exports, document objects, layers, and element counts.
 * - Clear solid red without glow, label, icon, or surrounding graphic.
 */
export const StudioCanvasCenterPoint: React.FC = () => {
  return (
    <div
      aria-label="Canvas World Center Point (0,0)"
      id="studio-canvas-center-point"
      data-testid="studio-canvas-center-point"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: 'translate(-50%, -50%)',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#FF3B30', // Solid minimal red dot
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  )
}

// Aliases for backwards compatibility with any existing imports
export const StudioInteractiveEye = StudioCanvasCenterPoint
export const StudioCenterLogo = StudioCanvasCenterPoint
