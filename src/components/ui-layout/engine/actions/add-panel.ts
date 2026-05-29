import { isContainerNode, isSplitNode } from '../../domain'
import type { LayoutNode, PanelNode } from '../../domain'

export function addPanel(root: LayoutNode, containerId: string, panel: PanelNode): LayoutNode {
  if (root.id === containerId && isContainerNode(root)) {
    return { ...root, panels: [...root.panels, panel], activeId: panel.id }
  }

  if (isSplitNode(root)) {
    return {
      ...root,
      children: root.children.map((child) => addPanel(child, containerId, panel))
    }
  }

  return root
}
