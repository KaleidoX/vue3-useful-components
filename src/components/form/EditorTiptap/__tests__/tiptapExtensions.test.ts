import { TableKit } from '@tiptap/extension-table'
import { describe, expect, it } from 'vitest'

import { createTiptapExtensions } from '../tiptapExtensions'

describe('createTiptapExtensions', () => {
  it('enables the official TableKit only in full mode', () => {
    const fullExtensions = createTiptapExtensions({ simple: false, placeholder: '请输入内容' })
    const simpleExtensions = createTiptapExtensions({ simple: true, placeholder: '请输入内容' })

    expect(fullExtensions).toContain(TableKit)
    expect(simpleExtensions).not.toContain(TableKit)
  })
})
