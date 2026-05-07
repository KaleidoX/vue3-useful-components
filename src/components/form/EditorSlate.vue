<template>
  <div class="editor-slate" :class="{ 'hidden-toolbar': hiddenToolbar }" :style="styles">
    <SlateToolbar v-if="editor && !hiddenToolbar" :editor="editor" :simple="simple" />
    <div class="slate-content">
      <Slate
        :editor="editor"
        :decorate="decorate"
        :render-element="renderElement"
        :render-leaf="renderLeaf"
        :render-placeholder="renderPlaceholder"
        @valuechange="handleChange"
      >
        <Editable
          class="slate-editable"
          :placeholder="placeholder"
          :read-only="readOnly"
          @keydown="handleKeyDown"
        />
      </Slate>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import { createEditor } from 'slate'
import { Slate, Editable } from 'slate-vue3'
import { withDOM } from 'slate-vue3/dom'
import { withHistory } from 'slate-vue3/history'
import { renderElement } from './EditorSlate/renders/renderElement'
import { renderLeaf } from './EditorSlate/renders/renderLeaf'
import { renderPlaceholder } from './EditorSlate/renders/renderPlaceholder'
import { withMarkdown } from './EditorSlate/plugins/withMarkdown'
import { withLinks } from './EditorSlate/plugins/withLinks'
import { withImages } from './EditorSlate/plugins/withImages'
import { withTables } from './EditorSlate/plugins/withTables'
import { withMentions, onMentionKeyDown } from './EditorSlate/plugins/withMentions'
import SlateToolbar from './EditorSlate/SlateToolbar.vue'
import { toHtml } from './EditorSlate/converters/toHtml'
import { toMarkdown } from './EditorSlate/converters/toMarkdown'
import { fromHtml } from './EditorSlate/converters/fromHtml'
import { fromMarkdown } from './EditorSlate/converters/fromMarkdown'
import type { Descendant } from 'slate'

defineOptions({ name: 'EditorSlate' })

const props = withDefaults(defineProps<{
  modelValue?: Descendant[]
  height?: string
  minHeight?: number
  placeholder?: string
  readOnly?: boolean
  hiddenToolbar?: boolean
  simple?: boolean
}>(), {
  modelValue: () => [],
  height: '400px',
  minHeight: 160,
  placeholder: '请输入内容...',
  readOnly: false,
  hiddenToolbar: false,
  simple: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Descendant[]]
}>()

const editor = withMentions(
  withTables(
    withImages(
      withLinks(
        withMarkdown(
          withHistory(withDOM(createEditor()))
        )
      )
    )
  )
)

const decorate = () => []

const initialValue: Descendant[] = props.modelValue && props.modelValue.length > 0
  ? [...props.modelValue]
  : [{ type: 'paragraph', children: [{ text: '基于 Slate.js + slate-vue3 的编辑器。' }] }]

editor.children = initialValue
editor.onChange()

const styles = computed<CSSProperties>(() => {
  const s: CSSProperties = { height: props.height }
  if (props.minHeight) s.minHeight = `${props.minHeight * 0.6}px`
  return s
})

function handleKeyDown(event: KeyboardEvent) {
  onMentionKeyDown(event, editor)
}

function handleChange() {
  emit('update:modelValue', [...(editor.children as Descendant[])])
}

function getEditor() {
  return editor
}

function getHTML(): string {
  return toHtml(editor.children as Descendant[])
}

function getMarkdown(): string {
  return toMarkdown(editor.children as Descendant[])
}

function clearContent() {
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any
  editor.onChange()
}

function setHTML(html: string) {
  const nodes = fromHtml(html)
  editor.children = nodes as any
  editor.onChange()
}

function setMarkdown(md: string) {
  const nodes = fromMarkdown(md)
  editor.children = nodes as any
  editor.onChange()
}

defineExpose({ getEditor, getHTML, getMarkdown, clearContent, setHTML, setMarkdown })
</script>

<style scoped>
.editor-slate {
  position: relative;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.slate-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.slate-editable {
  padding: 12px 16px;
  outline: none;
  min-height: 160px;
}

.hidden-toolbar .slate-toolbar {
  display: none;
}
</style>
