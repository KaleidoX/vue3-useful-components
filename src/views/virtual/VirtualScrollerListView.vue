<script setup lang="ts">
import { useDemoData } from '@/components/virtual/shared/useDemoData'
import VirtualDemoLayout from '@/components/virtual/shared/VirtualDemoLayout.vue'
import VirtualScrollerList from '@/components/virtual/virtual-scroller/VirtualScrollerList.vue'

defineOptions({
  name: 'VirtualVirtualScrollerListView'
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
    title="vue-virtual-scroller"
  >
    <VirtualScrollerList
      :data="data"
      :content-type="contentType"
      @update:checked="handleCheckedUpdate"
    />
  </VirtualDemoLayout>
</template>
