import { Transforms } from 'slate-vue3/core'
import type { SlateEditor } from '../types'
import type { Descendant } from 'slate-vue3/core'

export function withTables(editor: SlateEditor): SlateEditor {
  const { normalizeNode } = editor

  editor.normalizeNode = (entry) => {
    const [node, path] = entry
    const element = node as any

    if (element.type === 'table') {
      if (
        !Array.isArray(element.children) ||
        element.children.some((r: any) => r.type !== 'table-row')
      ) {
        Transforms.removeNodes(editor, { at: path })
        Transforms.insertNodes(editor, createDefaultTable() as any, { at: path })
        return
      }
    }

    if (element.type === 'table-row') {
      if (
        !Array.isArray(element.children) ||
        element.children.some((c: any) => c.type !== 'table-cell')
      ) {
        Transforms.removeNodes(editor, { at: path })
        return
      }
    }

    normalizeNode(entry)
  }

  return editor
}

export function createDefaultTable(rows = 3, cols = 3): Descendant {
  return {
    type: 'table',
    children: Array.from({ length: rows }, () => ({
      type: 'table-row',
      children: Array.from({ length: cols }, () => ({
        type: 'table-cell',
        children: [{ type: 'paragraph', children: [{ text: '' }] }]
      }))
    }))
  } as any
}
