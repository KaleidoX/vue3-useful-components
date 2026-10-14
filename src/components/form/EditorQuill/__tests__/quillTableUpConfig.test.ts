import { TableMenuContextmenu, TableSelection, TableUp } from 'quill-table-up'
import { describe, expect, it } from 'vitest'

import {
  createQuillTableUpOptions,
  quillTableUpToolbarControl
} from '../quillTableUpConfig'

describe('quillTableUpConfig', () => {
  it('combines selection and context menu modules in full mode', () => {
    const options = createQuillTableUpOptions(false)

    expect(quillTableUpToolbarControl).toEqual({ [TableUp.toolName]: [] })
    expect(options?.modules?.map(({ module }) => module)).toEqual([
      TableSelection,
      TableMenuContextmenu
    ])
  })

  it('keeps simple mode free of the third-party table module', () => {
    expect(createQuillTableUpOptions(true)).toBeUndefined()
  })
})
