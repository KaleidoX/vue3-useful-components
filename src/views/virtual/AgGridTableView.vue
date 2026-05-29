<script setup lang="ts">
import { useTableData } from '@/components/virtual/shared/useTableData'
import VirtualDemoLayout from '@/components/virtual/shared/VirtualDemoLayout.vue'
import AgGridTable from '@/components/virtual/ag-grid/AgGridTable.vue'

defineOptions({ name: 'VirtualAgGridTableView' })

const count = ref(1000)
const contentType = ref('plain')
const enableMemo = ref(false)
const { data } = useTableData(count)

function handleCellUpdate(rowId: number, col: string, value: string | boolean | number) {
  const rows = [...data.value]
  const idx = rows.findIndex((r) => r.id === rowId)
  if (idx !== -1) { rows[idx] = { ...rows[idx], [col]: value }; data.value = rows }
}
</script>

<template>
  <VirtualDemoLayout v-model:count="count" v-model:content-type="contentType" v-model:enable-memo="enableMemo"
    title="AG Grid Community 表格" show-editable>
    <AgGridTable :data="data" :content-type="contentType" @update:cell="handleCellUpdate" />
  </VirtualDemoLayout>
</template>
