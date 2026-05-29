import type { IPersistenceAdapter, PersistedLayout } from '../core/types'

export class LocalStorageAdapter implements IPersistenceAdapter {
  async save(key: string, data: PersistedLayout): Promise<void> {
    localStorage.setItem(`ui-layout:${key}`, JSON.stringify(data))
  }

  async load(key: string): Promise<PersistedLayout | null> {
    const raw = localStorage.getItem(`ui-layout:${key}`)
    if (!raw) return null
    try {
      return JSON.parse(raw) as PersistedLayout
    } catch {
      return null
    }
  }
}
