import { isContainerNode, isSplitNode } from '../domain'
import type { LayoutNode, PanelNode } from '../domain'

export function getNode(root: LayoutNode, id: string): LayoutNode | PanelNode | null {
  if (root.id === id) return root

  if (isSplitNode(root)) {
    for (const child of root.children) {
      const found = getNode(child, id)
      if (found) return found
    }
  }

  if (isContainerNode(root)) {
    for (const panel of root.panels) {
      if (panel.id === id) return panel
    }
  }

  return null
}

export function findParent(root: LayoutNode, id: string): LayoutNode | null {
  if (isSplitNode(root)) {
    for (const child of root.children) {
      if (child.id === id) return root
      const found = findParent(child, id)
      if (found) return found
    }
  }
  return null
}
