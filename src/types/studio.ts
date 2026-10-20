export type StudioFramePreset =
  | 'desktop'
  | 'macbook'
  | 'iphone'
  | 'android'
  | 'ipad'
  | 'social-square'
  | 'custom'

export interface FramePresetConfig {
  id: StudioFramePreset
  name: string
  width: number
  height: number
  device?: string
}

export const FRAME_PRESETS: FramePresetConfig[] = [
  { id: 'desktop', name: 'Desktop HD', width: 1440, height: 900, device: 'Desktop' },
  { id: 'macbook', name: 'MacBook Pro', width: 1280, height: 800, device: 'Laptop' },
  { id: 'iphone', name: 'iPhone 15 Pro', width: 393, height: 852, device: 'Mobile' },
  { id: 'android', name: 'Android Large', width: 360, height: 800, device: 'Mobile' },
  { id: 'ipad', name: 'iPad Pro 11"', width: 834, height: 1194, device: 'Tablet' },
  { id: 'social-square', name: 'Square Post', width: 1080, height: 1080, device: 'Social' },
]

export type StudioNodeType =
  | 'frame'
  | 'rectangle'
  | 'ellipse'
  | 'polygon'
  | 'line'
  | 'arrow'
  | 'text'
  | 'image'
  | 'drawing'
  | 'group'
  | 'component'
  | 'instance'

export interface StudioFill {
  type: 'solid' | 'gradient' | 'none'
  color: string
  gradientType?: 'linear' | 'radial'
  gradientAngle?: number
  gradientStops?: Array<{ color: string; offset: number }>
}

export interface StudioStroke {
  color: string
  width: number
  style: 'solid' | 'dashed' | 'dotted'
}

export interface StudioShadow {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset?: boolean
}

export interface StudioTextConfig {
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: number | string
  lineHeight: number | string
  letterSpacing: number | string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  color: string
}

export interface StudioImageConfig {
  assetId?: string
  src: string
  fit: 'fill' | 'fit' | 'crop' | 'tile'
  aspectRatioLocked?: boolean
  naturalWidth?: number
  naturalHeight?: number
  crop?: {
    x: number // percentage 0-100
    y: number
    width: number
    height: number
  }
}

export interface StudioDrawingConfig {
  points: Array<{ x: number; y: number }>
  strokeColor: string
  strokeWidth: number
}

export interface StudioPolygonConfig {
  sides: number
  starRatio?: number
}

export interface StudioComponentConfig {
  isMaster: boolean
  masterId?: string
  componentName?: string
  variant?: string
  variantsList?: string[]
}

export interface StudioConstraints {
  horizontal: 'left' | 'right' | 'center' | 'stretch'
  vertical: 'top' | 'bottom' | 'center' | 'stretch'
}

export interface StudioAutoLayout {
  enabled: boolean
  direction: 'horizontal' | 'vertical'
  gap: number
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  alignment: 'start' | 'center' | 'end' | 'space-between'
  hugContents: boolean
}

export interface StudioNode {
  id: string
  name: string
  type: StudioNodeType
  frameId: string | null
  groupId?: string | null
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  cornerRadius: number
  isLocked: boolean
  isHidden: boolean
  fill: StudioFill
  stroke?: StudioStroke
  shadow?: StudioShadow
  text?: StudioTextConfig
  image?: StudioImageConfig
  drawing?: StudioDrawingConfig
  polygon?: StudioPolygonConfig
  component?: StudioComponentConfig
  constraints?: StudioConstraints
}

export interface StudioFrame {
  id: string
  name: string
  preset: StudioFramePreset
  x: number
  y: number
  width: number
  height: number
  background: string
  clipsContent: boolean
  constraints?: StudioConstraints
  autoLayout?: StudioAutoLayout
  isLocked?: boolean
  isHidden?: boolean
}

export type PrototypeTrigger = 'click' | 'hover'
export type PrototypeAction = 'navigate'
export type PrototypeTransition = 'instant' | 'dissolve' | 'slide-left' | 'slide-right'

export interface StudioPrototype {
  id: string
  sourceNodeId: string
  destinationFrameId: string
  trigger: PrototypeTrigger
  action: PrototypeAction
  transition: PrototypeTransition
  durationMs: number
}

export interface StudioAsset {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  createdAt: string
  width?: number
  height?: number
}

export interface StudioDocument {
  version: number
  id: string
  name: string
  frames: StudioFrame[]
  nodes: StudioNode[]
  prototypes: StudioPrototype[]
  updatedAt: string
  assets?: StudioAsset[]
  leftSidebarWidth?: number
  rightSidebarWidth?: number
  canvasBackground?: string
}

export type StudioTool =
  | 'select'
  | 'hand'
  | 'frame'
  | 'rectangle'
  | 'ellipse'
  | 'polygon'
  | 'line'
  | 'arrow'
  | 'text'
  | 'image'
  | 'pen'
  | 'component'
