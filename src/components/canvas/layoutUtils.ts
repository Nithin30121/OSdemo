import dagre from 'dagre'
import { Page, Section, CanvasEdge } from '../../types'

export const NODE_WIDTH = 245

/**
 * Calculates the dynamic height of a page card based on its actual section count and text content.
 */
export function calculateNodeHeight(page: Page, sections: Section[]): number {
  const pageSections = sections.filter((s) => s.pageId === page.id)
  
  // Base header height: padding + category tag + large bold condensed title
  let height = 68

  if (pageSections.length === 0) {
    height += 44 // Empty state placeholder row
  } else {
    pageSections.forEach((sec) => {
      let rowHeight = 30
      if (sec.description && sec.description.trim().length > 0) {
        const charLen = sec.description.trim().length
        const lines = Math.min(3, Math.max(1, Math.ceil(charLen / 28)))
        rowHeight += lines * 14 + 4
      }
      height += rowHeight + 6 // 6px gap between stacked sections
    })
  }

  // Card bottom padding & handle space
  height += 14

  return Math.max(110, height)
}

/**
 * Hierarchical tree layout using Dagre, accounting for dynamic node heights.
 */
export function getLayoutedElements(
  pages: Page[],
  edges: CanvasEdge[],
  direction: 'TB' | 'LR' = 'TB',
  sections?: Section[],
): { pages: Page[]; edges: CanvasEdge[] } {
  if (pages.length === 0) {
    return { pages, edges }
  }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({
    rankdir: direction,
    // Spacing between sibling nodes on the same level
    nodesep: isHorizontal ? 55 : 46,
    // Spacing between hierarchy levels (parent bottom to children top)
    ranksep: isHorizontal ? 80 : 75,
    align: 'UL',
  })

  // Set each node with its actual dynamic height
  pages.forEach((page) => {
    const height = sections ? calculateNodeHeight(page, sections) : 220
    dagreGraph.setNode(page.id, { width: NODE_WIDTH, height })
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

    const height = sections ? calculateNodeHeight(page, sections) : 220

    // Shift anchor from center to top-left for React Flow
    return {
      ...page,
      position: {
        x: Math.round(nodeWithPosition.x - NODE_WIDTH / 2),
        y: Math.round(nodeWithPosition.y - height / 2),
      },
    }
  })

  return { pages: layoutedPages, edges }
}
