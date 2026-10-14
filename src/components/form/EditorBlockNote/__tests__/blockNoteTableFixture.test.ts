import { BlockNoteEditor } from '@blocknote/core'
import { describe, expect, it } from 'vitest'

import { blockNoteTableFixture } from '../blockNoteTableFixture'

describe('BlockNote table fixture', () => {
  it('normalizes the common 3x3 table into its JSON document model', () => {
    const editor = BlockNoteEditor.create({
      initialContent: structuredClone(blockNoteTableFixture) as never,
      tables: { splitCells: true }
    })
    const table = editor.document[0]
    const content = table.content as {
      type: string
      rows: Array<{ cells: unknown[] }>
    }
    expect(table.type).toBe('table')
    expect(content.type).toBe('tableContent')
    expect(content.rows).toHaveLength(3)
    expect(content.rows.every((row) => row.cells.length === 3)).toBe(true)
  })
})
