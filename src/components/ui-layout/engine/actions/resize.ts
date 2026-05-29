import { isSplitNode } from '../../domain'
import type { LayoutNode, LayoutSize } from '../../domain'

export function resizeNode(root: LayoutNode, nodeId: string, sizes: LayoutSize[]): LayoutNode {
  if (root.id === nodeId && isSplitNode(root)) {
    return { ...root, sizes }
  }

  if (isSplitNode(root)) {
    return {
      ...root,
      children: root.children.map((child) => resizeNode(child, nodeId, sizes))
    }
  }

  return root
}
