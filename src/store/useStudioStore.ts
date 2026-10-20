import { create } from 'zustand'
import {
  StudioDocument,
  StudioFrame,
  StudioNode,
  StudioPrototype,
  StudioAsset,
  StudioTool,
  StudioFramePreset,
  FRAME_PRESETS,
} from '../types/studio'
import { saveStudioDocument, loadStudioDocument, saveStudioAsset, loadStudioAssets, deleteStudioAsset } from '../services/storage/studioStorage'
import { processImageFile } from '../services/storage/assetUtils'
import { useProjectStore } from './useProjectStore'
import { useUIStore } from './useUIStore'
import { SmartGuidesState } from '../services/studio/snappingEngine'

export const MIN_LEFT_SIDEBAR_WIDTH = 200
export const MAX_LEFT_SIDEBAR_WIDTH = 420
export const DEFAULT_LEFT_SIDEBAR_WIDTH = 260

export const MIN_RIGHT_SIDEBAR_WIDTH = 260
export const MAX_RIGHT_SIDEBAR_WIDTH = 480
export const DEFAULT_RIGHT_SIDEBAR_WIDTH = 320

export const MIN_CANVAS_WIDTH = 320

function getStoredSidebarWidth(key: string, fallback: number, min: number, max: number): number {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const val = window.localStorage.getItem(key)
      if (val !== null && val !== undefined) {
        const num = parseInt(val, 10)
        if (!isNaN(num)) {
          return Math.max(min, Math.min(max, num))
        }
      }
    } catch {}
  }
  return fallback
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
}

function createDefaultStudioDocument(name: string = 'Studio Workspace'): StudioDocument {
  const desktopFrame: StudioFrame = {
    id: 'frame_desktop_hero',
    name: 'Desktop Landing',
    preset: 'desktop',
    x: 100,
    y: 100,
    width: 1440,
    height: 900,
    background: '#0B1120',
    clipsContent: true,
    isLocked: false,
    isHidden: false,
  }

  const mobileFrame: StudioFrame = {
    id: 'frame_mobile_app',
    name: 'Mobile Screen',
    preset: 'iphone',
    x: 1620,
    y: 100,
    width: 393,
    height: 852,
    background: '#0F172A',
    clipsContent: true,
    isLocked: false,
    isHidden: false,
  }

  const defaultNodes: StudioNode[] = [
    // Desktop Hero Background Card
    {
      id: 'node_desk_card',
      name: 'Hero Card Container',
      type: 'rectangle',
      frameId: 'frame_desktop_hero',
      x: 80,
      y: 80,
      width: 1280,
      height: 740,
      rotation: 0,
      opacity: 1,
      cornerRadius: 24,
      isLocked: false,
      isHidden: false,
      fill: {
        type: 'gradient',
        color: '#131D36',
        gradientType: 'linear',
        gradientAngle: 135,
        gradientStops: [
          { color: '#1E293B', offset: 0 },
          { color: '#0F172A', offset: 100 },
        ],
      },
      stroke: { color: '#334155', width: 1, style: 'solid' },
      shadow: { x: 0, y: 16, blur: 40, spread: 0, color: 'rgba(0,0,0,0.5)' },
    },
    // Desktop Headline
    {
      id: 'node_desk_heading',
      name: 'Hero Headline',
      type: 'text',
      frameId: 'frame_desktop_hero',
      x: 140,
      y: 160,
      width: 700,
      height: 120,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'none', color: '#FFFFFF' },
      text: {
        content: 'Design, Prototype & Ship in OpenSitemap Studio',
        fontFamily: 'Outfit',
        fontSize: 48,
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: -1,
        textAlign: 'left',
        color: '#FFFFFF',
      },
    },
    // Desktop Subtitle
    {
      id: 'node_desk_subtitle',
      name: 'Hero Description',
      type: 'text',
      frameId: 'frame_desktop_hero',
      x: 140,
      y: 300,
      width: 600,
      height: 60,
      rotation: 0,
      opacity: 0.85,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'none', color: '#94A3B8' },
      text: {
        content: 'A complete Figma-inspired professional design editor directly integrated with your website architecture and sitemaps.',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: 0,
        textAlign: 'left',
        color: '#94A3B8',
      },
    },
    // Desktop CTA Button (Component Master)
    {
      id: 'node_desk_cta_btn',
      name: 'Primary CTA Button',
      type: 'component',
      frameId: 'frame_desktop_hero',
      x: 140,
      y: 390,
      width: 200,
      height: 52,
      rotation: 0,
      opacity: 1,
      cornerRadius: 12,
      isLocked: false,
      isHidden: false,
      fill: {
        type: 'gradient',
        color: '#873FF0',
        gradientType: 'linear',
        gradientAngle: 90,
        gradientStops: [
          { color: '#873FF0', offset: 0 },
          { color: '#1769E8', offset: 100 },
        ],
      },
      stroke: { color: '#A855F7', width: 1, style: 'solid' },
      shadow: { x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(135,63,240,0.4)' },
      component: {
        isMaster: true,
        componentName: 'Primary Button',
        variant: 'Default',
        variantsList: ['Default', 'Hover', 'Outline'],
      },
      text: {
        content: 'Explore Studio →',
        fontFamily: 'Inter',
        fontSize: 15,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: 0,
        textAlign: 'center',
        color: '#FFFFFF',
      },
    },
    // Mobile Screen App Header
    {
      id: 'node_mob_header',
      name: 'App Nav Header',
      type: 'rectangle',
      frameId: 'frame_mobile_app',
      x: 0,
      y: 0,
      width: 393,
      height: 88,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'solid', color: '#1E293B' },
      stroke: { color: '#334155', width: 1, style: 'solid' },
    },
    {
      id: 'node_mob_title',
      name: 'App Screen Title',
      type: 'text',
      frameId: 'frame_mobile_app',
      x: 24,
      y: 48,
      width: 200,
      height: 28,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'none', color: '#FFFFFF' },
      text: {
        content: 'Studio Mobile',
        fontFamily: 'Outfit',
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: -0.5,
        textAlign: 'left',
        color: '#FFFFFF',
      },
    },
    // Mobile Button Instance linked to CTA Master
    {
      id: 'node_mob_btn_instance',
      name: 'Mobile CTA (Instance)',
      type: 'instance',
      frameId: 'frame_mobile_app',
      x: 24,
      y: 740,
      width: 345,
      height: 52,
      rotation: 0,
      opacity: 1,
      cornerRadius: 12,
      isLocked: false,
      isHidden: false,
      fill: {
        type: 'gradient',
        color: '#873FF0',
        gradientType: 'linear',
        gradientAngle: 90,
        gradientStops: [
          { color: '#873FF0', offset: 0 },
          { color: '#1769E8', offset: 100 },
        ],
      },
      component: {
        isMaster: false,
        masterId: 'node_desk_cta_btn',
        componentName: 'Primary Button',
        variant: 'Default',
      },
      text: {
        content: 'Get Started on Mobile',
        fontFamily: 'Inter',
        fontSize: 15,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: 0,
        textAlign: 'center',
        color: '#FFFFFF',
      },
    },
  ]

  const defaultPrototypes: StudioPrototype[] = [
    {
      id: 'proto_cta_to_mobile',
      sourceNodeId: 'node_desk_cta_btn',
      destinationFrameId: 'frame_mobile_app',
      trigger: 'click',
      action: 'navigate',
      transition: 'slide-left',
      durationMs: 300,
    },
  ]

  return {
    version: 1,
    id: 'studio_doc_default',
    name,
    frames: [desktopFrame, mobileFrame],
    nodes: defaultNodes,
    prototypes: defaultPrototypes,
    updatedAt: new Date().toISOString(),
  }
}

interface StudioStoreState {
  // Document
  document: StudioDocument
  isLoaded: boolean
  isSaving: boolean
  lastSaved: string | null

  // Viewport & Canvas
  pan: { x: number; y: number }
  zoom: number
  canvasBackground: string
  setPan: (pan: { x: number; y: number } | ((p: { x: number; y: number }) => { x: number; y: number })) => void
  setZoom: (zoom: number | ((z: number) => number), focal?: { x: number; y: number }) => void
  zoomIn: (focal?: { x: number; y: number }) => void
  zoomOut: (focal?: { x: number; y: number }) => void
  zoomToFit: (viewportW?: number, viewportH?: number) => void
  zoomTo100: (focal?: { x: number; y: number }) => void
  fitAll: (viewportW?: number, viewportH?: number) => void
  fitSelection: (viewportW?: number, viewportH?: number) => void
  fitFrame: (frameId?: string, viewportW?: number, viewportH?: number) => void
  setCanvasBackground: (color: string) => void
  resetCanvasBackground: () => void

  // Tool & Interactions
  activeTool: StudioTool
  setActiveTool: (tool: StudioTool) => void
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  toggleSelectId: (id: string, multi?: boolean) => void
  clearSelection: () => void
  hoveredId: string | null
  setHoveredId: (id: string | null) => void

  editingTextId: string | null
  setEditingTextId: (id: string | null) => void

  // Marquee Selection
  isMarqueeSelecting: boolean
  marqueeRect: { x: number; y: number; width: number; height: number } | null
  setMarqueeState: (isSelecting: boolean, rect: { x: number; y: number; width: number; height: number } | null) => void

  // Sidebars
  isLeftSidebarOpen: boolean
  setLeftSidebarOpen: (open: boolean) => void
  toggleLeftSidebar: () => void
  leftSidebarWidth: number
  setLeftSidebarWidth: (width: number) => void
  leftTab: 'layers' | 'assets'
  setLeftTab: (tab: 'layers' | 'assets') => void

  isRightSidebarOpen: boolean
  setRightSidebarOpen: (open: boolean) => void
  toggleRightSidebar: () => void
  rightSidebarWidth: number
  setRightSidebarWidth: (width: number) => void
  rightTab: 'design' | 'prototype'
  setRightTab: (tab: 'design' | 'prototype') => void

  // Prototype Presentation Modal
  isPreviewOpen: boolean
  setPreviewOpen: (open: boolean) => void
  previewFrameId: string | null
  setPreviewFrameId: (frameId: string | null) => void

  // Full-Screen Asset Image Preview Overlay
  previewingAssetId: string | null
  openAssetPreview: (assetId: string) => void
  closeAssetPreview: () => void
  navigateAssetPreview: (direction: 'next' | 'prev') => void
  placeAssetOnCanvas: (assetId?: string, targetX?: number, targetY?: number) => StudioNode | null
  replaceSelectedWithAsset: (assetId?: string) => boolean

  // Assets
  assets: StudioAsset[]
  loadAssets: () => Promise<void>
  uploadAsset: (file: File) => Promise<StudioAsset | null>
  importAssetAndPlace: (file: File, targetX?: number, targetY?: number) => Promise<StudioNode | null>
  deleteAsset: (id: string) => Promise<void>

  // History
  past: StudioDocument[]
  future: StudioDocument[]
  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => void
  redo: () => void
  recordChange: (newDoc: StudioDocument) => void

  // Document Operations
  initDocument: (initialDoc?: StudioDocument) => Promise<void>
  saveDocument: () => Promise<void>
  setDocumentName: (name: string) => void

  // Magnetic Snapping & Smart Guides
  isSnappingEnabled: boolean
  toggleSnapping: () => void
  setSnappingEnabled: (enabled: boolean) => void
  snappingThreshold: number
  setSnappingThreshold: (threshold: number) => void
  smartGuides: SmartGuidesState | null
  setSmartGuides: (guides: SmartGuidesState | null) => void
  commitNodeMove: (id: string, initialX: number, initialY: number) => void
  commitFrameMove: (id: string, initialX: number, initialY: number) => void
  commitBatchMove: (
    initialPositions:
      | Array<{ id: string; x: number; y: number; isFrame?: boolean }>
      | Record<string, { x: number; y: number; isFrame?: boolean }>
  ) => void

  // Frame Operations
  addFrame: (preset?: StudioFramePreset, custom?: Partial<StudioFrame>) => StudioFrame
  updateFrame: (id: string, updates: Partial<StudioFrame>, skipHistory?: boolean) => void
  deleteFrame: (id: string) => void
  duplicateFrame: (id: string) => StudioFrame | null

  // Node Operations
  addNode: (node: Partial<StudioNode>, frameId?: string | null) => StudioNode
  updateNode: (id: string, updates: Partial<StudioNode>, skipHistory?: boolean) => void
  batchUpdateNodes: (updates: Array<{ id: string; changes: Partial<StudioNode> }>) => void
  deleteNode: (id: string) => void
  deleteSelected: () => void
  duplicateSelected: () => void
  duplicateSelectedForDrag: () => string[]
  alignSelected: (alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void
  distributeSelected: (direction: 'horizontal' | 'vertical') => void
  groupSelected: () => void
  ungroupSelected: () => void
  reorderNodes: (newOrderedIds: string[]) => void
  canvasDropTargetFrameId: string | null
  setCanvasDropTargetFrameId: (frameId: string | null) => void
  reparentNode: (nodeId: string, targetFrameId: string | null, beforeNodeId?: string | null) => void
  toggleLock: (id: string) => void
  toggleHide: (id: string) => void

  // Components & Instances
  createComponentFromSelection: () => StudioNode | null
  createInstanceFromMaster: (masterNodeId: string) => StudioNode | null
  detachInstance: (instanceNodeId: string) => void

  // Prototyping
  addPrototype: (proto: Omit<StudioPrototype, 'id'>) => StudioPrototype
  updatePrototype: (id: string, updates: Partial<StudioPrototype>) => void
  deletePrototype: (id: string) => void
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null

export const useStudioStore = create<StudioStoreState>((set, get) => ({
  document: createDefaultStudioDocument(),
  isLoaded: false,
  isSaving: false,
  lastSaved: null,

  pan: { x: 50, y: 50 },
  zoom: 0.85,
  canvasBackground: (() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('opensitemap_studio_canvas_bg') || '#000000'
    }
    return '#000000'
  })(),
  setPan: (pan) =>
    set((s) => ({
      pan: typeof pan === 'function' ? pan(s.pan) : pan,
    })),
  setZoom: (zoom, focal) => {
    const current = get().zoom
    const nextVal = typeof zoom === 'function' ? zoom(current) : zoom
    const clamped = Math.max(0.01, Math.min(8.0, nextVal))
    if (Math.abs(clamped - current) < 0.00001) return

    if (focal) {
      const currentPan = get().pan
      const newPanX = focal.x - (focal.x - currentPan.x) * (clamped / current)
      const newPanY = focal.y - (focal.y - currentPan.y) * (clamped / current)
      set({
        zoom: Number(clamped.toFixed(4)),
        pan: { x: Math.round(newPanX), y: Math.round(newPanY) },
      })
    } else {
      const currentPan = get().pan
      let fx = 500
      let fy = 350
      if (typeof window !== 'undefined') {
        const leftW = get().isLeftSidebarOpen ? get().leftSidebarWidth : 40
        const rightW = get().isRightSidebarOpen ? get().rightSidebarWidth : 40
        const vw = Math.max(300, window.innerWidth - leftW - rightW)
        const vh = Math.max(300, window.innerHeight - 48)
        fx = vw / 2
        fy = vh / 2
      }
      const newPanX = fx - (fx - currentPan.x) * (clamped / current)
      const newPanY = fy - (fy - currentPan.y) * (clamped / current)
      set({
        zoom: Number(clamped.toFixed(4)),
        pan: { x: Math.round(newPanX), y: Math.round(newPanY) },
      })
    }
  },
  zoomIn: (focal) => {
    const current = get().zoom
    let nextZoom = current * 1.25
    if (current < 0.05) nextZoom = current + 0.02
    else if (current < 0.1) nextZoom = current + 0.05
    get().setZoom(nextZoom, focal)
  },
  zoomOut: (focal) => {
    const current = get().zoom
    let nextZoom = current / 1.25
    if (current <= 0.05 && current > 0.01) nextZoom = Math.max(0.01, current - 0.01)
    get().setZoom(nextZoom, focal)
  },
  zoomTo100: (focal) => {
    get().setZoom(1.0, focal)
  },
  fitAll: (viewportW, viewportH) => {
    const doc = get().document
    const frames = doc.frames.filter((f) => !f.isHidden)
    const rootNodes = doc.nodes.filter((n) => !n.frameId && !n.isHidden)

    if (frames.length === 0 && rootNodes.length === 0) {
      set({ pan: { x: 60, y: 60 }, zoom: 1.0 })
      return
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    frames.forEach((f) => {
      minX = Math.min(minX, f.x)
      minY = Math.min(minY, f.y)
      maxX = Math.max(maxX, f.x + f.width)
      maxY = Math.max(maxY, f.y + f.height)
    })

    rootNodes.forEach((n) => {
      minX = Math.min(minX, n.x)
      minY = Math.min(minY, n.y)
      maxX = Math.max(maxX, n.x + n.width)
      maxY = Math.max(maxY, n.y + n.height)
    })

    const boundsW = Math.max(10, maxX - minX)
    const boundsH = Math.max(10, maxY - minY)

    let vw = viewportW
    let vh = viewportH
    if (!vw || !vh) {
      if (typeof window !== 'undefined') {
        const leftW = get().isLeftSidebarOpen ? get().leftSidebarWidth : 40
        const rightW = get().isRightSidebarOpen ? get().rightSidebarWidth : 40
        vw = Math.max(300, window.innerWidth - leftW - rightW)
        vh = Math.max(300, window.innerHeight - 48)
      } else {
        vw = 1000
        vh = 700
      }
    }

    const padding = 80
    const scaleX = (vw - padding * 2) / boundsW
    const scaleY = (vh - padding * 2) / boundsH
    const newZoom = Math.max(0.01, Math.min(2.0, Math.min(scaleX, scaleY)))

    const centerX = minX + boundsW / 2
    const centerY = minY + boundsH / 2

    const newPanX = Math.round(vw / 2 - centerX * newZoom)
    const newPanY = Math.round(vh / 2 - centerY * newZoom)

    set({
      zoom: Number(newZoom.toFixed(4)),
      pan: { x: newPanX, y: newPanY },
    })
  },
  zoomToFit: () => {
    get().fitAll()
  },
  fitSelection: (viewportW, viewportH) => {
    const selectedIds = get().selectedIds
    if (selectedIds.length === 0) {
      get().fitAll(viewportW, viewportH)
      return
    }

    const doc = get().document
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    let found = false

    selectedIds.forEach((id) => {
      const frame = doc.frames.find((f) => f.id === id)
      if (frame) {
        found = true
        minX = Math.min(minX, frame.x)
        minY = Math.min(minY, frame.y)
        maxX = Math.max(maxX, frame.x + frame.width)
        maxY = Math.max(maxY, frame.y + frame.height)
        return
      }

      const node = doc.nodes.find((n) => n.id === id)
      if (node) {
        found = true
        const parent = node.frameId ? doc.frames.find((f) => f.id === node.frameId) : null
        const absX = parent ? parent.x + node.x : node.x
        const absY = parent ? parent.y + node.y : node.y
        minX = Math.min(minX, absX)
        minY = Math.min(minY, absY)
        maxX = Math.max(maxX, absX + node.width)
        maxY = Math.max(maxY, absY + node.height)
      }
    })

    if (!found) {
      get().fitAll(viewportW, viewportH)
      return
    }

    const boundsW = Math.max(10, maxX - minX)
    const boundsH = Math.max(10, maxY - minY)

    let vw = viewportW
    let vh = viewportH
    if (!vw || !vh) {
      if (typeof window !== 'undefined') {
        const leftW = get().isLeftSidebarOpen ? get().leftSidebarWidth : 40
        const rightW = get().isRightSidebarOpen ? get().rightSidebarWidth : 40
        vw = Math.max(300, window.innerWidth - leftW - rightW)
        vh = Math.max(300, window.innerHeight - 48)
      } else {
        vw = 1000
        vh = 700
      }
    }

    const padding = 100
    const scaleX = (vw - padding * 2) / boundsW
    const scaleY = (vh - padding * 2) / boundsH
    const newZoom = Math.max(0.01, Math.min(4.0, Math.min(scaleX, scaleY)))

    const centerX = minX + boundsW / 2
    const centerY = minY + boundsH / 2

    const newPanX = Math.round(vw / 2 - centerX * newZoom)
    const newPanY = Math.round(vh / 2 - centerY * newZoom)

    set({
      zoom: Number(newZoom.toFixed(4)),
      pan: { x: newPanX, y: newPanY },
    })
  },
  fitFrame: (frameId, viewportW, viewportH) => {
    const doc = get().document
    const targetId = frameId || get().selectedIds.find((id) => doc.frames.some((f) => f.id === id)) || doc.frames[0]?.id
    if (!targetId) {
      get().fitAll(viewportW, viewportH)
      return
    }

    const frame = doc.frames.find((f) => f.id === targetId)
    if (!frame) {
      get().fitAll(viewportW, viewportH)
      return
    }

    let vw = viewportW
    let vh = viewportH
    if (!vw || !vh) {
      if (typeof window !== 'undefined') {
        const leftW = get().isLeftSidebarOpen ? get().leftSidebarWidth : 40
        const rightW = get().isRightSidebarOpen ? get().rightSidebarWidth : 40
        vw = Math.max(300, window.innerWidth - leftW - rightW)
        vh = Math.max(300, window.innerHeight - 48)
      } else {
        vw = 1000
        vh = 700
      }
    }

    const padding = 80
    const scaleX = (vw - padding * 2) / frame.width
    const scaleY = (vh - padding * 2) / frame.height
    const newZoom = Math.max(0.01, Math.min(4.0, Math.min(scaleX, scaleY)))

    const centerX = frame.x + frame.width / 2
    const centerY = frame.y + frame.height / 2

    const newPanX = Math.round(vw / 2 - centerX * newZoom)
    const newPanY = Math.round(vh / 2 - centerY * newZoom)

    set({
      zoom: Number(newZoom.toFixed(4)),
      pan: { x: newPanX, y: newPanY },
    })
  },
  setCanvasBackground: (color: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('opensitemap_studio_canvas_bg', color)
      } catch {}
    }
    set((s) => ({
      canvasBackground: color,
      document: {
        ...s.document,
        canvasBackground: color,
        updatedAt: new Date().toISOString(),
      },
    }))
    get().saveDocument()
  },
  resetCanvasBackground: () => {
    get().setCanvasBackground('#000000')
  },

  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelectId: (id, multi) =>
    set((s) => {
      if (!multi) return { selectedIds: [id] }
      return {
        selectedIds: s.selectedIds.includes(id)
          ? s.selectedIds.filter((item) => item !== id)
          : [...s.selectedIds, id],
      }
    }),
  clearSelection: () => set({ selectedIds: [], editingTextId: null }),
  hoveredId: null,
  setHoveredId: (id) => set({ hoveredId: id }),

  editingTextId: null,
  setEditingTextId: (id) => set({ editingTextId: id }),

  isMarqueeSelecting: false,
  marqueeRect: null,
  setMarqueeState: (isSelecting, rect) => set({ isMarqueeSelecting: isSelecting, marqueeRect: rect }),

  isLeftSidebarOpen: true,
  setLeftSidebarOpen: (open) => set({ isLeftSidebarOpen: open }),
  toggleLeftSidebar: () => set((s) => ({ isLeftSidebarOpen: !s.isLeftSidebarOpen })),
  leftSidebarWidth: getStoredSidebarWidth(
    'opensitemap_studio_left_width',
    DEFAULT_LEFT_SIDEBAR_WIDTH,
    MIN_LEFT_SIDEBAR_WIDTH,
    MAX_LEFT_SIDEBAR_WIDTH
  ),
  setLeftSidebarWidth: (width) => {
    const clamped = Math.max(MIN_LEFT_SIDEBAR_WIDTH, Math.min(MAX_LEFT_SIDEBAR_WIDTH, Math.round(width)))
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('opensitemap_studio_left_width', String(clamped))
      } catch {}
    }
    set({ leftSidebarWidth: clamped })
  },
  leftTab: 'layers',
  setLeftTab: (tab) => set({ leftTab: tab }),

  isRightSidebarOpen: true,
  setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
  toggleRightSidebar: () => set((s) => ({ isRightSidebarOpen: !s.isRightSidebarOpen })),
  rightSidebarWidth: getStoredSidebarWidth(
    'opensitemap_studio_right_width',
    DEFAULT_RIGHT_SIDEBAR_WIDTH,
    MIN_RIGHT_SIDEBAR_WIDTH,
    MAX_RIGHT_SIDEBAR_WIDTH
  ),
  setRightSidebarWidth: (width) => {
    const clamped = Math.max(MIN_RIGHT_SIDEBAR_WIDTH, Math.min(MAX_RIGHT_SIDEBAR_WIDTH, Math.round(width)))
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('opensitemap_studio_right_width', String(clamped))
      } catch {}
    }
    set({ rightSidebarWidth: clamped })
  },
  rightTab: 'design',
  setRightTab: (tab) => set({ rightTab: tab }),

  isPreviewOpen: false,
  setPreviewOpen: (open) =>
    set((s) => ({
      isPreviewOpen: open,
      previewFrameId: open ? s.document.frames[0]?.id || null : null,
    })),
  previewFrameId: null,
  setPreviewFrameId: (frameId) => set({ previewFrameId: frameId }),

  // Full-Screen Asset Image Preview Overlay
  previewingAssetId: null,
  canvasDropTargetFrameId: null,
  setCanvasDropTargetFrameId: (id) => set({ canvasDropTargetFrameId: id }),

  // Magnetic Snapping & Smart Guides
  isSnappingEnabled: true,
  toggleSnapping: () => set((s) => ({ isSnappingEnabled: !s.isSnappingEnabled })),
  setSnappingEnabled: (enabled) => set({ isSnappingEnabled: enabled }),
  snappingThreshold: 8,
  setSnappingThreshold: (threshold) => set({ snappingThreshold: threshold }),
  smartGuides: null,
  setSmartGuides: (guides) => set({ smartGuides: guides }),

  openAssetPreview: (assetId) => set({ previewingAssetId: assetId }),
  closeAssetPreview: () => set({ previewingAssetId: null }),
  navigateAssetPreview: (direction) => {
    const assets = get().assets
    if (assets.length <= 1) return
    const currentId = get().previewingAssetId
    const currentIndex = assets.findIndex((a) => a.id === currentId)
    if (currentIndex === -1) {
      set({ previewingAssetId: assets[0].id })
      return
    }

    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (nextIndex < 0) nextIndex = assets.length - 1
    if (nextIndex >= assets.length) nextIndex = 0

    set({ previewingAssetId: assets[nextIndex].id })
  },

  placeAssetOnCanvas: (assetId, targetX, targetY) => {
    const idToUse = assetId || get().previewingAssetId
    if (!idToUse) return null
    const asset = get().assets.find((a) => a.id === idToUse)
    if (!asset) return null

    // Calculate dimensions preserving aspect ratio
    const naturalWidth = asset.width || 320
    const naturalHeight = asset.height || 240
    let width = naturalWidth
    let height = naturalHeight

    const maxW = 440
    const maxH = 340
    if (width > maxW || height > maxH) {
      const ratio = Math.min(maxW / width, maxH / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    // Determine coordinate placement: center in visible canvas viewport
    let x = targetX
    let y = targetY
    if (x === undefined || y === undefined) {
      const pan = get().pan
      const zoom = get().zoom
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 1200
      const viewH = typeof window !== 'undefined' ? window.innerHeight : 800
      x = Math.round((viewW / 2 - pan.x) / zoom - width / 2)
      y = Math.round((viewH / 2 - pan.y) / zoom - height / 2)
    }

    // Check if placed inside any existing frame
    const doc = get().document
    const containingFrame = doc.frames.find(
      (f) => x! >= f.x && x! <= f.x + f.width && y! >= f.y && y! <= f.y + f.height
    )

    let nodeX = x
    let nodeY = y
    let frameId: string | null = null

    if (containingFrame) {
      frameId = containingFrame.id
      nodeX = x - containingFrame.x
      nodeY = y - containingFrame.y
    }

    const newNode = get().addNode(
      {
        type: 'image',
        name: asset.name.replace(/\.[^/.]+$/, ''),
        x: nodeX,
        y: nodeY,
        width,
        height,
        fill: { type: 'none', color: 'transparent' },
        image: {
          assetId: asset.id,
          src: asset.dataUrl,
          fit: 'fill',
          aspectRatioLocked: true,
          naturalWidth: asset.width,
          naturalHeight: asset.height,
        },
      },
      frameId
    )

    set({ selectedIds: [newNode.id], activeTool: 'select' })
    useUIStore.getState().addToast({
      type: 'success',
      title: 'Placed on Canvas',
      description: `Added "${asset.name}" to the canvas`,
    })
    return newNode
  },

  replaceSelectedWithAsset: (assetId) => {
    const idToUse = assetId || get().previewingAssetId
    if (!idToUse) return false
    const asset = get().assets.find((a) => a.id === idToUse)
    if (!asset) return false

    const selectedIds = get().selectedIds
    const doc = get().document
    const selectedNode = doc.nodes.find((n) => selectedIds.includes(n.id))
    if (!selectedNode) {
      useUIStore.getState().addToast({
        type: 'warning',
        title: 'No Canvas Object Selected',
        description: 'Select an image or object on the canvas first to replace it.',
      })
      return false
    }

    get().updateNode(selectedNode.id, {
      type: 'image',
      name: asset.name.replace(/\.[^/.]+$/, ''),
      fill: { type: 'none', color: 'transparent' },
      image: {
        ...selectedNode.image,
        assetId: asset.id,
        src: asset.dataUrl,
        fit: selectedNode.image?.fit || 'fill',
        aspectRatioLocked: selectedNode.image?.aspectRatioLocked ?? true,
        naturalWidth: asset.width,
        naturalHeight: asset.height,
      },
    })

    useUIStore.getState().addToast({
      type: 'success',
      title: 'Image Replaced',
      description: `Replaced selection with "${asset.name}"`,
    })
    return true
  },

  assets: [],
  past: [],
  future: [],

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  recordChange: (newDoc) => {
    const current = get().document
    set((s) => ({
      past: [...s.past.slice(-30), current],
      future: [],
      document: { ...newDoc, updatedAt: new Date().toISOString() },
    }))

    // Debounced autosave
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      get().saveDocument()
    }, 600)
  },

  undo: () => {
    const { past, future, document: current } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)
    set({
      past: newPast,
      future: [current, ...future],
      document: previous,
    })
    get().saveDocument()
  },

  redo: () => {
    const { past, future, document: current } = get()
    if (future.length === 0) return
    const next = future[0]
    const newFuture = future.slice(1)
    set({
      past: [...past, current],
      future: newFuture,
      document: next,
    })
    get().saveDocument()
  },

  initDocument: async (initialDoc) => {
    try {
      let docToUse = initialDoc
      if (!docToUse && typeof window !== 'undefined' && 'indexedDB' in window) {
        try {
          const stored = await loadStudioDocument('studio_doc_default')
          if (stored) {
            docToUse = stored
          } else {
            docToUse = createDefaultStudioDocument()
            await saveStudioDocument(docToUse)
          }
        } catch {}
      }
      if (!docToUse) {
        const projectStore = useProjectStore.getState()
        if (projectStore.project?.studio) {
          docToUse = projectStore.project.studio
        } else {
          docToUse = createDefaultStudioDocument()
        }
      }

      let loadedAssets: StudioAsset[] = []
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        try {
          loadedAssets = await loadStudioAssets()
        } catch {}
      }

      if (docToUse.assets && docToUse.assets.length > 0) {
        const map = new Map<string, StudioAsset>()
        loadedAssets.forEach((a) => map.set(a.id, a))
        docToUse.assets.forEach((a: StudioAsset) => map.set(a.id, a))
        loadedAssets = Array.from(map.values())
      }

      let currentLeft = get().leftSidebarWidth
      let currentRight = get().rightSidebarWidth
      if (docToUse.leftSidebarWidth && typeof docToUse.leftSidebarWidth === 'number') {
        currentLeft = Math.max(MIN_LEFT_SIDEBAR_WIDTH, Math.min(MAX_LEFT_SIDEBAR_WIDTH, docToUse.leftSidebarWidth))
      }
      if (docToUse.rightSidebarWidth && typeof docToUse.rightSidebarWidth === 'number') {
        currentRight = Math.max(MIN_RIGHT_SIDEBAR_WIDTH, Math.min(MAX_RIGHT_SIDEBAR_WIDTH, docToUse.rightSidebarWidth))
      }

      let currentBg = get().canvasBackground || '#000000'
      if (docToUse.canvasBackground) {
        currentBg = docToUse.canvasBackground
      } else if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('opensitemap_studio_canvas_bg')
        if (stored) currentBg = stored
      }

      set({
        document: docToUse,
        assets: loadedAssets,
        canvasBackground: currentBg,
        leftSidebarWidth: currentLeft,
        rightSidebarWidth: currentRight,
        isLoaded: true,
        lastSaved: new Date().toLocaleTimeString(),
      })
    } catch {
      set({
        document: createDefaultStudioDocument(),
        isLoaded: true,
      })
    }
  },

  saveDocument: async () => {
    set({ isSaving: true })
    const currentAssets = get().assets
    const doc = {
      ...get().document,
      assets: currentAssets,
      leftSidebarWidth: get().leftSidebarWidth,
      rightSidebarWidth: get().rightSidebarWidth,
      canvasBackground: get().canvasBackground,
    }

    // Always sync to active project in useProjectStore
    const projectStore = useProjectStore.getState()
    if (projectStore.project) {
      useProjectStore.setState({
        project: {
          ...projectStore.project,
          studio: doc,
        },
      })
    }

    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await saveStudioDocument(doc)
      }
      set({ isSaving: false, lastSaved: new Date().toLocaleTimeString() })
    } catch {
      set({ isSaving: false })
    }
  },

  setDocumentName: (name) => {
    const doc = { ...get().document, name }
    get().recordChange(doc)
  },

  // 1. Frame Operations
  addFrame: (preset = 'desktop', custom) => {
    const presetConfig = FRAME_PRESETS.find((p) => p.id === preset) || FRAME_PRESETS[0]
    const currentFrames = get().document.frames
    const lastFrame = currentFrames[currentFrames.length - 1]
    const nextX = lastFrame ? lastFrame.x + lastFrame.width + 120 : 100
    const nextY = lastFrame ? lastFrame.y : 100

    const newFrame: StudioFrame = {
      id: generateId('frame'),
      name: custom?.name || `${presetConfig.name} ${currentFrames.length + 1}`,
      preset,
      x: custom?.x ?? nextX,
      y: custom?.y ?? nextY,
      width: custom?.width ?? presetConfig.width,
      height: custom?.height ?? presetConfig.height,
      background: custom?.background ?? '#0F172A',
      clipsContent: custom?.clipsContent ?? true,
      isLocked: false,
      isHidden: false,
      ...custom,
    }

    const updatedDoc: StudioDocument = {
      ...get().document,
      frames: [...currentFrames, newFrame],
    }
    get().recordChange(updatedDoc)
    set({ selectedIds: [newFrame.id] })
    return newFrame
  },

  updateFrame: (id, updates, skipHistory = false) => {
    const currentFrames = get().document.frames
    const updatedFrames = currentFrames.map((f) => (f.id === id ? { ...f, ...updates } : f))
    if (skipHistory) {
      set({ document: { ...get().document, frames: updatedFrames } })
    } else {
      get().recordChange({
        ...get().document,
        frames: updatedFrames,
      })
    }
  },

  commitFrameMove: (id, initialX, initialY) => {
    const doc = get().document
    const frame = doc.frames.find((f) => f.id === id)
    if (!frame) return
    if (frame.x === initialX && frame.y === initialY) return

    const previousDoc: StudioDocument = {
      ...doc,
      frames: doc.frames.map((f) => (f.id === id ? { ...f, x: initialX, y: initialY } : f)),
    }

    set((s) => ({
      past: [...s.past.slice(-30), previousDoc],
      future: [],
      document: { ...doc, updatedAt: new Date().toISOString() },
    }))

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      get().saveDocument()
    }, 600)
  },

  deleteFrame: (id) => {
    const doc = get().document
    const updatedFrames = doc.frames.filter((f) => f.id !== id)
    const updatedNodes = doc.nodes.filter((n) => n.frameId !== id)
    const updatedPrototypes = doc.prototypes.filter(
      (p) => p.destinationFrameId !== id && !doc.nodes.some((n) => n.frameId === id && n.id === p.sourceNodeId)
    )
    get().recordChange({
      ...doc,
      frames: updatedFrames,
      nodes: updatedNodes,
      prototypes: updatedPrototypes,
    })
    set((s) => ({ selectedIds: s.selectedIds.filter((item) => item !== id) }))
  },

  duplicateFrame: (id) => {
    const doc = get().document
    const target = doc.frames.find((f) => f.id === id)
    if (!target) return null

    const newFrameId = generateId('frame')
    const duplicatedFrame: StudioFrame = {
      ...target,
      id: newFrameId,
      name: `${target.name} (Copy)`,
      x: target.x + target.width + 100,
      y: target.y,
    }

    // Duplicate child nodes
    const childNodes = doc.nodes.filter((n) => n.frameId === id)
    const duplicatedNodes = childNodes.map((child) => ({
      ...child,
      id: generateId('node'),
      frameId: newFrameId,
    }))

    get().recordChange({
      ...doc,
      frames: [...doc.frames, duplicatedFrame],
      nodes: [...doc.nodes, ...duplicatedNodes],
    })
    set({ selectedIds: [newFrameId] })
    return duplicatedFrame
  },

  // 2. Node Operations
  addNode: (nodePartial, frameId) => {
    const doc = get().document
    let resolvedFrameId: string | null = null
    if (nodePartial.frameId !== undefined) {
      resolvedFrameId = nodePartial.frameId
    } else if (frameId !== undefined) {
      resolvedFrameId = frameId
    } else {
      resolvedFrameId = doc.frames[0]?.id || null
    }

    const baseType = nodePartial.type || 'rectangle'

    const newNode: StudioNode = {
      id: generateId('node'),
      name: nodePartial.name || `${baseType.charAt(0).toUpperCase() + baseType.slice(1)} ${doc.nodes.length + 1}`,
      type: baseType,
      frameId: resolvedFrameId,
      x: nodePartial.x ?? 60,
      y: nodePartial.y ?? 60,
      width: nodePartial.width ?? (baseType === 'text' ? 240 : 160),
      height: nodePartial.height ?? (baseType === 'text' ? 44 : 100),
      rotation: nodePartial.rotation ?? 0,
      opacity: nodePartial.opacity ?? 1,
      cornerRadius: nodePartial.cornerRadius ?? (baseType === 'rectangle' ? 8 : 0),
      isLocked: false,
      isHidden: false,
      fill: nodePartial.fill ?? { type: 'solid', color: '#1769E8' },
      stroke: nodePartial.stroke,
      shadow: nodePartial.shadow,
      text: nodePartial.text ?? (baseType === 'text' ? {
        content: 'Type your text here',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: 0,
        textAlign: 'left',
        color: '#FFFFFF',
      } : undefined),
      image: nodePartial.image,
      drawing: nodePartial.drawing,
      polygon: nodePartial.polygon,
      component: nodePartial.component,
      constraints: nodePartial.constraints ?? { horizontal: 'left', vertical: 'top' },
      ...nodePartial,
    }

    get().recordChange({
      ...doc,
      nodes: [...doc.nodes, newNode],
    })
    set({ selectedIds: [newNode.id], activeTool: 'select' })
    return newNode
  },

  updateNode: (id, updates, skipHistory = false) => {
    const doc = get().document
    const target = doc.nodes.find((n) => n.id === id)
    if (!target) return

    let updatedNodes = doc.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n))

    // If target is a component master, propagate shared styles to all instances
    if (target.component?.isMaster) {
      updatedNodes = updatedNodes.map((n) => {
        if (n.component?.masterId === id) {
          return {
            ...n,
            width: updates.width ?? n.width,
            height: updates.height ?? n.height,
            cornerRadius: updates.cornerRadius ?? n.cornerRadius,
            fill: updates.fill ?? n.fill,
            stroke: updates.stroke ?? n.stroke,
            shadow: updates.shadow ?? n.shadow,
            text: updates.text ? { ...n.text, ...updates.text } : n.text,
          }
        }
        return n
      })
    }

    if (skipHistory) {
      set({ document: { ...doc, nodes: updatedNodes } })
    } else {
      get().recordChange({
        ...doc,
        nodes: updatedNodes,
      })
    }
  },

  commitNodeMove: (id, initialX, initialY) => {
    const doc = get().document
    const node = doc.nodes.find((n) => n.id === id)
    if (!node) return
    if (node.x === initialX && node.y === initialY) return

    const previousDoc: StudioDocument = {
      ...doc,
      nodes: doc.nodes.map((n) => (n.id === id ? { ...n, x: initialX, y: initialY } : n)),
    }

    set((s) => ({
      past: [...s.past.slice(-30), previousDoc],
      future: [],
      document: { ...doc, updatedAt: new Date().toISOString() },
    }))

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      get().saveDocument()
    }, 600)
  },

  commitBatchMove: (initialPositions: any) => {
    const doc = get().document
    const posList: Array<{ id: string; isFrame?: boolean; x: number; y: number }> = Array.isArray(initialPositions)
      ? initialPositions
      : Object.entries(initialPositions || {}).map(([id, pos]: [string, any]) => ({
          id,
          isFrame: !!pos?.isFrame,
          x: pos?.x ?? 0,
          y: pos?.y ?? 0,
        }))

    const anyChanged = posList.some((p) => {
      if (p.isFrame) {
        const f = doc.frames.find((frame) => frame.id === p.id)
        return f && (f.x !== p.x || f.y !== p.y)
      } else {
        const n = doc.nodes.find((node) => node.id === p.id)
        return n && (n.x !== p.x || n.y !== p.y)
      }
    })
    if (!anyChanged) return

    const initialMap = new Map(posList.map((p) => [p.id, p]))

    const previousDoc: StudioDocument = {
      ...doc,
      frames: doc.frames.map((f) => {
        const init = initialMap.get(f.id)
        return init && init.isFrame ? { ...f, x: init.x, y: init.y } : f
      }),
      nodes: doc.nodes.map((n) => {
        const init = initialMap.get(n.id)
        return init && !init.isFrame ? { ...n, x: init.x, y: init.y } : n
      }),
    }

    set((s) => ({
      past: [...s.past.slice(-30), previousDoc],
      future: [],
      document: { ...doc, updatedAt: new Date().toISOString() },
    }))

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      get().saveDocument()
    }, 600)
  },

  batchUpdateNodes: (updates) => {
    const doc = get().document
    const updateMap = new Map(updates.map((u) => [u.id, u.changes]))
    const updatedNodes = doc.nodes.map((n) => {
      const changes = updateMap.get(n.id)
      return changes ? { ...n, ...changes } : n
    })
    get().recordChange({
      ...doc,
      nodes: updatedNodes,
    })
  },

  deleteNode: (id) => {
    const doc = get().document
    const updatedNodes = doc.nodes.filter((n) => n.id !== id && n.groupId !== id)
    const updatedPrototypes = doc.prototypes.filter((p) => p.sourceNodeId !== id)
    get().recordChange({
      ...doc,
      nodes: updatedNodes,
      prototypes: updatedPrototypes,
    })
    set((s) => ({ selectedIds: s.selectedIds.filter((item) => item !== id) }))
  },

  deleteSelected: () => {
    const { selectedIds, document: doc } = get()
    if (selectedIds.length === 0) return

    const selectedSet = new Set(selectedIds)
    const updatedFrames = doc.frames.filter((f) => !selectedSet.has(f.id))
    const updatedNodes = doc.nodes.filter(
      (n) => !selectedSet.has(n.id) && !selectedSet.has(n.frameId || '') && !selectedSet.has(n.groupId || '')
    )
    const updatedPrototypes = doc.prototypes.filter(
      (p) => !selectedSet.has(p.sourceNodeId) && !selectedSet.has(p.destinationFrameId)
    )

    get().recordChange({
      ...doc,
      frames: updatedFrames,
      nodes: updatedNodes,
      prototypes: updatedPrototypes,
    })
    set({ selectedIds: [] })
  },

  duplicateSelected: () => {
    const { selectedIds, document: doc } = get()
    if (selectedIds.length === 0) return

    const newSelectedIds: string[] = []
    let newFrames = [...doc.frames]
    let newNodes = [...doc.nodes]

    // Check frames first
    selectedIds.forEach((id) => {
      const frame = doc.frames.find((f) => f.id === id)
      if (frame) {
        const newFrameId = generateId('frame')
        newFrames.push({
          ...frame,
          id: newFrameId,
          name: `${frame.name} (Copy)`,
          x: frame.x + 40,
          y: frame.y + 40,
        })
        newSelectedIds.push(newFrameId)

        // Clone child nodes
        const children = doc.nodes.filter((n) => n.frameId === id)
        children.forEach((c) => {
          newNodes.push({
            ...c,
            id: generateId('node'),
            frameId: newFrameId,
          })
        })
      }

      const node = doc.nodes.find((n) => n.id === id)
      if (node) {
        const newNodeId = generateId('node')
        newNodes.push({
          ...node,
          id: newNodeId,
          name: `${node.name} (Copy)`,
          x: node.x + 20,
          y: node.y + 20,
        })
        newSelectedIds.push(newNodeId)
      }
    })

    get().recordChange({
      ...doc,
      frames: newFrames,
      nodes: newNodes,
    })
    set({ selectedIds: newSelectedIds })
  },

  duplicateSelectedForDrag: () => {
    const { selectedIds, document: doc } = get()
    if (selectedIds.length === 0) return []

    const newSelectedIds: string[] = []
    const newFrames: StudioFrame[] = []
    const newNodes: StudioNode[] = []

    selectedIds.forEach((id) => {
      const frame = doc.frames.find((f) => f.id === id)
      if (frame) {
        const newFrameId = generateId('frame')
        newFrames.push({
          ...frame,
          id: newFrameId,
          name: `${frame.name} Copy`,
        })
        newSelectedIds.push(newFrameId)

        // Clone child nodes
        const children = doc.nodes.filter((n) => n.frameId === id)
        children.forEach((c) => {
          newNodes.push({
            ...c,
            id: generateId('node'),
            frameId: newFrameId,
          })
        })
      }

      const node = doc.nodes.find((n) => n.id === id && !selectedIds.includes(n.frameId || ''))
      if (node) {
        const newNodeId = generateId('node')
        newNodes.push({
          ...node,
          id: newNodeId,
          name: `${node.name} Copy`,
        })
        newSelectedIds.push(newNodeId)
      }
    })

    if (newSelectedIds.length === 0) return []

    set((s) => ({
      document: {
        ...s.document,
        frames: [...s.document.frames, ...newFrames],
        nodes: [...s.document.nodes, ...newNodes],
      },
      selectedIds: newSelectedIds,
    }))

    return newSelectedIds
  },

  alignSelected: (alignment) => {
    const { selectedIds, document: doc } = get()
    if (selectedIds.length === 0) return

    const selectedFrames = doc.frames.filter((f) => selectedIds.includes(f.id) && !f.isLocked && !f.isHidden)
    const selectedNodes = doc.nodes.filter(
      (n) => selectedIds.includes(n.id) && !n.isLocked && !n.isHidden && !selectedIds.includes(n.frameId || '')
    )

    const totalSelected = selectedFrames.length + selectedNodes.length
    if (totalSelected === 0) return

    // 1. Single item selected: align relative to parent frame or default canvas
    if (totalSelected === 1) {
      if (selectedNodes.length === 1) {
        const node = selectedNodes[0]
        const parentFrame = node.frameId ? doc.frames.find((f) => f.id === node.frameId) : null
        const containerW = parentFrame ? parentFrame.width : 1440
        const containerH = parentFrame ? parentFrame.height : 900

        let nextX = node.x
        let nextY = node.y

        switch (alignment) {
          case 'left':
            nextX = 0
            break
          case 'center-h':
            nextX = Math.round((containerW - node.width) / 2)
            break
          case 'right':
            nextX = containerW - node.width
            break
          case 'top':
            nextY = 0
            break
          case 'center-v':
            nextY = Math.round((containerH - node.height) / 2)
            break
          case 'bottom':
            nextY = containerH - node.height
            break
        }

        get().updateNode(node.id, { x: nextX, y: nextY })
        return
      }

      if (selectedFrames.length === 1) {
        const frame = selectedFrames[0]
        let nextX = frame.x
        let nextY = frame.y
        if (alignment === 'left') nextX = 60
        if (alignment === 'center-h') nextX = Math.round((1440 - frame.width) / 2)
        if (alignment === 'right') nextX = 1440 - frame.width - 60
        if (alignment === 'top') nextY = 60
        if (alignment === 'center-v') nextY = Math.round((900 - frame.height) / 2)
        if (alignment === 'bottom') nextY = 900 - frame.height - 60

        get().updateFrame(frame.id, { x: nextX, y: nextY })
        return
      }
    }

    // 2. Multiple items selected: align relative to selection bounding box
    type ItemBounds = {
      id: string
      isFrame: boolean
      canvasX: number
      canvasY: number
      width: number
      height: number
      frameOffset: { x: number; y: number }
    }

    const items: ItemBounds[] = []

    selectedFrames.forEach((f) => {
      items.push({
        id: f.id,
        isFrame: true,
        canvasX: f.x,
        canvasY: f.y,
        width: f.width,
        height: f.height,
        frameOffset: { x: 0, y: 0 },
      })
    })

    selectedNodes.forEach((n) => {
      const parentFrame = n.frameId ? doc.frames.find((f) => f.id === n.frameId) : null
      const fx = parentFrame ? parentFrame.x : 0
      const fy = parentFrame ? parentFrame.y : 0
      items.push({
        id: n.id,
        isFrame: false,
        canvasX: fx + n.x,
        canvasY: fy + n.y,
        width: n.width,
        height: n.height,
        frameOffset: { x: fx, y: fy },
      })
    })

    const minX = Math.min(...items.map((it) => it.canvasX))
    const maxX = Math.max(...items.map((it) => it.canvasX + it.width))
    const minY = Math.min(...items.map((it) => it.canvasY))
    const maxY = Math.max(...items.map((it) => it.canvasY + it.height))
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    let updatedNodes = [...doc.nodes]
    let updatedFrames = [...doc.frames]

    items.forEach((it) => {
      let targetCanvasX = it.canvasX
      let targetCanvasY = it.canvasY

      switch (alignment) {
        case 'left':
          targetCanvasX = minX
          break
        case 'center-h':
          targetCanvasX = Math.round(centerX - it.width / 2)
          break
        case 'right':
          targetCanvasX = maxX - it.width
          break
        case 'top':
          targetCanvasY = minY
          break
        case 'center-v':
          targetCanvasY = Math.round(centerY - it.height / 2)
          break
        case 'bottom':
          targetCanvasY = maxY - it.height
          break
      }

      const localX = targetCanvasX - it.frameOffset.x
      const localY = targetCanvasY - it.frameOffset.y

      if (it.isFrame) {
        updatedFrames = updatedFrames.map((f) => (f.id === it.id ? { ...f, x: localX, y: localY } : f))
      } else {
        updatedNodes = updatedNodes.map((n) => (n.id === it.id ? { ...n, x: localX, y: localY } : n))
      }
    })

    get().recordChange({
      ...doc,
      frames: updatedFrames,
      nodes: updatedNodes,
    })
  },

  distributeSelected: (direction) => {
    const { selectedIds, document: doc } = get()
    if (selectedIds.length < 3) return

    const selectedFrames = doc.frames.filter((f) => selectedIds.includes(f.id) && !f.isLocked && !f.isHidden)
    const selectedNodes = doc.nodes.filter(
      (n) => selectedIds.includes(n.id) && !n.isLocked && !n.isHidden && !selectedIds.includes(n.frameId || '')
    )

    type ItemBounds = {
      id: string
      isFrame: boolean
      canvasX: number
      canvasY: number
      width: number
      height: number
      frameOffset: { x: number; y: number }
    }

    const items: ItemBounds[] = []

    selectedFrames.forEach((f) => {
      items.push({
        id: f.id,
        isFrame: true,
        canvasX: f.x,
        canvasY: f.y,
        width: f.width,
        height: f.height,
        frameOffset: { x: 0, y: 0 },
      })
    })

    selectedNodes.forEach((n) => {
      const parentFrame = n.frameId ? doc.frames.find((f) => f.id === n.frameId) : null
      const fx = parentFrame ? parentFrame.x : 0
      const fy = parentFrame ? parentFrame.y : 0
      items.push({
        id: n.id,
        isFrame: false,
        canvasX: fx + n.x,
        canvasY: fy + n.y,
        width: n.width,
        height: n.height,
        frameOffset: { x: fx, y: fy },
      })
    })

    if (items.length < 3) return

    let updatedNodes = [...doc.nodes]
    let updatedFrames = [...doc.frames]

    if (direction === 'horizontal') {
      items.sort((a, b) => a.canvasX - b.canvasX)

      const first = items[0]
      const last = items[items.length - 1]
      const startX = first.canvasX
      const endX = last.canvasX + last.width
      const totalObjectWidth = items.reduce((sum, it) => sum + it.width, 0)
      const availableSpace = endX - startX - totalObjectWidth
      const gap = availableSpace / (items.length - 1)

      let currentX = startX
      items.forEach((it) => {
        const localX = Math.round(currentX - it.frameOffset.x)
        if (it.isFrame) {
          updatedFrames = updatedFrames.map((f) => (f.id === it.id ? { ...f, x: localX } : f))
        } else {
          updatedNodes = updatedNodes.map((n) => (n.id === it.id ? { ...n, x: localX } : n))
        }
        currentX += it.width + gap
      })
    } else {
      items.sort((a, b) => a.canvasY - b.canvasY)

      const first = items[0]
      const last = items[items.length - 1]
      const startY = first.canvasY
      const endY = last.canvasY + last.height
      const totalObjectHeight = items.reduce((sum, it) => sum + it.height, 0)
      const availableSpace = endY - startY - totalObjectHeight
      const gap = availableSpace / (items.length - 1)

      let currentY = startY
      items.forEach((it) => {
        const localY = Math.round(currentY - it.frameOffset.y)
        if (it.isFrame) {
          updatedFrames = updatedFrames.map((f) => (f.id === it.id ? { ...f, y: localY } : f))
        } else {
          updatedNodes = updatedNodes.map((n) => (n.id === it.id ? { ...n, y: localY } : n))
        }
        currentY += it.height + gap
      })
    }

    get().recordChange({
      ...doc,
      frames: updatedFrames,
      nodes: updatedNodes,
    })
  },

  groupSelected: () => {
    const { selectedIds, document: doc } = get()
    const selectedNodes = doc.nodes.filter((n) => selectedIds.includes(n.id))
    if (selectedNodes.length < 2) return

    const groupId = generateId('group')
    const minX = Math.min(...selectedNodes.map((n) => n.x))
    const minY = Math.min(...selectedNodes.map((n) => n.y))
    const maxX = Math.max(...selectedNodes.map((n) => n.x + n.width))
    const maxY = Math.max(...selectedNodes.map((n) => n.y + n.height))

    const groupNode: StudioNode = {
      id: groupId,
      name: `Group ${doc.nodes.filter((n) => n.type === 'group').length + 1}`,
      type: 'group',
      frameId: selectedNodes[0].frameId,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      opacity: 1,
      cornerRadius: 0,
      isLocked: false,
      isHidden: false,
      fill: { type: 'none', color: 'transparent' },
    }

    const updatedNodes = doc.nodes.map((n) => {
      if (selectedIds.includes(n.id)) {
        return { ...n, groupId }
      }
      return n
    })

    get().recordChange({
      ...doc,
      nodes: [...updatedNodes, groupNode],
    })
    set({ selectedIds: [groupId] })
  },

  ungroupSelected: () => {
    const { selectedIds, document: doc } = get()
    const groupIds = new Set(
      doc.nodes.filter((n) => selectedIds.includes(n.id) && n.type === 'group').map((g) => g.id)
    )
    if (groupIds.size === 0) return

    const updatedNodes = doc.nodes
      .filter((n) => !groupIds.has(n.id))
      .map((n) => {
        if (n.groupId && groupIds.has(n.groupId)) {
          return { ...n, groupId: undefined }
        }
        return n
      })

    get().recordChange({
      ...doc,
      nodes: updatedNodes,
    })
  },

  reorderNodes: (newOrderedIds) => {
    const doc = get().document
    const nodeMap = new Map(doc.nodes.map((n) => [n.id, n]))
    const reordered: StudioNode[] = []
    newOrderedIds.forEach((id) => {
      const found = nodeMap.get(id)
      if (found) reordered.push(found)
    })
    // Append any not in reordered list
    doc.nodes.forEach((n) => {
      if (!newOrderedIds.includes(n.id)) reordered.push(n)
    })
    get().recordChange({
      ...doc,
      nodes: reordered,
    })
  },

  reparentNode: (nodeId, targetFrameId, beforeNodeId) => {
    const doc = get().document
    const node = doc.nodes.find((n) => n.id === nodeId)
    if (!node) return

    // Prevent self-parenting, invalid target, or dropping onto oneself
    if (targetFrameId === nodeId || beforeNodeId === nodeId) return

    const targetFrame = targetFrameId ? doc.frames.find((f) => f.id === targetFrameId) : null
    if (targetFrameId && !targetFrame) return

    // If already in target container and no reordering target specified, do nothing
    if (node.frameId === targetFrameId && !beforeNodeId) return

    // 1. Calculate absolute canvas position before reparenting
    const currentFrame = node.frameId ? doc.frames.find((f) => f.id === node.frameId) : null
    const absCanvasX = currentFrame ? currentFrame.x + node.x : node.x
    const absCanvasY = currentFrame ? currentFrame.y + node.y : node.y

    // 2. Calculate new local coordinates in the target container
    const newX = targetFrame ? absCanvasX - targetFrame.x : absCanvasX
    const newY = targetFrame ? absCanvasY - targetFrame.y : absCanvasY

    // 3. Create updated node with preserved properties
    const updatedNode: StudioNode = {
      ...node,
      frameId: targetFrameId,
      x: Math.round(newX),
      y: Math.round(newY),
    }

    // 4. Update document.nodes order
    const remainingNodes = doc.nodes.filter((n) => n.id !== nodeId)
    let newNodes: StudioNode[]

    if (beforeNodeId) {
      const targetIdx = remainingNodes.findIndex((n) => n.id === beforeNodeId)
      if (targetIdx !== -1) {
        newNodes = [
          ...remainingNodes.slice(0, targetIdx),
          updatedNode,
          ...remainingNodes.slice(targetIdx),
        ]
      } else {
        newNodes = [...remainingNodes, updatedNode]
      }
    } else if (targetFrameId) {
      // Place at the end of the target frame's children
      let lastFrameNodeIndex = -1
      for (let i = remainingNodes.length - 1; i >= 0; i--) {
        if (remainingNodes[i].frameId === targetFrameId) {
          lastFrameNodeIndex = i
          break
        }
      }
      if (lastFrameNodeIndex !== -1) {
        newNodes = [
          ...remainingNodes.slice(0, lastFrameNodeIndex + 1),
          updatedNode,
          ...remainingNodes.slice(lastFrameNodeIndex + 1),
        ]
      } else {
        newNodes = [...remainingNodes, updatedNode]
      }
    } else {
      // Root canvas: append to the end of root nodes
      newNodes = [...remainingNodes, updatedNode]
    }

    // 5. Record change for full undo/redo
    get().recordChange({
      ...doc,
      nodes: newNodes,
    })

    // Keep moved node selected
    set({ selectedIds: [nodeId] })
  },

  toggleLock: (id) => {
    const doc = get().document
    const frame = doc.frames.find((f) => f.id === id)
    if (frame) {
      get().updateFrame(id, { isLocked: !frame.isLocked })
      return
    }
    const node = doc.nodes.find((n) => n.id === id)
    if (node) {
      get().updateNode(id, { isLocked: !node.isLocked })
    }
  },

  toggleHide: (id) => {
    const doc = get().document
    const frame = doc.frames.find((f) => f.id === id)
    if (frame) {
      get().updateFrame(id, { isHidden: !frame.isHidden })
      return
    }
    const node = doc.nodes.find((n) => n.id === id)
    if (node) {
      get().updateNode(id, { isHidden: !node.isHidden })
    }
  },

  // 3. Components & Instances
  createComponentFromSelection: () => {
    const { selectedIds, document: doc } = get()
    if (selectedIds.length === 0) return null
    const target = doc.nodes.find((n) => n.id === selectedIds[0])
    if (!target) return null

    const updated = {
      ...target,
      type: 'component' as const,
      component: {
        isMaster: true,
        componentName: target.name || 'Component Master',
        variant: 'Default',
        variantsList: ['Default', 'Variant 2', 'Hover'],
      },
    }
    get().updateNode(target.id, updated)
    return updated
  },

  createInstanceFromMaster: (masterNodeId) => {
    const doc = get().document
    const master = doc.nodes.find((n) => n.id === masterNodeId)
    if (!master) return null

    const instanceNode: StudioNode = {
      ...master,
      id: generateId('node_instance'),
      name: `${master.name} (Instance)`,
      type: 'instance',
      x: master.x + 30,
      y: master.y + 30,
      component: {
        isMaster: false,
        masterId: master.id,
        componentName: master.component?.componentName || master.name,
        variant: master.component?.variant || 'Default',
      },
    }

    get().recordChange({
      ...doc,
      nodes: [...doc.nodes, instanceNode],
    })
    set({ selectedIds: [instanceNode.id] })
    return instanceNode
  },

  detachInstance: (instanceNodeId) => {
    const doc = get().document
    const target = doc.nodes.find((n) => n.id === instanceNodeId)
    if (!target || target.type !== 'instance') return

    const detached: StudioNode = {
      ...target,
      type: 'rectangle', // or original base
      component: undefined,
      name: `${target.name.replace(' (Instance)', '')} Detached`,
    }
    get().updateNode(instanceNodeId, detached)
  },

  // 4. Assets & Images
  loadAssets: async () => {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const list = await loadStudioAssets()
        set({ assets: list })
      }
    } catch {}
  },

  uploadAsset: async (file) => {
    try {
      const processed = await processImageFile(file)
      const asset: StudioAsset = {
        id: generateId('asset'),
        name: processed.name,
        type: processed.type,
        size: processed.size,
        dataUrl: processed.dataUrl,
        width: processed.width,
        height: processed.height,
        createdAt: new Date().toISOString(),
      }
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        try {
          await saveStudioAsset(asset)
        } catch {}
      }
      set((s) => ({ assets: [asset, ...s.assets] }))
      return asset
    } catch (err: any) {
      useUIStore.getState().addToast({
        type: 'error',
        title: 'Image Import Failed',
        description: err.message || 'Failed to import file',
      })
      return null
    }
  },

  importAssetAndPlace: async (file, targetX, targetY) => {
    const asset = await get().uploadAsset(file)
    if (!asset) return null

    // Calculate dimensions preserving aspect ratio
    const naturalWidth = asset.width || 320
    const naturalHeight = asset.height || 240
    let width = naturalWidth
    let height = naturalHeight

    const maxW = 440
    const maxH = 340
    if (width > maxW || height > maxH) {
      const ratio = Math.min(maxW / width, maxH / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    // Determine coordinate placement
    let x = targetX
    let y = targetY
    if (x === undefined || y === undefined) {
      const pan = get().pan
      const zoom = get().zoom
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 1200
      const viewH = typeof window !== 'undefined' ? window.innerHeight : 800
      x = Math.round((viewW / 2 - pan.x) / zoom - width / 2)
      y = Math.round((viewH / 2 - pan.y) / zoom - height / 2)
    }

    // Check if placed inside any existing frame
    const doc = get().document
    const containingFrame = doc.frames.find(
      (f) => x! >= f.x && x! <= f.x + f.width && y! >= f.y && y! <= f.y + f.height
    )

    let nodeX = x
    let nodeY = y
    let frameId: string | null = null

    if (containingFrame) {
      frameId = containingFrame.id
      nodeX = x - containingFrame.x
      nodeY = y - containingFrame.y
    }

    const newNode = get().addNode(
      {
        type: 'image',
        name: asset.name.replace(/\.[^/.]+$/, ''),
        x: nodeX,
        y: nodeY,
        width,
        height,
        fill: { type: 'none', color: 'transparent' },
        image: {
          assetId: asset.id,
          src: asset.dataUrl,
          fit: 'fill',
          aspectRatioLocked: true,
          naturalWidth: asset.width,
          naturalHeight: asset.height,
        },
      },
      frameId
    )

    set({ selectedIds: [newNode.id], activeTool: 'select' })
    return newNode
  },

  deleteAsset: async (id) => {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      try {
        await deleteStudioAsset(id)
      } catch {}
    }
    set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }))
  },

  // 5. Prototyping
  addPrototype: (protoPartial) => {
    const doc = get().document
    const newProto: StudioPrototype = {
      id: generateId('proto'),
      sourceNodeId: protoPartial.sourceNodeId,
      destinationFrameId: protoPartial.destinationFrameId,
      trigger: protoPartial.trigger || 'click',
      action: 'navigate',
      transition: protoPartial.transition || 'instant',
      durationMs: protoPartial.durationMs || 300,
    }
    get().recordChange({
      ...doc,
      prototypes: [...doc.prototypes.filter((p) => p.sourceNodeId !== newProto.sourceNodeId), newProto],
    })
    return newProto
  },

  updatePrototype: (id, updates) => {
    const doc = get().document
    get().recordChange({
      ...doc,
      prototypes: doc.prototypes.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })
  },

  deletePrototype: (id) => {
    const doc = get().document
    get().recordChange({
      ...doc,
      prototypes: doc.prototypes.filter((p) => p.id !== id),
    })
  },
}))
