import { isContainerNode, isSplitNode } from '../../domain'
import type { LayoutNode } from '../../domain'

export function activatePanel(root: LayoutNode, containerId: string, panelId: string): LayoutNode {
  if (root.id === containerId && isContainerNode(root)) {
    return { ...root, activeId: panelId }
  }

  if (isSplitNode(root)) {
    return {
      ...root,
      children: root.children.map((child) => activatePanel(child, containerId, panelId))
    }
  }

  return root
}
