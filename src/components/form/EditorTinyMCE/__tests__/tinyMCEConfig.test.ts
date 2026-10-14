import { describe, expect, it, vi } from 'vitest'

import { createTinyMCEConfig } from '../tinyMCEConfig'

const createOptions = (simple: boolean) => ({
  simple,
  height: 360,
  minHeight: 160,
  placeholder: '请输入内容',
  readOnly: false,
  setup: vi.fn()
})

describe('createTinyMCEConfig', () => {
  it('exposes table merge and split actions in full mode', () => {
    const config = createTinyMCEConfig(createOptions(false))

    expect(config.plugins).toContain('table')
    expect(config.toolbar).toContain('table')
    expect(config.table_toolbar).toContain('tablemergecells')
    expect(config.table_toolbar).toContain('tablesplitcells')
  })

  it('keeps table controls out of simple mode', () => {
    const config = createTinyMCEConfig(createOptions(true))

    expect(config.plugins).not.toContain('table')
    expect(config.toolbar).not.toContain('table')
    expect(config.table_toolbar).toBeUndefined()
  })
})
