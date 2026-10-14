import { BlockNoteEditor, type PartialBlock } from '@blocknote/core'
import { TableHandlesExtension } from '@blocknote/core/extensions'
import { BlockNoteView } from '@blocknote/mantine'
import React from 'react'
import { createRoot } from 'react-dom/client'

import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'

export interface BlockNoteBridge {
  destroy: () => void
  getDocument: () => unknown[]
  mergeSampleCells: () => boolean
  splitSampleCell: () => boolean
}

export function mountBlockNote(
  host: HTMLElement,
  initialContent: unknown[],
  onChange: (documentValue: unknown[]) => void
): BlockNoteBridge {
  const cloneDocument = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
  const editor = BlockNoteEditor.create({
    initialContent: cloneDocument(initialContent) as PartialBlock[],
    tables: { splitCells: true, cellBackgroundColor: true, headers: true }
  })
  const root = createRoot(host)
  const View = BlockNoteView as unknown as React.ComponentType<{
    editor: typeof editor
    onChange: () => void
  }>
  root.render(React.createElement(View, { editor, onChange: () => onChange(editor.document) }))

  function activateTableHandles() {
    const firstCell = host.querySelector<HTMLTableCellElement>('td, th')
    if (!firstCell) return false
    const rect = firstCell.getBoundingClientRect()
    firstCell.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      })
    )
    return true
  }

  return {
    destroy: () => root.unmount(),
    getDocument: () => editor.document,
    mergeSampleCells: () => {
      editor.setTextCursorPosition(editor.document[0], 'start')
      if (!activateTableHandles()) return false
      return editor.getExtension(TableHandlesExtension)?.mergeCells({
        relativeStartCell: { row: 0, col: 0 },
        relativeEndCell: { row: 1, col: 1 }
      }) ?? false
    },
    splitSampleCell: () => {
      editor.setTextCursorPosition(editor.document[0], 'start')
      if (!activateTableHandles()) return false
      return editor.getExtension(TableHandlesExtension)?.splitCell({ row: 0, col: 0 }) ?? false
    }
  }
}
