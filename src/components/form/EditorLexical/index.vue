<template>
  <div class="editor-lexical">
    <div class="mb-2 flex flex-wrap gap-2">
      <button type="button" class="lexical-button" @click="mergeSampleCells">合并 A1:B2</button>
      <button type="button" class="lexical-button" @click="splitSampleCell">拆分合并单元格</button>
    </div>
    <div ref="host" class="lexical-host" contenteditable="true" />
  </div>
</template>

<script lang="ts" setup>
import { registerRichText } from '@lexical/rich-text'
import { registerTablePlugin } from '@lexical/table'
import type { LexicalEditor } from 'lexical'

import {
  createLexicalTableEditor,
  mergeSampleLexicalCells,
  seedLexicalTable,
  splitSampleLexicalCell
} from './lexicalTable'

defineOptions({ name: 'EditorLexical' })

const props = withDefaults(defineProps<{ modelValue?: string; readOnly?: boolean }>(), {
  modelValue: '',
  readOnly: false
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const host = ref<HTMLDivElement>()
let editor: LexicalEditor | undefined
let cleanups: Array<() => void> = []

onMounted(() => {
  if (!host.value) return
  editor = createLexicalTableEditor()
  editor.setRootElement(host.value)
  editor.setEditable(!props.readOnly)
  cleanups = [registerRichText(editor), registerTablePlugin(editor)]
  cleanups.push(
    editor.registerUpdateListener(({ editorState }) => emit('update:modelValue', JSON.stringify(editorState)))
  )
  if (props.modelValue) editor.setEditorState(editor.parseEditorState(props.modelValue))
  else seedLexicalTable(editor)
})

watch(
  () => props.modelValue,
  (value) => {
    if (editor && value && JSON.stringify(editor.getEditorState()) !== value) {
      editor.setEditorState(editor.parseEditorState(value))
    }
  }
)

watch(() => props.readOnly, (value) => editor?.setEditable(!value))

onUnmounted(() => {
  cleanups.forEach((cleanup) => cleanup())
  cleanups = []
  editor?.setRootElement(null)
  editor = undefined
})

const mergeSampleCells = () => (editor ? mergeSampleLexicalCells(editor) : false)
const splitSampleCell = () => (editor ? splitSampleLexicalCell(editor) : false)

defineExpose({
  getJSON: () => (editor ? JSON.stringify(editor.getEditorState()) : props.modelValue),
  mergeSampleCells,
  splitSampleCell
})
</script>

<style scoped>
.lexical-button {
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.lexical-host {
  min-height: 280px;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 1rem;
  outline: none;
}

.lexical-host :deep(.lexical-table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

.lexical-host :deep(.lexical-table-cell) {
  min-width: 80px;
  border: 1px solid #9ca3af;
  padding: 0.5rem;
  vertical-align: top;
}
</style>
