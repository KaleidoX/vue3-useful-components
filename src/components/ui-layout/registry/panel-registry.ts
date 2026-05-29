import type { PanelDefinition } from '../core/types'

export class PanelRegistry {
  private _map = new Map<string, PanelDefinition>()

  register(def: PanelDefinition): void {
    this._map.set(def.type, def)
  }

  get(type: string): unknown | undefined {
    return this._map.get(type)?.component
  }

  getDefinition(type: string): PanelDefinition | undefined {
    return this._map.get(type)
  }

  list(): PanelDefinition[] {
    return Array.from(this._map.values())
  }
}
