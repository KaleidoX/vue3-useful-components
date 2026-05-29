<script setup lang="ts">
import { useTableData } from '@/components/virtual/shared/useTableData'
import VirtualDemoLayout from '@/components/virtual/shared/VirtualDemoLayout.vue'
import TanStackTable from '@/components/virtual/tanstack/TanStackTable.vue'

defineOptions({ name: 'VirtualTanStackTableView' })

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
    title="TanStack Virtual 表格" show-editable>
    <TanStackTable :data="data" :content-type="contentType" @update:cell="handleCellUpdate" />
  </VirtualDemoLayout>
</template>
