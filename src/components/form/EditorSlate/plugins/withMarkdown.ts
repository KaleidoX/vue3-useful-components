import { Editor, Transforms, Range, Element as SlateElement } from 'slate-vue3/core'
import { MARKDOWN_SHORTCUTS } from '../constants'
import type { SlateEditor } from '../types'

export function withMarkdown(editor: SlateEditor): SlateEditor {
  const { insertText, insertBreak } = editor

  editor.insertBreak = () => {
    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'code-block'
      })
      if (match) {
        insertBreak()
        return
      }
    }
    insertBreak()
  }

  editor.insertText = (text: string) => {
    const { selection } = editor

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n)
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range)

      const shortcut = MARKDOWN_SHORTCUTS[beforeText]
      if (shortcut) {
        Transforms.select(editor, range)
        Transforms.delete(editor)

        const { type, level } = shortcut

        if (type === 'bulleted-list' || type === 'numbered-list') {
          Transforms.setNodes(editor, { type: 'list-item' } as any)
          const list = { type, children: [] } as any
          Transforms.wrapNodes(editor, list)
        } else if (type === 'code-block') {
          Transforms.setNodes(editor, { type: 'code-block', language: '' } as any)
        } else if (type === 'thematic-break') {
          Transforms.setNodes(editor, { type: 'thematic-break' } as any)
        } else if (type === 'heading') {
          Transforms.setNodes(editor, { type: 'heading', level } as any)
        } else {
          Transforms.setNodes(editor, { type } as any)
        }

        return
      }
    }

    insertText(text)
  }

  return editor
}
