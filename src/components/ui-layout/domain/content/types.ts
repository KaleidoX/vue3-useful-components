export interface PanelCachePolicy {
  keepAlive?: boolean
  maxAge?: number
  persist?: boolean
}

export interface PanelNode {
  id: string
  type: 'panel'
  componentType: string
  props?: Record<string, unknown>
  cachePolicy?: PanelCachePolicy
}

export function isPanelNode(node: any): node is PanelNode {
  return node?.type === 'panel'
}

export function createPanelNode(
  id: string,
  componentType: string,
  props?: Record<string, unknown>
): PanelNode {
  return { id, type: 'panel', componentType, props }
}
