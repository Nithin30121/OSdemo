import { StudioNode, StudioFrame } from '../../types/studio'

export interface SmartGuideLine {
  id: string
  orientation: 'horizontal' | 'vertical'
  position: number // Canvas X for vertical guide, Canvas Y for horizontal guide
  start: number    // Min along perpendicular axis
  end: number      // Max along perpendicular axis
  label?: string
}

export interface SmartSpacingGuide {
  id: string
  orientation: 'horizontal' | 'vertical'
  start: { x: number; y: number }
  end: { x: number; y: number }
  distance: number
}

export interface SmartGuidesState {
  lines: SmartGuideLine[]
  spacings: SmartSpacingGuide[]
}

export interface SnapTargetInput {
  id: string
  x: number // Proposed canvas coordinate
  y: number // Proposed canvas coordinate
  width: number
  height: number
  frameId?: string | null
}

export interface SnappingOptions {
  zoom: number
  screenThreshold?: number // Default: 8 screen pixels
  isBypassed?: boolean     // True if Option/Alt key is pressed or snapping is disabled
  snapToFrames?: boolean   // Default: true
  snapToObjects?: boolean  // Default: true
  snapToEqualSpacing?: boolean // Default: true
}

export interface SnappingResult {
  snappedX: number
  snappedY: number
  hasSnappedX: boolean
  hasSnappedY: boolean
  guides: SmartGuidesState
}

interface CandidateRect {
  id: string
  x: number
  y: number
  width: number
  height: number
  frameId?: string | null
  isFrame: boolean
  name?: string
}

interface SnapCandidateX {
  snappedX: number
  delta: number
  screenDelta: number
  targetPointType: 'left' | 'center' | 'right'
  candPointType: 'left' | 'center' | 'right'
  guideX: number
  cand: CandidateRect
  isCenter: boolean
  isEqualSpacing?: boolean
  spacingGuides?: SmartSpacingGuide[]
}

interface SnapCandidateY {
  snappedY: number
  delta: number
  screenDelta: number
  targetPointType: 'top' | 'center' | 'bottom'
  candPointType: 'top' | 'center' | 'bottom'
  guideY: number
  cand: CandidateRect
  isCenter: boolean
  isEqualSpacing?: boolean
  spacingGuides?: SmartSpacingGuide[]
}

/**
 * Deterministic magnetic snapping and smart guides calculation engine.
 * Computes snaps in canvas document space and converts screen thresholds by zoom.
 */
export function calculateSnapping(
  target: SnapTargetInput,
  allNodes: StudioNode[],
  allFrames: StudioFrame[],
  options: SnappingOptions
): SnappingResult {
  const {
    zoom,
    screenThreshold = 8,
    isBypassed = false,
    snapToFrames = true,
    snapToObjects = true,
    snapToEqualSpacing = true,
  } = options

  // If bypassed via Option key or toggle, return raw coordinates with no guides
  if (isBypassed || zoom <= 0) {
    return {
      snappedX: target.x,
      snappedY: target.y,
      hasSnappedX: false,
      hasSnappedY: false,
      guides: { lines: [], spacings: [] },
    }
  }

  const thresholdDoc = screenThreshold / zoom

  // 1. Gather all eligible snapping candidate rectangles in absolute canvas space
  const candidates: CandidateRect[] = []

  // A. Frames (edges and centers)
  if (snapToFrames) {
    allFrames.forEach((frame) => {
      if (frame.isHidden || frame.isLocked) return
      if (frame.id === target.id) return

      candidates.push({
        id: frame.id,
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        frameId: null,
        isFrame: true,
        name: frame.name,
      })
    })
  }

  // B. Nodes (images, text, shapes, groups)
  if (snapToObjects) {
    allNodes.forEach((node) => {
      if (node.isHidden || node.isLocked) return
      if (node.id === target.id) return

      const parentFrame = node.frameId ? allFrames.find((f) => f.id === node.frameId) : null
      if (parentFrame && (parentFrame.isHidden || parentFrame.isLocked)) return

      const canvasX = parentFrame ? parentFrame.x + node.x : node.x
      const canvasY = parentFrame ? parentFrame.y + node.y : node.y

      candidates.push({
        id: node.id,
        x: canvasX,
        y: canvasY,
        width: node.width,
        height: node.height,
        frameId: node.frameId,
        isFrame: false,
        name: node.name,
      })
    })
  }

  if (candidates.length === 0) {
    return {
      snappedX: target.x,
      snappedY: target.y,
      hasSnappedX: false,
      hasSnappedY: false,
      guides: { lines: [], spacings: [] },
    }
  }

  // 2. Compute X-Axis Alignments
  const targetXPoints: Array<{ type: 'left' | 'center' | 'right'; offset: number }> = [
    { type: 'left', offset: 0 },
    { type: 'center', offset: target.width / 2 },
    { type: 'right', offset: target.width },
  ]

  const xCandidates: SnapCandidateX[] = []

  candidates.forEach((cand) => {
    const candXPoints: Array<{ type: 'left' | 'center' | 'right'; pos: number }> = [
      { type: 'left', pos: cand.x },
      { type: 'center', pos: cand.x + cand.width / 2 },
      { type: 'right', pos: cand.x + cand.width },
    ]

    targetXPoints.forEach((tPt) => {
      const currentTargetPt = target.x + tPt.offset

      candXPoints.forEach((cPt) => {
        const delta = cPt.pos - currentTargetPt
        const absDelta = Math.abs(delta)

        if (absDelta <= thresholdDoc) {
          xCandidates.push({
            snappedX: target.x + delta,
            delta: absDelta,
            screenDelta: absDelta * zoom,
            targetPointType: tPt.type,
            candPointType: cPt.type,
            guideX: cPt.pos,
            cand,
            isCenter: tPt.type === 'center' && cPt.type === 'center',
          })
        }
      })
    })
  })

  // 3. Compute Y-Axis Alignments
  const targetYPoints: Array<{ type: 'top' | 'center' | 'bottom'; offset: number }> = [
    { type: 'top', offset: 0 },
    { type: 'center', offset: target.height / 2 },
    { type: 'bottom', offset: target.height },
  ]

  const yCandidates: SnapCandidateY[] = []

  candidates.forEach((cand) => {
    const candYPoints: Array<{ type: 'top' | 'center' | 'bottom'; pos: number }> = [
      { type: 'top', pos: cand.y },
      { type: 'center', pos: cand.y + cand.height / 2 },
      { type: 'bottom', pos: cand.y + cand.height },
    ]

    targetYPoints.forEach((tPt) => {
      const currentTargetPt = target.y + tPt.offset

      candYPoints.forEach((cPt) => {
        const delta = cPt.pos - currentTargetPt
        const absDelta = Math.abs(delta)

        if (absDelta <= thresholdDoc) {
          yCandidates.push({
            snappedY: target.y + delta,
            delta: absDelta,
            screenDelta: absDelta * zoom,
            targetPointType: tPt.type,
            candPointType: cPt.type,
            guideY: cPt.pos,
            cand,
            isCenter: tPt.type === 'center' && cPt.type === 'center',
          })
        }
      })
    })
  })

  // 4. Equal Spacing Snapping (Horizontal & Vertical)
  if (snapToEqualSpacing && candidates.length >= 2) {
    // A. Horizontal Equal Spacing: pairs with reasonable Y proximity
    const relevantXCands = candidates.filter(
      (c) => Math.abs(c.y + c.height / 2 - (target.y + target.height / 2)) < Math.max(c.height, target.height) * 2 + 200
    )

    for (let i = 0; i < relevantXCands.length; i++) {
      for (let j = 0; j < relevantXCands.length; j++) {
        if (i === j) continue
        const a = relevantXCands[i]
        const b = relevantXCands[j]

        // A is to the left of B
        const aRight = a.x + a.width
        const bLeft = b.x
        const gap = bLeft - aRight

        if (gap >= 4 && gap <= 1200) {
          const midY = (a.y + a.height / 2 + b.y + b.height / 2) / 2

          // Position 1: Target to the right of B (A -> B -> Target)
          const desiredXRight = b.x + b.width + gap
          const deltaRight = desiredXRight - target.x
          if (Math.abs(deltaRight) <= thresholdDoc) {
            xCandidates.push({
              snappedX: desiredXRight,
              delta: Math.abs(deltaRight),
              screenDelta: Math.abs(deltaRight) * zoom,
              targetPointType: 'left',
              candPointType: 'right',
              guideX: desiredXRight,
              cand: b,
              isCenter: false,
              isEqualSpacing: true,
              spacingGuides: [
                {
                  id: `space-h-${a.id}-${b.id}`,
                  orientation: 'horizontal',
                  start: { x: aRight, y: midY },
                  end: { x: bLeft, y: midY },
                  distance: Math.round(gap),
                },
                {
                  id: `space-h-${b.id}-target`,
                  orientation: 'horizontal',
                  start: { x: b.x + b.width, y: midY },
                  end: { x: desiredXRight, y: midY },
                  distance: Math.round(gap),
                },
              ],
            })
          }

          // Position 2: Target to the left of A (Target -> A -> B)
          const desiredXLeft = a.x - gap - target.width
          const deltaLeft = desiredXLeft - target.x
          if (Math.abs(deltaLeft) <= thresholdDoc) {
            xCandidates.push({
              snappedX: desiredXLeft,
              delta: Math.abs(deltaLeft),
              screenDelta: Math.abs(deltaLeft) * zoom,
              targetPointType: 'right',
              candPointType: 'left',
              guideX: desiredXLeft,
              cand: a,
              isCenter: false,
              isEqualSpacing: true,
              spacingGuides: [
                {
                  id: `space-h-target-${a.id}`,
                  orientation: 'horizontal',
                  start: { x: desiredXLeft + target.width, y: midY },
                  end: { x: a.x, y: midY },
                  distance: Math.round(gap),
                },
                {
                  id: `space-h-${a.id}-${b.id}`,
                  orientation: 'horizontal',
                  start: { x: aRight, y: midY },
                  end: { x: bLeft, y: midY },
                  distance: Math.round(gap),
                },
              ],
            })
          }

          // Position 3: Target centered between A and B
          const spaceBetween = bLeft - aRight
          if (spaceBetween > target.width + 8) {
            const equalGap = (spaceBetween - target.width) / 2
            const desiredXCenter = aRight + equalGap
            const deltaCenter = desiredXCenter - target.x
            if (Math.abs(deltaCenter) <= thresholdDoc) {
              xCandidates.push({
                snappedX: desiredXCenter,
                delta: Math.abs(deltaCenter),
                screenDelta: Math.abs(deltaCenter) * zoom,
                targetPointType: 'left',
                candPointType: 'right',
                guideX: desiredXCenter,
                cand: a,
                isCenter: false,
                isEqualSpacing: true,
                spacingGuides: [
                  {
                    id: `space-h-${a.id}-target`,
                    orientation: 'horizontal',
                    start: { x: aRight, y: midY },
                    end: { x: desiredXCenter, y: midY },
                    distance: Math.round(equalGap),
                  },
                  {
                    id: `space-h-target-${b.id}`,
                    orientation: 'horizontal',
                    start: { x: desiredXCenter + target.width, y: midY },
                    end: { x: bLeft, y: midY },
                    distance: Math.round(equalGap),
                  },
                ],
              })
            }
          }
        }
      }
    }

    // B. Vertical Equal Spacing: pairs with reasonable X proximity
    const relevantYCands = candidates.filter(
      (c) => Math.abs(c.x + c.width / 2 - (target.x + target.width / 2)) < Math.max(c.width, target.width) * 2 + 200
    )

    for (let i = 0; i < relevantYCands.length; i++) {
      for (let j = 0; j < relevantYCands.length; j++) {
        if (i === j) continue
        const a = relevantYCands[i]
        const b = relevantYCands[j]

        // A is above B
        const aBottom = a.y + a.height
        const bTop = b.y
        const gap = bTop - aBottom

        if (gap >= 4 && gap <= 1200) {
          const midX = (a.x + a.width / 2 + b.x + b.width / 2) / 2

          // Position 1: Target below B (A -> B -> Target)
          const desiredYBottom = b.y + b.height + gap
          const deltaBottom = desiredYBottom - target.y
          if (Math.abs(deltaBottom) <= thresholdDoc) {
            yCandidates.push({
              snappedY: desiredYBottom,
              delta: Math.abs(deltaBottom),
              screenDelta: Math.abs(deltaBottom) * zoom,
              targetPointType: 'top',
              candPointType: 'bottom',
              guideY: desiredYBottom,
              cand: b,
              isCenter: false,
              isEqualSpacing: true,
              spacingGuides: [
                {
                  id: `space-v-${a.id}-${b.id}`,
                  orientation: 'vertical',
                  start: { x: midX, y: aBottom },
                  end: { x: midX, y: bTop },
                  distance: Math.round(gap),
                },
                {
                  id: `space-v-${b.id}-target`,
                  orientation: 'vertical',
                  start: { x: midX, y: b.y + b.height },
                  end: { x: midX, y: desiredYBottom },
                  distance: Math.round(gap),
                },
              ],
            })
          }

          // Position 2: Target above A (Target -> A -> B)
          const desiredYTop = a.y - gap - target.height
          const deltaTop = desiredYTop - target.y
          if (Math.abs(deltaTop) <= thresholdDoc) {
            yCandidates.push({
              snappedY: desiredYTop,
              delta: Math.abs(deltaTop),
              screenDelta: Math.abs(deltaTop) * zoom,
              targetPointType: 'bottom',
              candPointType: 'top',
              guideY: desiredYTop,
              cand: a,
              isCenter: false,
              isEqualSpacing: true,
              spacingGuides: [
                {
                  id: `space-v-target-${a.id}`,
                  orientation: 'vertical',
                  start: { x: midX, y: desiredYTop + target.height },
                  end: { x: midX, y: a.y },
                  distance: Math.round(gap),
                },
                {
                  id: `space-v-${a.id}-${b.id}`,
                  orientation: 'vertical',
                  start: { x: midX, y: aBottom },
                  end: { x: midX, y: bTop },
                  distance: Math.round(gap),
                },
              ],
            })
          }

          // Position 3: Target centered between A and B
          const spaceBetween = bTop - aBottom
          if (spaceBetween > target.height + 8) {
            const equalGap = (spaceBetween - target.height) / 2
            const desiredYCenter = aBottom + equalGap
            const deltaCenter = desiredYCenter - target.y
            if (Math.abs(deltaCenter) <= thresholdDoc) {
              yCandidates.push({
                snappedY: desiredYCenter,
                delta: Math.abs(deltaCenter),
                screenDelta: Math.abs(deltaCenter) * zoom,
                targetPointType: 'top',
                candPointType: 'bottom',
                guideY: desiredYCenter,
                cand: a,
                isCenter: false,
                isEqualSpacing: true,
                spacingGuides: [
                  {
                    id: `space-v-${a.id}-target`,
                    orientation: 'vertical',
                    start: { x: midX, y: aBottom },
                    end: { x: midX, y: desiredYCenter },
                    distance: Math.round(equalGap),
                  },
                  {
                    id: `space-v-target-${b.id}`,
                    orientation: 'vertical',
                    start: { x: midX, y: desiredYCenter + target.height },
                    end: { x: midX, y: bTop },
                    distance: Math.round(equalGap),
                  },
                ],
              })
            }
          }
        }
      }
    }
  }

  // 5. Select Best Snap X Candidate using Deterministic Ranking
  let bestX: SnapCandidateX | null = null
  if (xCandidates.length > 0) {
    xCandidates.sort((a, b) => {
      // 1. Primary: smallest screen pixel delta
      if (Math.abs(a.screenDelta - b.screenDelta) > 0.01) {
        return a.screenDelta - b.screenDelta
      }
      // 2. Secondary: prefer center alignments
      if (a.isCenter && !b.isCenter) return -1
      if (!a.isCenter && b.isCenter) return 1
      // 3. Tertiary: prefer sibling nodes in same frame
      const aSameFrame = a.cand.frameId === target.frameId
      const bSameFrame = b.cand.frameId === target.frameId
      if (aSameFrame && !bSameFrame) return -1
      if (!aSameFrame && bSameFrame) return 1
      // 4. Quaternary: prefer frame borders
      if (a.cand.isFrame && !b.cand.isFrame) return -1
      if (!a.cand.isFrame && b.cand.isFrame) return 1
      return 0
    })
    bestX = xCandidates[0]
  }

  // 6. Select Best Snap Y Candidate using Deterministic Ranking
  let bestY: SnapCandidateY | null = null
  if (yCandidates.length > 0) {
    yCandidates.sort((a, b) => {
      // 1. Primary: smallest screen pixel delta
      if (Math.abs(a.screenDelta - b.screenDelta) > 0.01) {
        return a.screenDelta - b.screenDelta
      }
      // 2. Secondary: prefer center alignments
      if (a.isCenter && !b.isCenter) return -1
      if (!a.isCenter && b.isCenter) return 1
      // 3. Tertiary: prefer sibling nodes in same frame
      const aSameFrame = a.cand.frameId === target.frameId
      const bSameFrame = b.cand.frameId === target.frameId
      if (aSameFrame && !bSameFrame) return -1
      if (!aSameFrame && bSameFrame) return 1
      // 4. Quaternary: prefer frame borders
      if (a.cand.isFrame && !b.cand.isFrame) return -1
      if (!a.cand.isFrame && b.cand.isFrame) return 1
      return 0
    })
    bestY = yCandidates[0]
  }

  const finalX = bestX ? bestX.snappedX : target.x
  const finalY = bestY ? bestY.snappedY : target.y

  // 7. Build Smart Guides (Lines & Spacing Indicators)
  const guideLines: SmartGuideLine[] = []
  const spacingGuides: SmartSpacingGuide[] = []

  // Vertical Guide Lines (for X snaps)
  if (bestX) {
    if (bestX.isEqualSpacing && bestX.spacingGuides) {
      spacingGuides.push(...bestX.spacingGuides)
    } else {
      // Find all candidates aligned on this guideX
      const matchingCands = xCandidates.filter(
        (c) => !c.isEqualSpacing && Math.abs(c.guideX - bestX!.guideX) < 0.1
      )
      const candRects = matchingCands.map((c) => c.cand)

      const minY = Math.min(finalY, ...candRects.map((c) => c.y))
      const maxY = Math.max(finalY + target.height, ...candRects.map((c) => c.y + c.height))
      const pad = 12 / zoom

      guideLines.push({
        id: `guide-v-${bestX.guideX}`,
        orientation: 'vertical',
        position: bestX.guideX,
        start: minY - pad,
        end: maxY + pad,
      })
    }
  }

  // Horizontal Guide Lines (for Y snaps)
  if (bestY) {
    if (bestY.isEqualSpacing && bestY.spacingGuides) {
      spacingGuides.push(...bestY.spacingGuides)
    } else {
      // Find all candidates aligned on this guideY
      const matchingCands = yCandidates.filter(
        (c) => !c.isEqualSpacing && Math.abs(c.guideY - bestY!.guideY) < 0.1
      )
      const candRects = matchingCands.map((c) => c.cand)

      const minX = Math.min(finalX, ...candRects.map((c) => c.x))
      const maxX = Math.max(finalX + target.width, ...candRects.map((c) => c.x + c.width))
      const pad = 12 / zoom

      guideLines.push({
        id: `guide-h-${bestY.guideY}`,
        orientation: 'horizontal',
        position: bestY.guideY,
        start: minX - pad,
        end: maxX + pad,
      })
    }
  }

  // 8. Live Spacing Measurements to Nearby Objects and Frame Edges
  if (spacingGuides.length === 0) {
    const targetLeft = finalX
    const targetRight = finalX + target.width
    const targetTop = finalY
    const targetBottom = finalY + target.height
    const targetMidX = finalX + target.width / 2
    const targetMidY = finalY + target.height / 2

    const objCandidates = candidates.filter((c) => !c.isFrame)

    // A. Left neighbor distance
    let closestLeft: { cand: CandidateRect; gap: number } | null = null
    objCandidates.forEach((c) => {
      if (c.x + c.width <= targetLeft) {
        const vOverlap = Math.max(targetTop, c.y) < Math.min(targetBottom, c.y + c.height) + 40
        if (vOverlap) {
          const gap = targetLeft - (c.x + c.width)
          if (gap > 1 && gap <= 800 && (!closestLeft || gap < closestLeft.gap)) {
            closestLeft = { cand: c, gap }
          }
        }
      }
    })

    if (closestLeft) {
      const c = (closestLeft as { cand: CandidateRect; gap: number }).cand
      const gap = (closestLeft as { cand: CandidateRect; gap: number }).gap
      const midY = (Math.max(targetTop, c.y) + Math.min(targetBottom, c.y + c.height)) / 2
      spacingGuides.push({
        id: `space-live-left-${c.id}`,
        orientation: 'horizontal',
        start: { x: c.x + c.width, y: midY },
        end: { x: targetLeft, y: midY },
        distance: Math.round(gap),
      })
    }

    // B. Right neighbor distance
    let closestRight: { cand: CandidateRect; gap: number } | null = null
    objCandidates.forEach((c) => {
      if (c.x >= targetRight) {
        const vOverlap = Math.max(targetTop, c.y) < Math.min(targetBottom, c.y + c.height) + 40
        if (vOverlap) {
          const gap = c.x - targetRight
          if (gap > 1 && gap <= 800 && (!closestRight || gap < closestRight.gap)) {
            closestRight = { cand: c, gap }
          }
        }
      }
    })

    if (closestRight) {
      const c = (closestRight as { cand: CandidateRect; gap: number }).cand
      const gap = (closestRight as { cand: CandidateRect; gap: number }).gap
      const midY = (Math.max(targetTop, c.y) + Math.min(targetBottom, c.y + c.height)) / 2
      spacingGuides.push({
        id: `space-live-right-${c.id}`,
        orientation: 'horizontal',
        start: { x: targetRight, y: midY },
        end: { x: c.x, y: midY },
        distance: Math.round(gap),
      })
    }

    // C. Top neighbor distance
    let closestTop: { cand: CandidateRect; gap: number } | null = null
    objCandidates.forEach((c) => {
      if (c.y + c.height <= targetTop) {
        const hOverlap = Math.max(targetLeft, c.x) < Math.min(targetRight, c.x + c.width) + 40
        if (hOverlap) {
          const gap = targetTop - (c.y + c.height)
          if (gap > 1 && gap <= 800 && (!closestTop || gap < closestTop.gap)) {
            closestTop = { cand: c, gap }
          }
        }
      }
    })

    if (closestTop) {
      const c = (closestTop as { cand: CandidateRect; gap: number }).cand
      const gap = (closestTop as { cand: CandidateRect; gap: number }).gap
      const midX = (Math.max(targetLeft, c.x) + Math.min(targetRight, c.x + c.width)) / 2
      spacingGuides.push({
        id: `space-live-top-${c.id}`,
        orientation: 'vertical',
        start: { x: midX, y: c.y + c.height },
        end: { x: midX, y: targetTop },
        distance: Math.round(gap),
      })
    }

    // D. Bottom neighbor distance
    let closestBottom: { cand: CandidateRect; gap: number } | null = null
    objCandidates.forEach((c) => {
      if (c.y >= targetBottom) {
        const hOverlap = Math.max(targetLeft, c.x) < Math.min(targetRight, c.x + c.width) + 40
        if (hOverlap) {
          const gap = c.y - targetBottom
          if (gap > 1 && gap <= 800 && (!closestBottom || gap < closestBottom.gap)) {
            closestBottom = { cand: c, gap }
          }
        }
      }
    })

    if (closestBottom) {
      const c = (closestBottom as { cand: CandidateRect; gap: number }).cand
      const gap = (closestBottom as { cand: CandidateRect; gap: number }).gap
      const midX = (Math.max(targetLeft, c.x) + Math.min(targetRight, c.x + c.width)) / 2
      spacingGuides.push({
        id: `space-live-bottom-${c.id}`,
        orientation: 'vertical',
        start: { x: midX, y: targetBottom },
        end: { x: midX, y: c.y },
        distance: Math.round(gap),
      })
    }

    // E. Distance to parent frame edges if target is inside a frame
    if (target.frameId) {
      const parentFrame = allFrames.find((f) => f.id === target.frameId)
      if (parentFrame) {
        const padLeft = targetLeft - parentFrame.x
        if (padLeft > 2 && padLeft <= 250 && !closestLeft) {
          spacingGuides.push({
            id: `space-live-frame-left-${parentFrame.id}`,
            orientation: 'horizontal',
            start: { x: parentFrame.x, y: targetMidY },
            end: { x: targetLeft, y: targetMidY },
            distance: Math.round(padLeft),
          })
        }

        const padTop = targetTop - parentFrame.y
        if (padTop > 2 && padTop <= 250 && !closestTop) {
          spacingGuides.push({
            id: `space-live-frame-top-${parentFrame.id}`,
            orientation: 'vertical',
            start: { x: targetMidX, y: parentFrame.y },
            end: { x: targetMidX, y: targetTop },
            distance: Math.round(padTop),
          })
        }
      }
    }
  }

  return {
    snappedX: Math.round(finalX),
    snappedY: Math.round(finalY),
    hasSnappedX: !!bestX,
    hasSnappedY: !!bestY,
    guides: {
      lines: guideLines,
      spacings: spacingGuides,
    },
  }
}
