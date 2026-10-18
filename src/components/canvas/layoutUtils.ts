import dagre from 'dagre'
import { Page, CanvasEdge } from '../../types'

const NODE_WIDTH = 280
const NODE_HEIGHT = 200

export function getLayoutedElements(
  pages: Page[],
  edges: CanvasEdge[],
  direction: 'TB' | 'LR' = 'TB',
): { pages: Page[]; edges: CanvasEdge[] } {
  if (pages.length === 0) {
    return { pages, edges }
  }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? 60 : 70,
    ranksep: isHorizontal ? 100 : 90,
    align: 'UL',
  })

  pages.forEach((page) => {
    dagreGraph.setNode(page.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    // Only connect if both source and target exist
    if (pages.some((p) => p.id === edge.source) && pages.some((p) => p.id === edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(dagreGraph)

  const layoutedPages = pages.map((page) => {
    const nodeWithPosition = dagreGraph.node(page.id)
    if (!nodeWithPosition) return page

    // Shift anchor from center to top-left for React Flow
    return {
      ...page,
      position: {
        x: Math.round(nodeWithPosition.x - NODE_WIDTH / 2),
        y: Math.round(nodeWithPosition.y - NODE_HEIGHT / 2),
      },
    }
  })

  return { pages: layoutedPages, edges }
}
