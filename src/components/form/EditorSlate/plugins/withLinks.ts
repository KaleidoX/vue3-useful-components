import { Editor, Transforms, Range } from 'slate-vue3/core'
import type { SlateEditor } from '../types'

/**
 * 链接通过 leaf 级标记实现（leaf.link + leaf.url），
 * 此模块仅提供工具栏操作所需的辅助函数。
 */

export function withLinks(editor: SlateEditor): SlateEditor {
  return editor
}

export function insertLink(editor: SlateEditor, url: string, text?: string) {
  if (!editor.selection) return

  if (Range.isCollapsed(editor.selection)) {
    // 无选区：插入带链接的文本
    Transforms.insertNodes(editor, {
      type: 'paragraph',
      children: [{ text: text || url, link: true, url }]
    } as any)
  } else {
    // 有选区：切分文本节点，设置链接标记
    Transforms.setNodes(editor, { link: true, url } as any, {
      match: (n) => !Editor.isEditor(n) && (n as any).text !== undefined,
      split: true
    })
  }
}

export function unwrapLink(editor: SlateEditor) {
  Transforms.unsetNodes(editor, ['link', 'url'] as any, {
    match: (n) => !Editor.isEditor(n) && (n as any).text !== undefined
  })
}
