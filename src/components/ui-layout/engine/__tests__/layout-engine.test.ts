import { describe, expect, it } from 'vitest'

import type { LayoutNode } from '../../domain'
import { createContainerNode, createPanelNode, createSplitNode } from '../../domain'
import { isContainerNode, isSplitNode } from '../../domain'
import { activatePanel } from '../actions/activate-panel'
import { addPanel } from '../actions/add-panel'
import { closePanel } from '../actions/close-panel'
import { resizeNode } from '../actions/resize'
import { splitNode } from '../actions/split'
import { findParent, getNode } from '../layout-engine'

function makeTestLayout(): LayoutNode {
  const p1 = createPanelNode('p1', 'viewer')
  const c1 = createContainerNode('c1', 'tabs', [p1], 'p1')
  const p2 = createPanelNode('p2', 'properties')
  const c2 = createContainerNode('c2', 'tabs', [p2], 'p2')
  return createSplitNode('root', 'horizontal', [c1, c2])
}

describe('layout-engine', () => {
  describe('getNode', () => {
    it('finds node by id', () => {
      const root = makeTestLayout()
      const found = getNode(root, 'c1')
      expect(found).toBeDefined()
      expect(found!.id).toBe('c1')
    })

    it('returns null for unknown id', () => {
      const root = makeTestLayout()
      expect(getNode(root, 'nonexistent')).toBeNull()
    })
  })

  describe('resizeNode', () => {
    it('resizes children of a split node', () => {
      const root = makeTestLayout()
      const newSizes = [
        { type: 'ratio' as const, value: 3 },
        { type: 'ratio' as const, value: 1 }
      ]
      const next = resizeNode(root, 'root', newSizes)
      if (!isSplitNode(next)) throw new Error('expected split')
      expect(next.sizes).toEqual(newSizes)
    })
  })

  describe('splitNode', () => {
    it('replaces a ContainerNode with a wrapped SplitNode', () => {
      const root = makeTestLayout()
      const next = splitNode(root, 'c1', 'vertical')
      const parent = findParent(next, 'c1')
      expect(parent).not.toBeNull()
      if (!parent) throw new Error('expected parent')
      expect(isSplitNode(parent)).toBe(true)
      if (!isSplitNode(parent)) throw new Error('expected split')
      expect(parent.direction).toBe('vertical')
      expect(parent.children).toHaveLength(2)
      expect(parent.children.some((c) => c.id === 'c1')).toBe(true)
    })
  })

  describe('closePanel', () => {
    it('removes a panel from ContainerNode', () => {
      const p1 = createPanelNode('p1', 'viewer')
      const p2 = createPanelNode('p2', 'console')
      const container = createContainerNode('c1', 'tabs', [p1, p2], 'p1')
      const next = closePanel(container, 'c1', 'p1')
      if (!isContainerNode(next)) throw new Error('expected container')
      expect(next.panels).toHaveLength(1)
      expect(next.activeId).toBe('p2')
    })
  })

  describe('addPanel', () => {
    it('adds a new panel to ContainerNode', () => {
      const p1 = createPanelNode('p1', 'viewer')
      const container = createContainerNode('c1', 'tabs', [p1], 'p1')
      const p2 = createPanelNode('p2', 'console')
      const next = addPanel(container, 'c1', p2)
      if (!isContainerNode(next)) throw new Error('expected container')
      expect(next.panels).toHaveLength(2)
      expect(next.activeId).toBe('p2')
    })
  })

  describe('activatePanel', () => {
    it('changes active panel', () => {
      const p1 = createPanelNode('p1', 'viewer')
      const p2 = createPanelNode('p2', 'console')
      const container = createContainerNode('c1', 'tabs', [p1, p2], 'p1')
      const next = activatePanel(container, 'c1', 'p2')
      if (!isContainerNode(next)) throw new Error('expected container')
      expect(next.activeId).toBe('p2')
    })
  })
})
