import type { ElkEdgeSection, ElkExtendedEdge, ElkNode, ElkPoint } from 'elkjs/lib/elk-api.js'

export const DIRECTION_VALUES = ['RIGHT', 'LEFT', 'DOWN', 'UP'] as const
export const EDGE_ROUTING_VALUES = ['ORTHOGONAL', 'POLYLINE', 'SPLINES'] as const
export const NODE_SPACING_VALUES = [20, 40, 60, 80] as const
export const LAYER_SPACING_VALUES = [40, 60, 80, 120] as const

export interface LayoutControls {
  direction: (typeof DIRECTION_VALUES)[number]
  edgeRouting: (typeof EDGE_ROUTING_VALUES)[number]
  nodeSpacing: (typeof NODE_SPACING_VALUES)[number]
  layerSpacing: (typeof LAYER_SPACING_VALUES)[number]
}

export interface ElkSection {
  startPoint: ElkPoint
  bendPoints?: ElkPoint[]
  endPoint: ElkPoint
}

export interface ElkLayoutApi {
  layout(graph: ElkNode): Promise<ElkNode>
  terminateWorker(): void
}

export interface ElkFlowNode {
  id: string
  position: ElkPoint
  width: number
  height: number
  draggable: false
  data: { label: string }
}

export interface ElkFlowEdge {
  id: string
  source: string
  target: string
  type: 'elk-sections'
  data: { sections: ElkSection[]; edgeRouting: LayoutControls['edgeRouting'] }
}

export const DEFAULT_LAYOUT_CONTROLS: LayoutControls = {
  direction: 'RIGHT',
  edgeRouting: 'ORTHOGONAL',
  nodeSpacing: 40,
  layerSpacing: 80
}

const NODE_WIDTH = 160
const NODE_HEIGHT = 56

const FIXED_NODES = [
  { id: 'start', label: '开始' },
  { id: 'validate', label: '校验请求' },
  { id: 'review', label: '人工审核' },
  { id: 'approve', label: '审核通过' },
  { id: 'reject', label: '审核驳回' },
  { id: 'notify', label: '发送通知' }
] as const

const FIXED_EDGES = [
  { id: 'start-validate', source: 'start', target: 'validate' },
  { id: 'validate-review', source: 'validate', target: 'review' },
  { id: 'review-approve', source: 'review', target: 'approve' },
  { id: 'review-reject', source: 'review', target: 'reject' },
  { id: 'approve-notify', source: 'approve', target: 'notify' },
  { id: 'reject-notify', source: 'reject', target: 'notify' }
] as const

const labelsById = new Map<string, string>(FIXED_NODES.map((node) => [node.id, node.label]))
const endpointsByEdgeId = new Map<string, { source: string; target: string }>(
  FIXED_EDGES.map((edge) => [edge.id, edge])
)

export function toLayoutOptions(controls: LayoutControls): Record<string, string> {
  return {
    'elk.algorithm': 'layered',
    'elk.direction': controls.direction,
    'elk.edgeRouting': controls.edgeRouting,
    'elk.spacing.nodeNode': String(controls.nodeSpacing),
    'elk.layered.spacing.nodeNodeBetweenLayers': String(controls.layerSpacing)
  }
}

export function createElkWorkerGraph(controls: LayoutControls): ElkNode {
  return {
    id: 'root',
    layoutOptions: toLayoutOptions(controls),
    children: FIXED_NODES.map((node) => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      labels: [{ text: node.label }]
    })),
    edges: FIXED_EDGES.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }))
  }
}

export function toVueFlowGraph(
  layout: ElkNode,
  edgeRouting: LayoutControls['edgeRouting']
): { nodes: ElkFlowNode[]; edges: ElkFlowEdge[] } {
  const nodes = (layout.children ?? []).map((node) => ({
    id: node.id,
    position: { x: node.x ?? 0, y: node.y ?? 0 },
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    draggable: false as const,
    data: { label: labelsById.get(node.id) ?? node.id }
  }))

  const edges = (layout.edges ?? []).flatMap((edge) => toFlowEdge(edge, edgeRouting))

  return { nodes, edges }
}

function toFlowEdge(
  edge: ElkExtendedEdge,
  edgeRouting: LayoutControls['edgeRouting']
): ElkFlowEdge[] {
  const endpoints = endpointsByEdgeId.get(edge.id)
  if (!endpoints) return []

  return [
    {
      id: edge.id,
      source: endpoints.source,
      target: endpoints.target,
      type: 'elk-sections',
      data: {
        sections: (edge.sections ?? []).map(toElkSection),
        edgeRouting
      }
    }
  ]
}

function toElkSection(section: ElkEdgeSection): ElkSection {
  return {
    startPoint: section.startPoint,
    bendPoints: section.bendPoints,
    endPoint: section.endPoint
  }
}
