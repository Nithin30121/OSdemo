import React from 'react'

/**
 * StudioCanvasLogo (StudioInteractiveEye / StudioCenterLogo)
 * 
 * Eye-in-triangle watermark logo fixed at canvas world coordinate (0, 0).
 * 
 * - Replaces the red origin dot at the exact same canvas coordinates:
 *   left: 0, top: 0, transform: translate(-50%, -50%)
 * - Preserves aspect ratio (1:1) with a fixed size in canvas units (240px x 240px).
 * - Rendered inside the transformed canvas layer (#studio-canvas-transform-layer)
 *   alongside ordinary images, frames, and canvas elements.
 * - Naturally pans and zooms with the canvas transform.
 * - Completely static: mouse/trackpad movement alone does not move the logo.
 * - Non-selectable, non-draggable, pointer-events: none.
 * - Excluded from exports, document element counts, and the Layers panel.
 * - Completely replaces the red dot (no both markers).
 */
export const StudioCanvasLogo: React.FC = () => {
  return (
    <div
      aria-label="Canvas World Center Logo (0,0)"
      id="studio-canvas-center-logo"
      data-testid="studio-canvas-center-logo"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: 'translate(-50%, -50%)',
        width: '240px',
        height: '240px',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 0.35,
        zIndex: 1,
      }}
      className="select-none flex items-center justify-center filter drop-shadow-[0_0_24px_rgba(255,255,255,0.06)]"
    >
      <img
        src="/studio-center-logo.png"
        alt="OpenSitemap Studio Logo"
        id="studio-center-logo-img"
        data-testid="studio-center-logo-img"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        draggable={false}
      />
    </div>
  )
}

// Aliases for backwards compatibility across imports
export const StudioInteractiveEye = StudioCanvasLogo
export const StudioCenterLogo = StudioCanvasLogo
export const StudioCanvasCenterPoint = StudioCanvasLogo
