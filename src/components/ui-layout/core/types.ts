import type { LayoutNode, LayoutSize } from '../domain'
import type { PanelCachePolicy, PanelNode } from '../domain'

// ==================== 持久化 ====================
export interface IPersistenceAdapter {
  save(key: string, data: PersistedLayout): Promise<void>
  load(key: string): Promise<PersistedLayout | null>
}

export interface PersistedLayout {
  version: number
  updatedAt: number
  layout: LayoutNode
}

// ==================== Registry ====================
export type PanelLoader = () => Promise<unknown>

export interface PanelDefinition {
  type: string
  component: unknown | PanelLoader
  title?: string
  icon?: string
  cachePolicy?: PanelCachePolicy
}

// ==================== EventBus ====================
export interface LayoutEvents {
  'panel:close': { containerId: string; panelId: string }
  'panel:activate': { containerId: string; panelId: string }
  'panel:add': { containerId: string; panel: PanelNode }
  'split:resize': { nodeId: string; sizes: LayoutSize[] }
  'split:create': { nodeId: string; direction: 'horizontal' | 'vertical' }
  'split:collapse': { nodeId: string; childIndex: number }
  'layout:save': { key: string }
  'layout:load': { key: string }
}

// ==================== Manager ====================
export interface ILayoutManager {
  initLayout(root: LayoutNode): void
  split(nodeId: string, direction: 'horizontal' | 'vertical'): void
  resize(nodeId: string, sizes: LayoutSize[]): void
  toggleCollapse(nodeId: string, childIndex: number): void
  addPanel(containerId: string, panel: PanelNode): void
  closePanel(containerId: string, panelId: string): void
  activatePanel(containerId: string, panelId: string): void
  save(key: string): Promise<void>
  load(key: string): Promise<void>
  undo(): void
  redo(): void
  subscribe(handler: (root: LayoutNode) => void): () => void
  on<E extends keyof LayoutEvents>(event: E, handler: (payload: LayoutEvents[E]) => void): void
  emit<E extends keyof LayoutEvents>(event: E, payload: LayoutEvents[E]): void
  register(def: PanelDefinition): void
  getPanel(type: string): unknown | undefined
  getSnapshot(): LayoutNode
  getVersion(): number
}
