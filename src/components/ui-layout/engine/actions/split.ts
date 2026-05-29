import { isSplitNode } from '../../domain'
import { createContainerNode, createSplitNode, generateId } from '../../domain'
import type { LayoutNode } from '../../domain'

export function splitNode(
  root: LayoutNode,
  nodeId: string,
  direction: 'horizontal' | 'vertical'
): LayoutNode {
  if (isSplitNode(root)) {
    const childIndex = root.children.findIndex((c) => c.id === nodeId)
    if (childIndex !== -1) {
      const target = root.children[childIndex]!
      const newSplit = createSplitNode(`split_${generateId()}`, direction, [
        target,
        createContainerNode(`empty_${generateId()}`, 'single', [], '', {})
      ])
      return {
        ...root,
        children: [
          ...root.children.slice(0, childIndex),
          newSplit,
          ...root.children.slice(childIndex + 1)
        ]
      }
    }
    return {
      ...root,
      children: root.children.map((child) => splitNode(child, nodeId, direction))
    }
  }
  return root
}
