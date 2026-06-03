<script setup lang="ts">
import { useDemoData } from '@/components/virtual/shared/useDemoData'
import VirtualDemoLayout from '@/components/virtual/shared/VirtualDemoLayout.vue'
import ElTableV2List from '@/components/virtual/el-table-v2/ElTableV2List.vue'

defineOptions({
  name: 'VirtualElTableV2ListView'
})

const count = ref(1000)
const contentType = ref('plain')
const enableMemo = ref(false)
const { data } = useDemoData(count, contentType)

function handleCheckedUpdate(id: number, checked: boolean) {
  const items = [...data.value]
  const idx = items.findIndex((item) => item.id === id)
  if (idx !== -1) {
    items[idx] = { ...items[idx], checked }
    data.value = items
  }
}
</script>

<template>
  <VirtualDemoLayout
    v-model:count="count"
    v-model:content-type="contentType"
    v-model:enable-memo="enableMemo"
    title="Element Plus Table V2"
  >
    <ElTableV2List :data="data" :content-type="contentType" @update:checked="handleCheckedUpdate" />
  </VirtualDemoLayout>
</template>
