import { isContainerNode, isSplitNode } from '../domain'
import type { LayoutNode } from '../domain'

export function validateLayout(node: LayoutNode): string[] {
  const errors: string[] = []

  function walk(n: LayoutNode, depth: number) {
    if (depth > 50) {
      errors.push(`max depth exceeded at ${n.id}`)
      return
    }

    if (isSplitNode(n)) {
      if (n.children.length < 2) {
        errors.push(`SplitNode ${n.id}: must have at least 2 children`)
      }
      if (n.sizes.length !== n.children.length) {
        errors.push(`SplitNode ${n.id}: sizes length mismatch`)
      }
      for (const child of n.children) {
        if (!isSplitNode(child) && !isContainerNode(child)) {
          const bad = child as unknown as { id: string; type: string }
          errors.push(`SplitNode ${n.id}: child ${bad.id} is not a layout node (type=${bad.type})`)
        } else {
          walk(child, depth + 1)
        }
      }
    } else if (isContainerNode(n)) {
      for (const panel of n.panels) {
        if (!panel.id || !panel.componentType) {
          errors.push(`ContainerNode ${n.id}: invalid panel`)
        }
      }
    } else {
      errors.push(`Unknown node type at ${(n as any).id}: ${(n as any).type}`)
    }
  }

  walk(node, 0)
  return errors
}
