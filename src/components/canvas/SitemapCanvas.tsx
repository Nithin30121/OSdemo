import React, { useMemo, useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  MarkerType,
  NodeChange,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import {
  Plus,
  RotateCcw,
  RotateCw,
  Maximize2,
  Workflow,
  Sparkles,
  Layers,
  Focus,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { PageNode } from './PageNode'
import { calculateNodeHeight } from './layoutUtils'

const nodeTypes = {
  pageNode: PageNode as any,
}

const CanvasInner: React.FC = () => {
  const project = useProjectStore((s) => s.project)
  const addPage = useProjectStore((s) => s.addPage)
  const connectPages = useProjectStore((s) => s.connectPages)
  const removeEdge = useProjectStore((s) => s.removeEdge)
  const batchUpdatePositions = useProjectStore((s) => s.batchUpdatePositions)
  const applyAutoLayout = useProjectStore((s) => s.applyAutoLayout)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const canUndo = useProjectStore((s) => s.canUndo())
  const canRedo = useProjectStore((s) => s.canRedo())

  const selectedPageId = useUIStore((s) => s.selectedPageId)
  const setSelectedPageId = useUIStore((s) => s.setSelectedPageId)
  const setGeneratorOpen = useUIStore((s) => s.setGeneratorOpen)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const filterGroupId = useUIStore((s) => s.filterGroupId)
  const theme = useUIStore((s) => s.theme)

  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow()
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB')

  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Transform project pages into React Flow Nodes with dynamic height awareness
  const nodes: Node[] = useMemo(() => {
    if (!project) return []

    const q = searchQuery.toLowerCase().trim()

    return project.pages.map((page) => {
      const pageSections = project.sections.filter((s) => s.pageId === page.id)
      const isSelected = selectedPageId === page.id

      // Search match
      const matchesSearch =
        !q ||
        page.name.toLowerCase().includes(q) ||
        page.slug.toLowerCase().includes(q) ||
        pageSections.some((s) => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)))

      // Filter type match
      const matchesType = filterType === 'all' || page.type === filterType

      // Filter group match
      const matchesGroup = filterGroupId === 'all' || page.groupId === filterGroupId

      const isDimmed = !matchesSearch || !matchesType || !matchesGroup

      return {
        id: page.id,
        type: 'pageNode',
        position: page.position,
        data: {
          page,
          sections: pageSections,
          isSelected,
        },
        className: isDimmed ? 'opacity-25 transition-opacity pointer-events-none' : 'transition-opacity',
      }
    })
  }, [project, selectedPageId, searchQuery, filterType, filterGroupId])

  // Transform project edges into clean connecting lines
  const edges: Edge[] = useMemo(() => {
    if (!project) return []

    return project.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: '#64748B',
        strokeWidth: 1.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#64748B',
        width: 12,
        height: 12,
      },
    }))
  }, [project])

  // Node position drag handler
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const positionChanges = changes.filter(
        (c) => c.type === 'position' && (c as any).position && (c as any).dragging,
      )
      if (positionChanges.length > 0) {
        const updates = positionChanges.map((c: any) => ({
          id: c.id,
          position: c.position,
        }))
        batchUpdatePositions(updates)
      }
    },
    [batchUpdatePositions],
  )

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        connectPages(connection.source, connection.target)
      }
    },
    [connectPages],
  )

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (confirm('Disconnect these two pages?')) {
        removeEdge(edge.id)
      }
    },
    [removeEdge],
  )

  const handleCanvasClick = useCallback(() => {
    setSelectedPageId(null)
  }, [setSelectedPageId])

  const handleAddRootPage = () => {
    addPage({
      name: 'New Page',
      slug: `/page-${(project?.pages.length || 0) + 1}`,
    })
  }

  const handleAutoLayout = useCallback(
    (direction?: 'TB' | 'LR') => {
      const d = direction || layoutDirection
      applyAutoLayout(d)
      setTimeout(() => {
        fitView({ padding: 0.15, maxZoom: 1.0 })
      }, 50)
    },
    [applyAutoLayout, fitView, layoutDirection],
  )

  const handleCenterSelected = useCallback(() => {
    if (!selectedPageId || !project) return
    const page = project.pages.find((p) => p.id === selectedPageId)
    if (!page) return
    const height = calculateNodeHeight(page, project.sections)
    setCenter(page.position.x + 135, page.position.y + height / 2, { duration: 350, zoom: 1.0 })
  }, [selectedPageId, project, setCenter])

  // Global canvas shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName
      if (['INPUT', 'TEXTAREA'].includes(targetTag)) return

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (canUndo) undo()
      } else if (
        (e.metaKey || e.ctrlKey) &&
        ((e.shiftKey && e.key.toLowerCase() === 'z') || e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault()
        if (canRedo) redo()
      } else if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault()
        fitView({ padding: 0.15, maxZoom: 1.0 })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undo, redo, fitView])

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse text-sm text-slate-500">Loading canvas...</div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 h-full w-full bg-[#030817] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onConnect={handleConnect}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handleCanvasClick}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.0 }}
        minZoom={0.2}
        maxZoom={2.0}
        defaultViewport={{ x: 60, y: 60, zoom: 0.95 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#1B263B"
          gap={74}
          size={3.5}
          className="opacity-75"
        />
        <Controls
          showInteractive={false}
          className="!bottom-4 !left-4 !bg-[#2B2B2B] !border !border-[#3B3B3B] !rounded-xl !shadow-xl [&>button]:!bg-[#2B2B2B] [&>button]:!text-[#F3F3F3] [&>button]:!border-b [&>button]:!border-[#3B3B3B] hover:[&>button]:!bg-[#353535]"
        />
        <MiniMap
          nodeColor={(node: any) => {
            const page = node?.data?.page
            return page?.color ? '#1769E8' : '#873FF0'
          }}
          nodeStrokeWidth={2}
          maskColor="rgba(32, 32, 32, 0.85)"
          className="!bottom-4 !right-4 !bg-[#252525]/90 !backdrop-blur !border !border-[#3B3B3B] !rounded-xl !shadow-xl overflow-hidden"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Empty State Banner if no pages */}
      {project.pages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-sm text-center p-6 bg-[#252525] border border-[#3B3B3B] rounded-2xl shadow-2xl">
            <Layers className="w-10 h-10 text-[#B0B0B0] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#F3F3F3]">
              Sitemap is empty
            </h3>
            <p className="text-xs text-[#B0B0B0] mt-1 mb-4">
              Create your first page or generate an entire site structure using the AI generator.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleAddRootPage}
                className="px-3.5 py-1.5 rounded-lg bg-[#1769E8] text-white text-xs font-semibold hover:bg-[#155ECC]"
              >
                Add Homepage
              </button>
              <button
                onClick={() => setGeneratorOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#873FF0] text-white text-xs font-semibold hover:bg-[#7834E0]"
              >
                Generate Sitemap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const SitemapCanvas: React.FC = () => {
  return <CanvasInner />
}

