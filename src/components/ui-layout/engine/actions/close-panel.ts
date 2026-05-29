import { isContainerNode, isSplitNode } from '../../domain'
import type { LayoutNode } from '../../domain'

export function closePanel(root: LayoutNode, containerId: string, panelId: string): LayoutNode {
  if (root.id === containerId && isContainerNode(root)) {
    const nextPanels = root.panels.filter((p) => p.id !== panelId)
    const nextActive = root.activeId === panelId ? (nextPanels[0]?.id ?? '') : root.activeId
    return { ...root, panels: nextPanels, activeId: nextActive }
  }

  if (isSplitNode(root)) {
    return {
      ...root,
      children: root.children.map((child) => closePanel(child, containerId, panelId))
    }
  }

  return root
}
