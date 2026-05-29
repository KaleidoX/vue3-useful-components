import { describe, expect, it } from 'vitest'

import { createContainerNode, createPanelNode, createSplitNode } from '../../domain'
import type { LayoutNode, PanelNode, SplitNode } from '../../domain'
import { activatePanel } from '../../engine/actions/activate-panel'
import { addPanel } from '../../engine/actions/add-panel'
import { closePanel } from '../../engine/actions/close-panel'
import { resizeNode } from '../../engine/actions/resize'
import { findParent, getNode } from '../../engine/layout-engine'

function buildDeepTree(depth: number, leafCount: number): LayoutNode {
  if (depth <= 0) {
    const panels: PanelNode[] = []
    for (let i = 0; i < leafCount; i++) {
      panels.push(createPanelNode(`p_${i}`, 'test'))
    }
    return createContainerNode(`t_deep`, 'tabs', panels, panels[0]?.id ?? '')
  }
  return createSplitNode(`s_${depth}`, depth % 2 === 0 ? 'horizontal' : 'vertical', [
    buildDeepTree(depth - 1, leafCount),
    buildDeepTree(depth - 1, leafCount)
  ])
}

function buildWideTree(children: number, tabsPerLeaf: number): LayoutNode {
  const childrenNodes: LayoutNode[] = []
  for (let i = 0; i < children; i++) {
    const panels: PanelNode[] = []
    for (let j = 0; j < tabsPerLeaf; j++) {
      panels.push(createPanelNode(`p_${i}_${j}`, 'test'))
    }
    childrenNodes.push(createContainerNode(`c_${i}`, 'tabs', panels, panels[0]?.id ?? ''))
  }
  return createSplitNode('wide_root', 'vertical', childrenNodes)
}

function measure(fn: () => void, iterations: number): number {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) fn()
  return performance.now() - start
}

const shallowTree: LayoutNode = createSplitNode('root', 'horizontal', [
  createContainerNode(
    'c1',
    'tabs',
    [createPanelNode('p1', 'viewer'), createPanelNode('p2', 'console')],
    'p1'
  ),
  createContainerNode('c2', 'tabs', [createPanelNode('p3', 'properties')], 'p3')
])

describe('engine performance', () => {
  it('resizeNode < 0.05ms per op', () => {
    const elapsed = measure(
      () =>
        resizeNode(shallowTree, 'root', [
          { type: 'ratio', value: 3 },
          { type: 'ratio', value: 1 }
        ]),
      1000
    )
    expect(elapsed / 1000).toBeLessThan(0.05)
  })

  it('closePanel < 0.05ms per op', () => {
    const elapsed = measure(() => closePanel(shallowTree, 'c1', 'p1'), 1000)
    expect(elapsed / 1000).toBeLessThan(0.05)
  })

  it('addPanel < 0.05ms per op', () => {
    const elapsed = measure(
      () => addPanel(shallowTree, 'c2', createPanelNode('p_new', 'console')),
      1000
    )
    expect(elapsed / 1000).toBeLessThan(0.05)
  })

  it('activatePanel < 0.05ms per op', () => {
    const elapsed = measure(() => activatePanel(shallowTree, 'c1', 'p2'), 1000)
    expect(elapsed / 1000).toBeLessThan(0.05)
  })
})

describe('structural sharing', () => {
  it('resizeNode shares unchanged subtrees', () => {
    const left = createContainerNode('left', 'tabs', [createPanelNode('p1', 'viewer')], 'p1')
    const right = createContainerNode('right', 'tabs', [createPanelNode('p2', 'properties')], 'p2')
    const root = createSplitNode('root', 'horizontal', [left, right])
    const next = resizeNode(root, 'root', [
      { type: 'ratio', value: 2 },
      { type: 'ratio', value: 1 }
    ])
    const nextSplit = next as SplitNode
    expect(nextSplit.children[0]).toBe(left)
    expect(nextSplit.children[1]).toBe(right)
  })

  it('activatePanel only replaces target ContainerNode', () => {
    const c1 = createContainerNode(
      'c1',
      'tabs',
      [createPanelNode('a', 'a'), createPanelNode('b', 'b')],
      'a'
    )
    const c2 = createContainerNode('c2', 'tabs', [createPanelNode('c', 'c')], 'c')
    const root = createSplitNode('root', 'horizontal', [c1, c2])
    const next = activatePanel(root, 'c1', 'b')
    const nextSplit2 = next as SplitNode
    expect(nextSplit2.children[1]).toBe(c2)
    expect(nextSplit2.children[0]).not.toBe(c1)
  })
})

describe('deep tree operations', () => {
  it('getNode depth 20 < 0.1ms', () => {
    const deepTree = buildDeepTree(20, 1)
    const elapsed = measure(() => getNode(deepTree, 't_deep'), 500)
    expect(elapsed / 500).toBeLessThan(0.1)
  })

  it('findParent depth 20 < 0.1ms', () => {
    const deepTree = buildDeepTree(20, 1)
    const elapsed = measure(() => findParent(deepTree, 't_deep'), 500)
    expect(elapsed / 500).toBeLessThan(0.1)
  })
})

describe('wide tree operations', () => {
  it('getNode 50 children < 0.05ms', () => {
    const wideTree = buildWideTree(50, 2)
    const elapsed = measure(() => getNode(wideTree, 'c_49'), 1000)
    expect(elapsed / 1000).toBeLessThan(0.05)
  })

  it('closePanel 50 children < 0.05ms', () => {
    const wideTree = buildWideTree(50, 2)
    const elapsed = measure(() => closePanel(wideTree, 'c_49', 'p_49_0'), 1000)
    expect(elapsed / 1000).toBeLessThan(0.05)
  })
})

describe('stability', () => {
  it('1000 sequential resize operations', () => {
    let tree: LayoutNode = createSplitNode('root', 'horizontal', [
      createContainerNode('c1', 'tabs', [createPanelNode('p1', 'a')], 'p1'),
      createContainerNode('c2', 'tabs', [createPanelNode('p2', 'b')], 'p2')
    ])
    for (let i = 0; i < 1000; i++) {
      tree = resizeNode(tree, 'root', [
        { type: 'ratio', value: (i % 10) + 1 },
        { type: 'ratio', value: 1 }
      ])
    }
    expect(getNode(tree, 'c1')).not.toBeNull()
  })

  it('500 sequential panel switches', () => {
    let tree: LayoutNode = createContainerNode(
      'tabs',
      'tabs',
      [createPanelNode('a', 'a'), createPanelNode('b', 'b'), createPanelNode('c', 'c')],
      'a'
    )
    for (let i = 0; i < 500; i++) {
      const nextId = ['a', 'b', 'c'][i % 3]!
      tree = activatePanel(tree, 'tabs', nextId) as LayoutNode
    }
    expect(getNode(tree, 'a')).not.toBeNull()
  })
})
