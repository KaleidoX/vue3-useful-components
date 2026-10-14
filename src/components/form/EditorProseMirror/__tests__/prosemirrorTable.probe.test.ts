import { EditorState } from 'prosemirror-state'
import { tableEditing } from 'prosemirror-tables'
import { EditorView } from 'prosemirror-view'
import { afterEach, describe, expect, it } from 'vitest'

import {
  mergeSampleProseMirrorCells,
  prosemirrorTableFixture,
  prosemirrorTableSchema,
  splitSampleProseMirrorCell
} from '../prosemirrorTable'

describe('raw ProseMirror table round trip', () => {
  let view: EditorView | undefined
  afterEach(() => view?.destroy())

  it('merges, rebuilds from JSON and splits a 2x2 cell', () => {
    view = new EditorView(document.createElement('div'), {
      state: EditorState.create({
        doc: prosemirrorTableSchema.nodeFromJSON(prosemirrorTableFixture),
        plugins: [tableEditing()]
      })
    })

    expect(mergeSampleProseMirrorCells(view)).toBe(true)
    const mergedJson = view.state.doc.toJSON()
    expect(JSON.stringify(mergedJson)).toContain('"colspan":2')

    view.updateState(
      EditorState.create({ doc: prosemirrorTableSchema.nodeFromJSON(structuredClone(mergedJson)) })
    )
    expect(splitSampleProseMirrorCell(view)).toBe(true)
    expect(JSON.stringify(view.state.doc.toJSON())).not.toContain('"colspan":2')
  })
})
