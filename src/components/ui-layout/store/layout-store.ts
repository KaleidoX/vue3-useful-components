import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import { SnapshotStack } from './snapshot-stack'
import type { Snapshot } from './snapshot-stack'
import type { LayoutNode } from '../domain'

export const useLayoutStore = defineStore('ui-layout', () => {
  const _root = shallowRef<LayoutNode | null>(null)
  const _version = shallowRef(0)
  const _subscribers = new Set<(root: LayoutNode) => void>()
  const _snapshotStack = new SnapshotStack()

  const root = computed(() => _root.value)
  const version = computed(() => _version.value)

  function setRoot(next: LayoutNode): void {
    _root.value = next
    _version.value++
    const snapshot: Snapshot = {
      root: structuredClone(next),
      version: _version.value
    }
    _snapshotStack.push(snapshot)
    for (const handler of _subscribers) {
      handler(next)
    }
  }

  function getSnapshot(): LayoutNode | null {
    return _root.value ? structuredClone(_root.value) : null
  }

  function getVersion(): number {
    return _version.value
  }

  function subscribe(handler: (root: LayoutNode) => void): () => void {
    _subscribers.add(handler)
    return () => {
      _subscribers.delete(handler)
    }
  }

  function undo(): void {
    const result = _snapshotStack.undo()
    if (result) {
      _root.value = result.root
      _version.value++
      for (const handler of _subscribers) {
        handler(result.root)
      }
    }
  }

  function redo(): void {
    const result = _snapshotStack.redo()
    if (result) {
      _root.value = result.root
      _version.value++
      for (const handler of _subscribers) {
        handler(result.root)
      }
    }
  }

  return { root, version, setRoot, getSnapshot, getVersion, subscribe, undo, redo }
})
