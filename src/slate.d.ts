import type { BaseEditor, Descendant } from 'slate'
import type { DOMEditor } from 'slate-vue3/dom'
import type { HistoryEditor } from 'slate-history'

declare module 'slate' {
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
