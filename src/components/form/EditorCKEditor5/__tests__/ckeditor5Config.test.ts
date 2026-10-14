import { Table, TableToolbar } from 'ckeditor5'
import { describe, expect, it } from 'vitest'

import { createCKEditor5Config } from '../ckeditor5Config'

describe('createCKEditor5Config', () => {
  it('enables the official table plugins and contextual merge control in full mode', () => {
    const config = createCKEditor5Config({ simple: false, placeholder: '请输入内容' })

    expect(config.plugins).toContain(Table)
    expect(config.plugins).toContain(TableToolbar)
    expect(config.toolbar).toContain('insertTable')
    expect(config.table?.contentToolbar).toContain('mergeTableCells')
  })

  it('keeps simple mode free of table capabilities', () => {
    const config = createCKEditor5Config({ simple: true, placeholder: '请输入内容' })

    expect(config.plugins).not.toContain(Table)
    expect(config.plugins).not.toContain(TableToolbar)
    expect(config.toolbar).not.toContain('insertTable')
    expect(config.table).toBeUndefined()
  })
})
