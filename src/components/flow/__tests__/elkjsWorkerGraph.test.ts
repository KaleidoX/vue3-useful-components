import { describe, expect, it } from 'vitest'
import type { ElkNode } from 'elkjs/lib/elk-api.js'
import {
  DEFAULT_LAYOUT_CONTROLS,
  DIRECTION_VALUES,
  EDGE_ROUTING_VALUES,
  LAYER_SPACING_VALUES,
  NODE_SPACING_VALUES,
  createElkWorkerGraph,
  toLayoutOptions,
  toVueFlowGraph
} from '../elkjsWorkerGraph'

describe('elkjsWorkerGraph', () => {
  it('creates the fixed six-node, six-edge graph with ELK dimensions', () => {
    const graph = createElkWorkerGraph(DEFAULT_LAYOUT_CONTROLS)

    expect(
      graph.children?.map((node) => ({
        id: node.id,
        width: node.width,
        height: node.height,
        labels: node.labels
      }))
    ).toEqual([
      { id: 'start', width: 160, height: 56, labels: [{ text: '开始' }] },
      { id: 'validate', width: 160, height: 56, labels: [{ text: '校验请求' }] },
      { id: 'review', width: 160, height: 56, labels: [{ text: '人工审核' }] },
      { id: 'approve', width: 160, height: 56, labels: [{ text: '审核通过' }] },
      { id: 'reject', width: 160, height: 56, labels: [{ text: '审核驳回' }] },
      { id: 'notify', width: 160, height: 56, labels: [{ text: '发送通知' }] }
    ])
    expect(
      graph.edges?.map((edge) => ({ id: edge.id, sources: edge.sources, targets: edge.targets }))
    ).toEqual([
      { id: 'start-validate', sources: ['start'], targets: ['validate'] },
      { id: 'validate-review', sources: ['validate'], targets: ['review'] },
      { id: 'review-approve', sources: ['review'], targets: ['approve'] },
      { id: 'review-reject', sources: ['review'], targets: ['reject'] },
      { id: 'approve-notify', sources: ['approve'], targets: ['notify'] },
      { id: 'reject-notify', sources: ['reject'], targets: ['notify'] }
    ])
  })

  it('exposes the complete set of valid control values', () => {
    expect(DIRECTION_VALUES).toEqual(['RIGHT', 'LEFT', 'DOWN', 'UP'])
    expect(EDGE_ROUTING_VALUES).toEqual(['ORTHOGONAL', 'POLYLINE', 'SPLINES'])
    expect(NODE_SPACING_VALUES).toEqual([20, 40, 60, 80])
    expect(LAYER_SPACING_VALUES).toEqual([40, 60, 80, 120])
  })

  it.each([
    [{ direction: 'RIGHT' as const }, 'elk.direction', 'RIGHT'],
    [{ edgeRouting: 'SPLINES' as const }, 'elk.edgeRouting', 'SPLINES'],
    [{ nodeSpacing: 60 as const }, 'elk.spacing.nodeNode', '60'],
    [{ layerSpacing: 120 as const }, 'elk.layered.spacing.nodeNodeBetweenLayers', '120']
  ])('maps a control to its precise ELK option', (change, optionId, value) => {
    expect(toLayoutOptions({ ...DEFAULT_LAYOUT_CONTROLS, ...change })).toMatchObject({
      'elk.algorithm': 'layered',
      [optionId]: value
    })
  })

  it('maps ELK coordinates and sections to non-draggable flow data', () => {
    const { nodes, edges } = toVueFlowGraph(
      {
        id: 'root',
        children: [{ id: 'start', x: 12, y: 34 }],
        edges: [
          {
            id: 'start-validate',
            sources: ['start'],
            targets: ['validate'],
            sections: [
              {
                id: 'section-start-validate',
                startPoint: { x: 172, y: 62 },
                bendPoints: [{ x: 200, y: 62 }],
                endPoint: { x: 240, y: 62 }
              }
            ]
          }
        ]
      } satisfies ElkNode,
      'ORTHOGONAL'
    )

    expect(nodes).toEqual([
      expect.objectContaining({
        id: 'start',
        position: { x: 12, y: 34 },
        width: 160,
        height: 56,
        draggable: false,
        data: { label: '开始' }
      })
    ])
    expect(edges).toEqual([
      expect.objectContaining({
        id: 'start-validate',
        type: 'elk-sections',
        source: 'start',
        target: 'validate',
        data: {
          edgeRouting: 'ORTHOGONAL',
          sections: [
            {
              startPoint: { x: 172, y: 62 },
              bendPoints: [{ x: 200, y: 62 }],
              endPoint: { x: 240, y: 62 }
            }
          ]
        }
      })
    ])
  })
})

// @ts-expect-error edge routing is limited to ELK's supported controls.
toLayoutOptions({ ...DEFAULT_LAYOUT_CONTROLS, edgeRouting: 'CURVE' })

// @ts-expect-error node spacing is limited to the displayed values.
toLayoutOptions({ ...DEFAULT_LAYOUT_CONTROLS, nodeSpacing: 30 })
