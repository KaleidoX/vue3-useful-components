import type { LayoutNode } from '../domain'

const LATEST_VERSION = 1

export function migrateLayout(data: { version: number; layout: unknown }): LayoutNode | null {
  if (data.version === LATEST_VERSION) {
    return data.layout as LayoutNode
  }
  return null
}
