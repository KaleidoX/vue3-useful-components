import { describe, expect, it } from 'vitest'

import { createContainerNode, createPanelNode, createSplitNode } from '../../domain'
import { validateLayout } from '../validate'

describe('validateLayout', () => {
  it('validates a correct layout', () => {
    const p1 = createPanelNode('p1', 'viewer')
    const c1 = createContainerNode('c1', 'tabs', [p1], 'p1')
    const p2 = createPanelNode('p2', 'console')
    const c2 = createContainerNode('c2', 'tabs', [p2], 'p2')
    const root = createSplitNode('root', 'horizontal', [c1, c2])
    const errors = validateLayout(root)
    expect(errors).toEqual([])
  })

  it('reports error for panel as direct layout child', () => {
    const badRoot = {
      id: 'root',
      type: 'split',
      direction: 'horizontal' as const,
      children: [{ id: 'p1', type: 'panel', componentType: 'viewer' }],
      sizes: [{ type: 'ratio' as const, value: 1 }]
    }
    const errors = validateLayout(badRoot as any)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('reports error for unknown node type', () => {
    const badNode = { id: 'x', type: 'unknown' }
    const errors = validateLayout(badNode as any)
    expect(errors.length).toBeGreaterThan(0)
  })
})
