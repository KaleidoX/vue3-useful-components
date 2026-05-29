import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { createContainerNode, createSplitNode } from '../../domain'
import { useLayoutStore } from '../layout-store'

describe('layout-store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with null root', () => {
    const store = useLayoutStore()
    expect(store.root).toBeNull()
  })

  it('setRoot updates root and increments version', () => {
    const store = useLayoutStore()
    const root = createSplitNode('r', 'horizontal', [createContainerNode('t1', 'tabs', [], '')])
    store.setRoot(root)
    expect(store.root).toEqual(root)
    expect(store.version).toBe(1)
  })

  it('getSnapshot returns deep clone', () => {
    const store = useLayoutStore()
    const root = createSplitNode('r', 'horizontal', [])
    store.setRoot(root)
    const snap = store.getSnapshot()
    expect(snap).toEqual(root)
    ;(snap as any).direction = 'vertical'
    expect((store.root as any).direction).toBe('horizontal')
  })

  it('getVersion returns current version', () => {
    const store = useLayoutStore()
    expect(store.getVersion()).toBe(0)
    store.setRoot(createSplitNode('r', 'horizontal', []))
    expect(store.getVersion()).toBe(1)
  })

  it('subscribe fires on root change', () => {
    const store = useLayoutStore()
    const roots: unknown[] = []
    store.subscribe((r) => roots.push(r))
    store.setRoot(createSplitNode('r1', 'horizontal', []))
    store.setRoot(createSplitNode('r2', 'horizontal', []))
    expect(roots).toHaveLength(2)
    expect((roots[0] as any).id).toBe('r1')
  })
})
