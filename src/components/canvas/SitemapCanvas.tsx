import React, { useMemo, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  applyNodeChanges,
  NodeChange,
} from '@xyflow/react'
import {
  Plus,
  RotateCcw,
  RotateCw,
  Maximize2,
  Workflow,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useUIStore } from '../../store/useUIStore'
import { PageNode } from './PageNode'

const nodeTypes = {
  pageNode: PageNode as any,
}

export const SitemapCanvas: React.FC = () => {
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

  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Transform project pages into React Flow Nodes
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
        pageSections.some((s) => s.name.toLowerCase().includes(q))

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
        className: isDimmed ? 'opacity-30 transition-opacity pointer-events-none' : 'transition-opacity',
      }
    })
  }, [project, selectedPageId, searchQuery, filterType, filterGroupId])

  // Transform project edges into React Flow Edges
  const edges: Edge[] = useMemo(() => {
    if (!project) return []

    return project.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: isDarkMode ? '#475569' : '#94a3b8',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isDarkMode ? '#64748b' : '#94a3b8',
        width: 16,
        height: 16,
      },
    }))
  }, [project, isDarkMode])

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
      name: 'New Top-Level Page',
      slug: `/page-${(project?.pages.length || 0) + 1}`,
    })
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse text-sm text-slate-500">Loading canvas...</div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onConnect={handleConnect}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handleCanvasClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={2.5}
        defaultViewport={{ x: 100, y: 100, zoom: 0.85 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color={isDarkMode ? '#334155' : '#cbd5e1'}
          gap={24}
          size={1.5}
          className="opacity-60"
        />
        <Controls
          showInteractive={false}
          className="!bottom-4 !left-4 !bg-white dark:!bg-slate-900 !border !border-slate-200 dark:!border-slate-800 !rounded-xl !shadow-md [&>button]:!border-b [&>button]:!border-slate-100 dark:[&>button]:!border-slate-800"
        />
        <MiniMap
          nodeColor={(node: any) => {
            const page = node?.data?.page
            return page?.color || '#3b82f6'
          }}
          nodeStrokeWidth={3}
          maskColor={isDarkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(241, 245, 249, 0.75)'}
          className="!bottom-4 !right-4 !bg-white/80 dark:!bg-slate-900/80 !backdrop-blur !border !border-slate-200 dark:!border-slate-800 !rounded-xl !shadow-md overflow-hidden"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Floating Canvas Quick Actions Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
        <button
          onClick={handleAddRootPage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Page
        </button>

        <button
          onClick={() => setGeneratorOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-medium shadow-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Generator
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          onClick={() => applyAutoLayout('TB')}
          title="Auto-Layout Top-to-Bottom Tree"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Workflow className="w-4 h-4" />
        </button>

        <button
          onClick={() => applyAutoLayout('LR')}
          title="Auto-Layout Left-to-Right Hierarchy"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Layers className="w-4 h-4 rotate-90" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Cmd+Z)"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Cmd+Shift+Z)"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Empty State Banner if no pages */}
      {project.pages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-sm text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
            <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Sitemap is empty
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Create your first page or generate an entire site structure using the AI generator.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleAddRootPage}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
              >
                Add Homepage
              </button>
              <button
                onClick={() => setGeneratorOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700"
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
