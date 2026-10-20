import React from 'react'

/**
 * StudioCenterLogo (StudioInteractiveEye)
 * 
 * Truly static eye-in-triangle watermark logo overlay.
 * 
 * Positioning Architecture:
 * - Studio viewport container (#studio-canvas-container): position: relative; overflow: hidden
 * - Logo overlay (#studio-center-logo-overlay): position: absolute; inset: 0; pointer-events: none; z-index: 1
 * - Logo (#studio-center-logo): position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)
 * 
 * Completely independent of canvas zoom, pan, and document transformations.
 * Visually behind document content (canvas layer is z-index: 2), above dotted background (z-index: 0).
 */
export const StudioInteractiveEye: React.FC = () => {
  return (
    <div
      aria-label="Studio Center Logo Overlay"
      id="studio-center-logo-overlay"
      data-testid="studio-center-logo-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <div
        id="studio-center-logo"
        data-testid="studio-center-logo"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '240px',
          height: '240px',
          pointerEvents: 'none',
          opacity: 0.22,
        }}
        className="select-none flex items-center justify-center filter drop-shadow-[0_0_24px_rgba(255,255,255,0.06)]"
      >
        <img
          src="/studio-center-logo.png"
          alt="OpenSitemap Studio Logo"
          id="studio-center-logo-img"
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
    </div>
  )
}

export const StudioCenterLogo = StudioInteractiveEye
