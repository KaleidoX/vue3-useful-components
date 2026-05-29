import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { PanelRegistry } from '../panel-registry'

describe('PanelRegistry', () => {
  it('registers and retrieves a panel', () => {
    const registry = new PanelRegistry()
    const comp = defineComponent({ render: () => h('div') })
    registry.register({ type: 'test', component: comp, title: 'Test' })
    expect(registry.get('test')).toBe(comp)
  })

  it('returns undefined for unknown type', () => {
    const registry = new PanelRegistry()
    expect(registry.get('unknown')).toBeUndefined()
  })

  it('returns definition metadata', () => {
    const registry = new PanelRegistry()
    const comp = defineComponent({ render: () => h('div') })
    registry.register({ type: 'test', component: comp, title: 'My Panel', icon: 'icon' })
    const def = registry.getDefinition('test')
    expect(def).toBeDefined()
    expect(def!.title).toBe('My Panel')
  })

  it('lists all definitions', () => {
    const registry = new PanelRegistry()
    const comp = defineComponent({ render: () => h('div') })
    registry.register({ type: 'test', component: comp })
    expect(registry.list()).toHaveLength(1)
  })
})
