import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { ElkSection } from '../../elkjsWorkerGraph'
import ElkSectionsEdge from '../ElkSectionsEdge.vue'

vi.mock('@vue-flow/core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vue-flow/core')>()),
  BaseEdge: {
    props: ['path', 'markerEnd'],
    template: '<path :d="path" :data-marker-end="markerEnd" />'
  }
}))

const section: ElkSection = {
  startPoint: { x: 0, y: 0 },
  bendPoints: [
    { x: 10, y: 20 },
    { x: 30, y: 40 }
  ],
  endPoint: { x: 50, y: 60 }
}

function mountEdge(data: Record<string, unknown>, markerEnd = 'url(#arrow)') {
  return mount(ElkSectionsEdge, {
    props: {
      id: 'edge-1',
      source: 'start',
      target: 'end',
      sourceX: 1,
      sourceY: 2,
      targetX: 3,
      targetY: 4,
      sourcePosition: 'right',
      targetPosition: 'left',
      sourceNode: {},
      targetNode: {},
      type: 'elk-sections',
      markerStart: '',
      events: {},
      data,
      markerEnd
    } as any
  })
}

describe('ElkSectionsEdge', () => {
  it.each(['ORTHOGONAL', 'POLYLINE'] as const)('uses M/L for %s sections', (edgeRouting) => {
    const wrapper = mountEdge({ sections: [section], edgeRouting })

    expect(wrapper.find('path').attributes('d')).toBe('M 0,0 L 10,20 L 30,40 L 50,60')
  })

  it('uses cubic C commands for complete SPLINES control points', () => {
    const wrapper = mountEdge({ sections: [section], edgeRouting: 'SPLINES' })

    expect(wrapper.find('path').attributes('d')).toBe('M 0,0 C 10,20 30,40 50,60')
  })

  it('falls back to M/L for incomplete SPLINES control points', () => {
    const wrapper = mountEdge({
      sections: [{ ...section, bendPoints: [{ x: 10, y: 20 }] }],
      edgeRouting: 'SPLINES'
    })

    expect(wrapper.find('path').attributes('d')).toBe('M 0,0 L 10,20 L 50,60')
  })

  it('uses source and target coordinates only when sections are empty', () => {
    const wrapper = mountEdge({ sections: [], edgeRouting: 'ORTHOGONAL' })

    expect(wrapper.find('path').attributes('d')).toBe('M 1,2 L 3,4')
  })

  it('uses section start and end points when bendPoints are absent', () => {
    const wrapper = mountEdge({
      sections: [{ startPoint: { x: 10, y: 20 }, endPoint: { x: 30, y: 40 } }],
      edgeRouting: 'ORTHOGONAL'
    })

    expect(wrapper.find('path').attributes('d')).toBe('M 10,20 L 30,40')
  })

  it('forwards markerEnd unchanged to BaseEdge', () => {
    const wrapper = mountEdge(
      { sections: [section], edgeRouting: 'ORTHOGONAL' },
      'url(#closed-arrow)'
    )

    expect(wrapper.find('path').attributes('data-marker-end')).toBe('url(#closed-arrow)')
  })
})
