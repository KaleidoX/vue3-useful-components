import {
  defaultValueCtx,
  Editor,
  editorViewCtx,
  rootCtx,
  serializerCtx
} from '@milkdown/kit/core'
import { gfm } from '@milkdown/kit/preset/gfm'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { CellSelection, mergeCells, TableMap } from '@milkdown/kit/prose/tables'
import { afterEach, describe, expect, it } from 'vitest'

import { tableMergeFixtureMarkdown } from '@/views/form/fixtures/tableMergeFixture'

const editors: Editor[] = []

async function createEditor(markdown: string) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const editor = await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, markdown)
    })
    .use(commonmark)
    .use(gfm)
    .create()

  editors.push(editor)
  return editor
}

afterEach(async () => {
  await Promise.all(editors.splice(0).map((editor) => editor.destroy()))
  document.body.replaceChildren()
})

describe('Milkdown GFM table merge round-trip probe', () => {
  it('proves that runtime spans are lost after Markdown serialization and reconstruction', async () => {
    const sourceEditor = await createEditor(tableMergeFixtureMarkdown)
    const markdown = sourceEditor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const table = view.state.doc.firstChild
      if (!table) throw new Error('Expected the shared table fixture to be parsed')

      const map = TableMap.get(table)
      const anchor = map.positionAt(0, 0, table) + 1
      const head = map.positionAt(1, 1, table) + 1
      view.dispatch(view.state.tr.setSelection(CellSelection.create(view.state.doc, anchor, head)))
      expect(mergeCells(view.state, view.dispatch)).toBe(true)
      expect(view.state.doc.firstChild?.firstChild?.firstChild?.attrs).toMatchObject({
        rowspan: 2,
        colspan: 2
      })

      return ctx.get(serializerCtx)(view.state.doc)
    })

    expect(markdown).not.toMatch(/rowspan|colspan/i)

    const rebuiltEditor = await createEditor(markdown)
    const spans = rebuiltEditor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const result: Array<{ rowspan: number; colspan: number }> = []
      view.state.doc.descendants((node) => {
        if (node.type.name === 'table_cell' || node.type.name === 'table_header') {
          result.push({ rowspan: node.attrs.rowspan, colspan: node.attrs.colspan })
        }
      })
      return result
    })

    expect(spans).toHaveLength(10)
    expect(spans.every(({ rowspan, colspan }) => rowspan === 1 && colspan === 1)).toBe(true)
  })
})
