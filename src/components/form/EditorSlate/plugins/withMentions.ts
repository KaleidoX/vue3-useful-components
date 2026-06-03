import { Editor, Transforms, Range } from 'slate-vue3/core'
import type { SlateEditor } from '../types'

export interface MentionUser {
  id: string
  name: string
}

export function withMentions(editor: SlateEditor): SlateEditor {
  const { isInline, isVoid } = editor

  editor.isInline = (element) => {
    return (element as any).type === 'mention' ? true : isInline(element)
  }

  editor.isVoid = (element) => {
    return (element as any).type === 'mention' ? true : isVoid(element)
  }

  return editor
}

export function insertMention(editor: SlateEditor, user: MentionUser) {
  const mention = {
    type: 'mention',
    userId: user.id,
    userName: user.name,
    children: [{ text: '' }]
  }
  Transforms.insertNodes(editor, mention as any)
  Transforms.move(editor)
  Transforms.insertText(editor, ' ')
}

const MENTION_TRIGGER = '@'

export function onMentionKeyDown(event: KeyboardEvent, editor: SlateEditor) {
  if (event.key === ' ') {
    const { selection } = editor
    if (!selection || !Range.isCollapsed(selection)) return

    const [start] = Range.edges(selection)
    const wordBefore = Editor.before(editor, start, { unit: 'word' })
    const before = wordBefore && Editor.before(editor, wordBefore)
    const beforeRange = before && Editor.range(editor, before, start)
    const beforeText = beforeRange && Editor.string(editor, beforeRange)

    if (beforeText && beforeText.startsWith(MENTION_TRIGGER)) {
      event.preventDefault()
      const search = beforeText.slice(1)
      handleMentionTrigger(editor, search)
    }
  }
}

function handleMentionTrigger(editor: SlateEditor, search: string) {
  // 基础实现：插入硬编码提及（后续可扩展为下拉选择器）
  insertMention(editor, { id: search, name: search })
}
