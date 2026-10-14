import { Schema, type Node as ProseMirrorNode } from 'prosemirror-model'
import { CellSelection, mergeCells, splitCell, tableNodes } from 'prosemirror-tables'
import type { EditorView } from 'prosemirror-view'

import { tableMergeFixture } from '@/views/form/fixtures/tableMergeFixture'

export const prosemirrorTableSchema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { content: 'inline*', group: 'block', parseDOM: [{ tag: 'p' }], toDOM: () => ['p', 0] },
    text: { group: 'inline' },
    ...tableNodes({ tableGroup: 'block', cellContent: 'block+', cellAttributes: {} })
  }
})

const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] })

export const prosemirrorTableFixture = {
  type: 'doc',
  content: [
    {
      type: 'table',
      content: tableMergeFixture.rows.map((row) => ({
        type: 'table_row',
        content: row.map((text) => ({ type: 'table_cell', content: [paragraph(text)] }))
      }))
    }
  ]
}

function tableCellPositions(doc: ProseMirrorNode) {
  const positions: number[] = []
  doc.descendants((node, position) => {
    if (node.type.name === 'table_cell' || node.type.name === 'table_header') positions.push(position)
  })
  return positions
}

export function mergeSampleProseMirrorCells(view: EditorView) {
  const positions = tableCellPositions(view.state.doc)
  if (positions.length < 5) return false
  view.dispatch(view.state.tr.setSelection(CellSelection.create(view.state.doc, positions[0], positions[4])))
  return mergeCells(view.state, view.dispatch)
}

export function splitSampleProseMirrorCell(view: EditorView) {
  let mergedPosition: number | undefined
  view.state.doc.descendants((node, position) => {
    if (mergedPosition === undefined && node.type.name === 'table_cell' && (node.attrs.colspan > 1 || node.attrs.rowspan > 1)) {
      mergedPosition = position
      return false
    }
  })
  if (mergedPosition === undefined) return false
  view.dispatch(view.state.tr.setSelection(CellSelection.create(view.state.doc, mergedPosition)))
  return splitCell(view.state, view.dispatch)
}
