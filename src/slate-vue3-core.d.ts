import type { BaseEditor } from 'slate-vue3/core'
import type { DOMEditor } from 'slate-vue3/dom'
import type { HistoryEditor } from 'slate-vue3/history'

declare module 'slate-vue3/core' {
  interface CustomTypes {
    Editor: BaseEditor & DOMEditor & HistoryEditor
    Element: {
      type: string
      level?: number
      language?: string
      url?: string
      alt?: string
      children: Descendant[]
    }
    Text: {
      text: string
      bold?: boolean
      italic?: boolean
      underline?: boolean
      strikethrough?: boolean
      code?: boolean
      link?: boolean
      url?: string
    }
  }
}
