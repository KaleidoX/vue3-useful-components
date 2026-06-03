<template>
  <div class="slate-toolbar">
    <div v-for="(group, gi) in buttonGroups" :key="gi" class="slate-toolbar__group">
      <span v-if="gi > 0" class="slate-toolbar__divider" />
      <button
        v-for="btn in group"
        :key="btn.icon"
        :title="btn.title"
        :class="['slate-toolbar__btn', { 'slate-toolbar__btn--active': isActive(btn) }]"
        @mousedown.prevent="handleAction(btn)"
      >
        <i :class="btn.icon" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Editor, Transforms, Element as SlateElement } from 'slate-vue3/core'
import { TOOLBAR_BUTTONS } from './constants'
import type { SlateEditor } from './types'

defineOptions({ name: 'SlateToolbar' })

const props = withDefaults(
  defineProps<{
    editor?: SlateEditor | null
    simple?: boolean
  }>(),
  {
    simple: false
  }
)

const buttonGroups = computed(() => {
  return props.simple ? TOOLBAR_BUTTONS.simple : TOOLBAR_BUTTONS.full
})

function isActive(btn: any): boolean {
  if (!props.editor) return false
  const { selection } = props.editor
  if (!selection) return false

  if (btn.mark) {
    const marks = Editor.marks(props.editor)
    return marks ? (marks as Record<string, unknown>)[btn.mark] === true : false
  }

  if (btn.action === 'toggleBlock' && btn.block) {
    const [match] = Array.from(
      Editor.nodes(props.editor, {
        at: Editor.unhangRange(props.editor, selection),
        match: (n) =>
          (n as any).type === btn.block && (!btn.level || (n as any).level === btn.level)
      })
    )
    return !!match
  }

  return false
}

function handleAction(btn: any) {
  if (!props.editor) return

  switch (btn.action) {
    case 'undo':
      props.editor.undo()
      break
    case 'redo':
      props.editor.redo()
      break
    case 'toggleMark':
      toggleMark(btn.mark)
      break
    case 'toggleBlock':
      toggleBlock(btn.block, btn.level)
      break
    case 'insertImage': {
      const url = window.prompt('请输入图片 URL:')
      if (url) {
        Transforms.insertNodes(props.editor, {
          type: 'image',
          url,
          alt: '',
          children: [{ text: '' }]
        } as any)
      }
      break
    }
    case 'insertLink': {
      const url = window.prompt('请输入链接 URL:')
      if (url) {
        const text = props.editor.selection
          ? Editor.string(props.editor, props.editor.selection) || url
          : url
        Transforms.insertNodes(props.editor, {
          type: 'paragraph',
          children: [{ text, link: true, url }]
        } as any)
      }
      break
    }
    case 'insertTable':
      insertTable()
      break
    case 'insertDivider':
      Transforms.insertNodes(props.editor, {
        type: 'thematic-break',
        children: [{ text: '' }]
      } as any)
      break
  }
}

function toggleMark(mark: string) {
  if (!props.editor) return
  const marks = Editor.marks(props.editor)
  const isActive = marks ? (marks as Record<string, unknown>)[mark] === true : false
  if (isActive) {
    Editor.removeMark(props.editor, mark)
  } else {
    Editor.addMark(props.editor, mark, true)
  }
}

function toggleBlock(block: string, level?: number) {
  if (!props.editor) return

  const isList = block === 'bulleted-list' || block === 'numbered-list'
  const isActive = isBlockActive(block, level)

  if (isList) {
    Transforms.unwrapNodes(props.editor, {
      match: (n: { type?: string }) =>
        !!n.type && ['bulleted-list', 'numbered-list'].includes(n.type),
      split: true
    } as any)

    if (!isActive) {
      const nodeProps: any = { type: 'list-item' }
      Transforms.setNodes(props.editor, nodeProps as any)
      const listBlock = { type: block, children: [] } as any
      Transforms.wrapNodes(props.editor, listBlock)
    } else {
      Transforms.setNodes(props.editor, { type: 'paragraph' } as any)
    }
  } else if (block === 'heading') {
    Transforms.setNodes(props.editor, {
      type: isActive ? 'paragraph' : 'heading',
      level: isActive ? undefined : level || 1
    } as any)
  } else {
    Transforms.setNodes(props.editor, {
      type: isActive ? 'paragraph' : block
    } as any)
  }
}

function isBlockActive(block: string, level?: number): boolean {
  if (!props.editor) return false
  const { selection } = props.editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(props.editor, {
      at: Editor.unhangRange(props.editor, selection),
      match: (n) => {
        if (!SlateElement.isElement(n)) return false
        const el = n as any
        if (el.type !== block) return false
        if (level && el.level !== level) return false
        return true
      }
    })
  )
  return !!match
}

function insertTable() {
  if (!props.editor) return

  const rows = 3
  const cols = 3

  const tableRows = Array.from({ length: rows }, () => ({
    type: 'table-row' as const,
    children: Array.from({ length: cols }, () => ({
      type: 'table-cell' as const,
      children: [{ type: 'paragraph' as const, children: [{ text: '' }] }]
    }))
  }))

  Transforms.insertNodes(props.editor, {
    type: 'table',
    children: tableRows
  } as any)
}
</script>

<style scoped>
.slate-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.slate-toolbar__group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.slate-toolbar__divider {
  width: 1px;
  background: #d1d5db;
  margin: 2px 6px;
  align-self: stretch;
}

.slate-toolbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 4px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  color: #374151;
}

.slate-toolbar__btn:hover {
  background: #e5e7eb;
}

.slate-toolbar__btn--active {
  background: #dbeafe;
  color: #2563eb;
  border-color: #93c5fd;
}
</style>
