import { describe, expect, it } from 'vitest'

import {
  createLexicalTableEditor,
  mergeSampleLexicalCells,
  seedLexicalTable,
  splitSampleLexicalCell
} from '../lexicalTable'

describe('Lexical table round trip', () => {
  it('merges, serializes, rebuilds and unmerges the sample range', () => {
    const editor = createLexicalTableEditor()
    seedLexicalTable(editor)
    expect(mergeSampleLexicalCells(editor)).toBe(true)
    const mergedState = JSON.stringify(editor.getEditorState())
    expect(mergedState).toContain('"colSpan":2')

    const rebuilt = createLexicalTableEditor()
    rebuilt.setEditorState(rebuilt.parseEditorState(mergedState))
    expect(splitSampleLexicalCell(rebuilt)).toBe(true)
    expect(JSON.stringify(rebuilt.getEditorState())).not.toContain('"colSpan":2')
  })
})
