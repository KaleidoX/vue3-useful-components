import { describe, expect, it } from 'vitest'

import { isContainerNode, isPanelNode, isSplitNode } from '../../domain'
import { createContainerNode, createPanelNode, createSplitNode } from '../../domain'

describe('type guards', () => {
  it('isSplitNode identifies SplitNode', () => {
    const node = createSplitNode('s1', 'horizontal', [])
    expect(isSplitNode(node)).toBe(true)
    expect(isContainerNode(node)).toBe(false)
    expect(isPanelNode(node)).toBe(false)
  })

  it('isContainerNode identifies ContainerNode', () => {
    const node = createContainerNode('t1', 'tabs', [], '')
    expect(isContainerNode(node)).toBe(true)
    expect(isSplitNode(node)).toBe(false)
    expect(isPanelNode(node)).toBe(false)
  })

  it('isPanelNode identifies PanelNode', () => {
    const node = createPanelNode('p1', 'test-component')
    expect(isPanelNode(node)).toBe(true)
    expect(isSplitNode(node)).toBe(false)
    expect(isContainerNode(node)).toBe(false)
  })
})

describe('defaults', () => {
  it('createSplitNode generates valid SplitNode', () => {
    const child = createContainerNode('t1', 'single', [], '')
    const node = createSplitNode('root', 'horizontal', [child])
    expect(node.id).toBe('root')
    expect(node.type).toBe('split')
    expect(node.direction).toBe('horizontal')
    expect(node.children).toHaveLength(1)
    expect(node.sizes).toEqual([{ type: 'ratio', value: 1 }])
  })

  it('createContainerNode generates valid ContainerNode', () => {
    const panel = createPanelNode('p1', 'viewer')
    const node = createContainerNode('t1', 'tabs', [panel], 'p1')
    expect(node.id).toBe('t1')
    expect(node.type).toBe('tabs')
    expect(node.panels).toHaveLength(1)
    expect(node.activeId).toBe('p1')
  })

  it('createPanelNode generates valid PanelNode', () => {
    const node = createPanelNode('p1', 'canvas-viewer', { filePath: '/test.stp' })
    expect(node.id).toBe('p1')
    expect(node.componentType).toBe('canvas-viewer')
    expect(node.props).toEqual({ filePath: '/test.stp' })
  })
})
