import type { LayoutNode } from '../domain'

const MAX_DEPTH = 50

export interface Snapshot {
  root: LayoutNode
  version: number
}

export class SnapshotStack {
  private _past: Snapshot[] = []
  private _future: Snapshot[] = []

  push(snapshot: Snapshot): void {
    this._past.push(snapshot)
    if (this._past.length > MAX_DEPTH) {
      this._past.shift()
    }
    this._future = []
  }

  undo(): Snapshot | null {
    if (this._past.length <= 1) return null
    const current = this._past.pop()!
    this._future.push(current)
    return this._past[this._past.length - 1] ?? null
  }

  redo(): Snapshot | null {
    if (this._future.length === 0) return null
    const next = this._future.pop()!
    this._past.push(next)
    return next
  }
}
