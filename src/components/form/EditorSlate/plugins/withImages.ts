import { Transforms } from 'slate-vue3/core'
import type { SlateEditor } from '../types'

export function withImages(editor: SlateEditor): SlateEditor {
  const { isVoid } = editor

  editor.isVoid = (element) => {
    return (element as any).type === 'image' ? true : isVoid(element)
  }

  return editor
}

export function insertImage(editor: SlateEditor, url: string, alt?: string) {
  const image = {
    type: 'image',
    url,
    alt: alt || '',
    children: [{ text: '' }]
  }
  Transforms.insertNodes(editor, image as any)
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }]
  } as any)
}
