import { createEditor } from 'slate-vue3/core'
import { withHistory } from 'slate-vue3/history'
import { describe, expect, it } from 'vitest'

import { tableMergeFixture } from '@/views/form/fixtures/tableMergeFixture'
import { createTableFromRows } from '../plugins/withTables'
import { mergeTableCellsAt, splitTableCellAt } from '../plugins/tableMerge'
import type { SlateEditor } from '../types'

function createFixtureEditor() {
  const editor = withHistory(createEditor())
  editor.children = [createTableFromRows(tableMergeFixture.rows)] as any
  return editor as unknown as SlateEditor
}

describe('Slate table merge feasibility probe', () => {
  it('round-trips a rectangular merge through JSON and an explicit split', () => {
    const editor = createFixtureEditor()
    const original = JSON.parse(JSON.stringify(editor.children))

    expect(mergeTableCellsAt(editor, [0, 0, 0], [0, 1, 1])).toBe(true)

    const merged = JSON.parse(JSON.stringify(editor.children))
    expect(merged[0].children[0].children[0]).toMatchObject({ rowspan: 2, colspan: 2 })
    expect(
      [merged[0].children[0].children[1], ...merged[0].children[1].children.slice(0, 2)].every(
        (cell) => cell.hiddenBy === '0:0'
      )
    ).toBe(true)

    const rebuilt = withHistory(createEditor()) as unknown as SlateEditor
    rebuilt.children = JSON.parse(JSON.stringify(merged))
    expect(splitTableCellAt(rebuilt, [0, 0, 0])).toBe(true)
    expect(rebuilt.children).toEqual(original)
  })

  it('records merge as one undoable and redoable history batch', () => {
    const editor = createFixtureEditor()
    const original = JSON.parse(JSON.stringify(editor.children))

    expect(mergeTableCellsAt(editor, [0, 0, 0], [0, 1, 1])).toBe(true)
    const merged = JSON.parse(JSON.stringify(editor.children))

    editor.undo()
    expect(editor.children).toEqual(original)
    editor.redo()
    expect(editor.children).toEqual(merged)
  })

  it('rejects non-rectangular cross-table and already merged ranges', () => {
    const editor = createFixtureEditor()

    expect(mergeTableCellsAt(editor, [0, 0, 0], [1, 1, 1])).toBe(false)
    expect(mergeTableCellsAt(editor, [0, 0, 0], [0, 0, 0])).toBe(false)
    expect(mergeTableCellsAt(editor, [0, 0, 0], [0, 1, 1])).toBe(true)
    expect(mergeTableCellsAt(editor, [0, 0, 0], [0, 1, 1])).toBe(false)
  })
})
