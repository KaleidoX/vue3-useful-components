<template>
  <div class="editor-jodit">
    <textarea ref="host" />
  </div>
</template>

<script lang="ts" setup>
import { Jodit } from 'jodit'
import { Table } from 'jodit/esm/modules/table/table.js'
import 'jodit/es2021/jodit.min.css'

defineOptions({ name: 'EditorJodit' })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    height?: number | string
    minHeight?: number | string
    readOnly?: boolean
    placeholder?: string
    simple?: boolean
  }>(),
  {
    modelValue: '',
    height: 420,
    minHeight: 240,
    readOnly: false,
    placeholder: '请输入内容',
    simple: false
  }
)

const emit = defineEmits<{
  ready: [editor: Jodit]
  'update:modelValue': [value: string]
}>()

const host = ref<HTMLTextAreaElement>()
let editor: Jodit | undefined

type JoditTableModule = {
  addSelection: (cell: HTMLTableCellElement) => void
  getAllSelectedCells: () => HTMLTableCellElement[]
  mergeSelected: (table: HTMLTableElement) => void
  removeSelection: (cell: HTMLTableCellElement) => void
  splitHorizontal: (table: HTMLTableElement) => void
  splitVertical: (table: HTMLTableElement) => void
}

function handleChange() {
  if (editor) emit('update:modelValue', editor.value)
}

function selectCells(cells: HTMLTableCellElement[]) {
  if (!editor || cells.length === 0) return false
  const tableModule = editor.getInstance(Table, editor.o) as unknown as JoditTableModule
  tableModule.getAllSelectedCells().forEach((cell) => tableModule.removeSelection(cell))
  cells.forEach((cell) => tableModule.addSelection(cell))
  return true
}

function getFirstTableCells() {
  return editor
    ? Array.from(editor.editor.querySelectorAll<HTMLTableCellElement>('table:first-of-type td'))
    : []
}

function mergeSampleCells() {
  const cells = getFirstTableCells()
  if (!selectCells([cells[0], cells[1], cells[3], cells[4]].filter(Boolean))) return false
  const table = cells[0]?.closest('table')
  if (!editor || !table) return false
  const tableModule = editor.getInstance(Table, editor.o) as unknown as JoditTableModule
  tableModule.mergeSelected(table)
  editor.synchronizeValues()
  handleChange()
  return true
}

function splitSampleCell() {
  const cell = getFirstTableCells()[0]
  if (!cell || !selectCells([cell])) return false
  const table = cell.closest('table')
  if (!editor || !table) return false
  const tableModule = editor.getInstance(Table, editor.o) as unknown as JoditTableModule
  const columnMergedCell = getFirstTableCells().find((currentCell) => currentCell.colSpan > 1)
  if (columnMergedCell && selectCells([columnMergedCell])) tableModule.splitVertical(table)
  for (const rowMergedCell of getFirstTableCells().filter(
    (currentCell) => currentCell.rowSpan > 1
  )) {
    if (selectCells([rowMergedCell])) tableModule.splitHorizontal(table)
  }
  editor.synchronizeValues()
  handleChange()
  return true
}

onMounted(() => {
  if (!host.value) return
  editor = Jodit.make(host.value, {
    height: props.height,
    minHeight: props.minHeight,
    readonly: props.readOnly,
    placeholder: props.placeholder,
    ...(props.simple
      ? { buttons: ['bold', 'italic', 'underline', '|', 'ul', 'ol', '|', 'link'] }
      : {})
  })
  editor.value = props.modelValue
  editor.events.on('change', handleChange)
  emit('ready', editor)
})

watch(
  () => props.modelValue,
  (value) => {
    if (editor && editor.value !== value) editor.value = value
  }
)

watch(
  () => props.readOnly,
  (value) => editor?.setReadOnly(value)
)

onUnmounted(() => {
  editor?.events.off('change', handleChange)
  editor?.destruct()
  editor = undefined
})

defineExpose({
  getEditor: () => editor,
  getValue: () => editor?.value ?? props.modelValue,
  mergeSampleCells,
  splitSampleCell
})
</script>

<style scoped>
.editor-jodit {
  min-width: 0;
}
</style>
