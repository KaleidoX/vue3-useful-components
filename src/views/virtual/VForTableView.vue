<script setup lang="ts">
import { useTableData } from '@/components/virtual/shared/useTableData'
import VirtualDemoLayout from '@/components/virtual/shared/VirtualDemoLayout.vue'
import VForTable from '@/components/virtual/vfor/VForTable.vue'

defineOptions({ name: 'VirtualVForTableView' })

const count = ref(1000)
const contentType = ref('plain')
const enableMemo = ref(false)
const { data } = useTableData(count)

function handleCellUpdate(rowId: number, col: string, value: string | boolean | number) {
  const rows = [...data.value]
  const idx = rows.findIndex((r) => r.id === rowId)
  if (idx !== -1) {
    rows[idx] = { ...rows[idx], [col]: value }
    data.value = rows
  }
}
</script>

<template>
  <VirtualDemoLayout
    v-model:count="count"
    v-model:content-type="contentType"
    v-model:enable-memo="enableMemo"
    title="v-for 表格"
    :max-count="5000"
    show-editable
  >
    <VForTable :data="data" :content-type="contentType" @update:cell="handleCellUpdate" />
  </VirtualDemoLayout>
</template>
