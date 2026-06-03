import type { BaseEditor } from 'slate-vue3/core'
import type { DOMEditor } from 'slate-vue3/dom'
import type { HistoryEditor } from 'slate-vue3/history'

export type SlateEditor = BaseEditor &
  DOMEditor &
  HistoryEditor & {
    // 插件扩展的编辑器属性在此声明
  }

export type HeadingLevel = 1 | 2 | 3

export type BlockElementType =
  | 'paragraph'
  | 'heading'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'
  | 'block-quote'
  | 'code-block'
  | 'thematic-break'
  | 'image'
  | 'table'
  | 'table-row'
  | 'table-cell'
  | 'mention'

export interface MarkFormat {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

export interface LinkFormat {
  url: string
}

export interface ToolbarButton {
  icon: string
  title: string
  action: string
  mark?: keyof MarkFormat
}
