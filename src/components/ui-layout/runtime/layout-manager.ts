import { EventBus } from './event-bus'
import type { ILayoutManager, LayoutEvents, PanelDefinition, PersistedLayout } from '../core/types'
import type { LayoutNode, LayoutSize, PanelNode } from '../domain'
import { activatePanel } from '../engine/actions/activate-panel'
import { addPanel } from '../engine/actions/add-panel'
import { closePanel } from '../engine/actions/close-panel'
import { resizeNode } from '../engine/actions/resize'
import { splitNode } from '../engine/actions/split'
import { toggleCollapse } from '../engine/actions/toggle-collapse'
import type { IPersistenceAdapter } from '../persistence/adapter'
import { PanelRegistry } from '../registry/panel-registry'
import { useLayoutStore } from '../store/layout-store'

export class LayoutManager implements ILayoutManager {
  private _store: ReturnType<typeof useLayoutStore>
  private _eventBus: EventBus
  private _registry: PanelRegistry
  private _adapter: IPersistenceAdapter | null

  constructor(adapter?: IPersistenceAdapter) {
    this._store = useLayoutStore()
    this._eventBus = new EventBus()
    this._registry = new PanelRegistry()
    this._adapter = adapter ?? null
  }

  get eventBus(): EventBus {
    return this._eventBus
  }

  get registry(): PanelRegistry {
    return this._registry
  }

  initLayout(root: LayoutNode): void {
    this._store.setRoot(root)
  }

  split(nodeId: string, direction: 'horizontal' | 'vertical'): void {
    const root = this._store.root
    if (!root) return
    const next = splitNode(root, nodeId, direction)
    this._store.setRoot(next)
    this._eventBus.emit('split:create', { nodeId, direction })
  }

  resize(nodeId: string, sizes: LayoutSize[]): void {
    const root = this._store.root
    if (!root) return
    const next = resizeNode(root, nodeId, sizes)
    this._store.setRoot(next)
    this._eventBus.emit('split:resize', { nodeId, sizes })
  }

  toggleCollapse(nodeId: string, childIndex: number): void {
    const root = this._store.root
    if (!root) return
    const next = toggleCollapse(root, nodeId, childIndex)
    this._store.setRoot(next)
    this._eventBus.emit('split:collapse', { nodeId, childIndex })
  }

  addPanel(containerId: string, panel: PanelNode): void {
    const root = this._store.root
    if (!root) return
    const next = addPanel(root, containerId, panel)
    this._store.setRoot(next)
    this._eventBus.emit('panel:add', { containerId, panel })
  }

  closePanel(containerId: string, panelId: string): void {
    const root = this._store.root
    if (!root) return
    const next = closePanel(root, containerId, panelId)
    this._store.setRoot(next)
    this._eventBus.emit('panel:close', { containerId, panelId })
  }

  activatePanel(containerId: string, panelId: string): void {
    const root = this._store.root
    if (!root) return
    const next = activatePanel(root, containerId, panelId)
    this._store.setRoot(next)
    this._eventBus.emit('panel:activate', { containerId, panelId })
  }

  async save(key: string): Promise<void> {
    if (!this._adapter) return
    const root = this._store.root
    if (!root) return
    const persisted: PersistedLayout = {
      version: 1,
      updatedAt: Date.now(),
      layout: root
    }
    await this._adapter.save(key, persisted)
    this._eventBus.emit('layout:save', { key })
  }

  async load(key: string): Promise<void> {
    if (!this._adapter) return
    const data = await this._adapter.load(key)
    if (!data) return
    this._store.setRoot(data.layout)
    this._eventBus.emit('layout:load', { key })
  }

  undo(): void {
    this._store.undo()
  }

  redo(): void {
    this._store.redo()
  }

  subscribe(handler: (root: LayoutNode) => void): () => void {
    return this._store.subscribe(handler)
  }

  on<E extends keyof LayoutEvents>(event: E, handler: (payload: LayoutEvents[E]) => void): void {
    this._eventBus.on(event, handler)
  }

  emit<E extends keyof LayoutEvents>(event: E, payload: LayoutEvents[E]): void {
    this._eventBus.emit(event, payload)
  }

  register(def: PanelDefinition): void {
    this._registry.register(def)
  }

  getPanel(type: string): unknown | undefined {
    return this._registry.get(type)
  }

  getSnapshot(): LayoutNode {
    return this._store.getSnapshot()!
  }

  getVersion(): number {
    return this._store.getVersion()
  }
}
