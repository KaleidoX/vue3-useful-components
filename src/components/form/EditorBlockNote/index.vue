<template>
  <div class="editor-blocknote-wrapper">
    <div class="mb-2 flex flex-wrap gap-2">
      <button type="button" class="blocknote-button" @click="bridge?.mergeSampleCells()">
        合并 A1:B2
      </button>
      <button type="button" class="blocknote-button" @click="bridge?.splitSampleCell()">
        拆分合并单元格
      </button>
    </div>
    <div ref="host" class="editor-blocknote" />
  </div>
</template>

<script lang="ts" setup>
import { mountBlockNote, type BlockNoteBridge } from './blockNoteBridge'

defineOptions({ name: 'EditorBlockNote' })

const props = defineProps<{ modelValue: unknown[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown[]] }>()
const host = ref<HTMLDivElement>()
let bridge: BlockNoteBridge | undefined

onMounted(() => {
  if (!host.value) return
  bridge = mountBlockNote(host.value, props.modelValue, (value) =>
    emit('update:modelValue', JSON.parse(JSON.stringify(value)) as unknown[])
  )
})

onUnmounted(() => {
  bridge?.destroy()
  bridge = undefined
})

defineExpose({
  getDocument: () => bridge?.getDocument() ?? props.modelValue,
  mergeSampleCells: () => bridge?.mergeSampleCells() ?? false,
  splitSampleCell: () => bridge?.splitSampleCell() ?? false
})
</script>

<style scoped>
.editor-blocknote {
  min-height: 320px;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: visible;
}

.blocknote-button {
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
</style>
