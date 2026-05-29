import type { PanelNode } from '../content/types'

export type ContainerType = 'tabs' | 'stack' | 'dock' | 'floating' | 'single'
export type DockAnchor = 'left' | 'right' | 'top' | 'bottom'

export interface ContainerNode {
  id: string
  type: ContainerType
  panels: PanelNode[]
  activeId: string
  orientation?: 'top' | 'bottom'
  anchor?: DockAnchor
  collapsed?: boolean
  meta?: Record<string, unknown>
}

const CONTAINER_TYPES = new Set<string>(['tabs', 'stack', 'dock', 'floating', 'single'])

export function isContainerNode(node: any): node is ContainerNode {
  return node?.type && CONTAINER_TYPES.has(node.type)
}

export function createContainerNode(
  id: string,
  containerType: ContainerType,
  panels: PanelNode[],
  activeId: string,
  opts?: { orientation?: 'top' | 'bottom'; anchor?: DockAnchor; collapsed?: boolean }
): ContainerNode {
  return {
    id,
    type: containerType,
    panels,
    activeId,
    orientation: opts?.orientation,
    anchor: opts?.anchor,
    collapsed: opts?.collapsed
  }
}
