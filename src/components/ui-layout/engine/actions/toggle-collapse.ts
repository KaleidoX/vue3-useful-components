import { isSplitNode } from '../../domain'
import type { LayoutNode, LayoutSize } from '../../domain'
import type { SplitChildState } from '../../domain/layout/split'

export function toggleCollapse(root: LayoutNode, nodeId: string, childIndex: number): LayoutNode {
  if (root.id === nodeId && isSplitNode(root)) {
    const states: SplitChildState[] = (
      root.childStates ?? root.children.map((): SplitChildState => ({ collapsed: false }))
    ).map((s, i) => (i === childIndex ? { ...s, collapsed: s.collapsed ? false : true } : { ...s }))

    const sizes: LayoutSize[] = [...root.sizes]
    const childState = states[childIndex]!

    if (!childState.collapsed) {
      // Expanding — restore previous size, or keep current
      if (childState.previousSize) {
        sizes[childIndex] = childState.previousSize
        childState.previousSize = undefined
      }
    } else {
      // Collapsing — save current size, shrink to collapsedSize
      childState.previousSize = sizes[childIndex]
      sizes[childIndex] = { type: 'px', value: childState.collapsedSize ?? 0 }
    }

    return { ...root, sizes, childStates: states }
  }

  if (isSplitNode(root)) {
    return {
      ...root,
      children: root.children.map((child) => toggleCollapse(child, nodeId, childIndex))
    }
  }

  return root
}
