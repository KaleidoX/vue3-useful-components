<template>
  <div class="editor-sheetjs" :style="styles">
    <div class="mb-4 flex gap-2">
      <input type="file" accept=".xlsx,.xls,.csv" @change="handleImport" />
      <button class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600" @click="handleExport">
        导出 .xlsx
      </button>
    </div>
    <div class="overflow-auto border rounded">
      <table v-if="data.length" class="min-w-full border-collapse">
        <thead>
          <tr>
            <th v-for="ci in maxCols" :key="ci" class="border bg-gray-100 px-2 py-1 text-left text-sm font-semibold">
              {{ colName(ci - 1) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in data" :key="ri">
            <td v-for="ci in maxCols" :key="ci" class="border px-2 py-1 text-sm">
              <input v-model="data[ri][ci - 1]" class="w-full border-none outline-none" />
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="p-8 text-center text-gray-400">{{ placeholder }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import * as XLSX from 'xlsx'

defineOptions({ name: 'EditorSheetJS' })

const props = withDefaults(defineProps<{
  modelValue?: string[][]
  height?: number
  placeholder?: string
}>(), {
  placeholder: '导入 .xlsx/.xls/.csv 文件'
})

const emit = defineEmits<{
  'update:modelValue': [value: string[][]]
  imported: [data: string[][]]
}>()

const data = ref<string[][]>(props.modelValue || [])

const maxCols = computed(() => {
  let max = 0
  for (const row of data.value) {
    if (row.length > max) max = row.length
  }
  return max
})

const styles = computed<CSSProperties>(() => ({
  ...(props.height ? { height: `${props.height}px` } : {})
}))

function colName(i: number): string {
  let s = ''
  let n = i
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  }
  return s
}

function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const wb = XLSX.read(ev.target!.result, { type: 'binary' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    data.value = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
    emit('imported', data.value)
  }
  reader.readAsBinaryString(file)
}

function handleExport() {
  const ws = XLSX.utils.aoa_to_sheet(data.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, 'export.xlsx')
}

watch(data, (val) => emit('update:modelValue', val), { deep: true })

const getData = () => data.value
const clear = () => { data.value = [] }
defineExpose({ getData, clear, handleExport })
</script>
