<template>
  <div class="editor-prosemirror">
    <div class="mb-2 flex flex-wrap gap-2">
      <button type="button" class="pm-button" @click="mergeSampleCells">合并 A1:B2</button>
      <button type="button" class="pm-button" @click="splitSampleCell">拆分合并单元格</button>
    </div>
    <div ref="host" class="pm-host" />
  </div>
</template>

<script lang="ts" setup>
import { baseKeymap } from 'prosemirror-commands'
import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { EditorState } from 'prosemirror-state'
import { tableEditing } from 'prosemirror-tables'
import { EditorView } from 'prosemirror-view'

import {
  mergeSampleProseMirrorCells,
  prosemirrorTableSchema,
  splitSampleProseMirrorCell
} from './prosemirrorTable'

defineOptions({ name: 'EditorProseMirror' })

const props = defineProps<{ modelValue: Record<string, unknown> }>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, unknown>] }>()
const host = ref<HTMLDivElement>()
let view: EditorView | undefined

function createState(value: Record<string, unknown>) {
  return EditorState.create({
    doc: prosemirrorTableSchema.nodeFromJSON(value),
    plugins: [history(), keymap(baseKeymap), tableEditing()]
  })
}

onMounted(() => {
  if (!host.value) return
  view = new EditorView(host.value, {
    state: createState(props.modelValue),
    dispatchTransaction(transaction) {
      if (!view) return
      view.updateState(view.state.apply(transaction))
      emit('update:modelValue', view.state.doc.toJSON())
    }
  })
})

watch(
  () => props.modelValue,
  (value) => {
    if (view && JSON.stringify(view.state.doc.toJSON()) !== JSON.stringify(value)) {
      view.updateState(createState(value))
    }
  },
  { deep: true }
)

onUnmounted(() => {
  view?.destroy()
  view = undefined
})

const mergeSampleCells = () => (view ? mergeSampleProseMirrorCells(view) : false)
const splitSampleCell = () => (view ? splitSampleProseMirrorCell(view) : false)

defineExpose({
  getJSON: () => view?.state.doc.toJSON() ?? props.modelValue,
  mergeSampleCells,
  splitSampleCell
})
</script>

<style scoped>
.pm-button {
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.pm-host :deep(.ProseMirror) {
  min-height: 280px;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 1rem;
  outline: none;
}

.pm-host :deep(table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

.pm-host :deep(td),
.pm-host :deep(th) {
  min-width: 80px;
  border: 1px solid #9ca3af;
  padding: 0.5rem;
  vertical-align: top;
}

.pm-host :deep(.selectedCell::after) {
  position: absolute;
  inset: 0;
  background: rgb(59 130 246 / 18%);
  content: '';
  pointer-events: none;
}

.pm-host :deep(.selectedCell) {
  position: relative;
}
</style>
