<script setup lang="ts">
import { useDemoData } from '@/components/virtual/shared/useDemoData'
import VirtualDemoLayout from '@/components/virtual/shared/VirtualDemoLayout.vue'
import TanStackList from '@/components/virtual/tanstack/TanStackList.vue'

defineOptions({
  name: 'VirtualTanStackListView',
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
    title="TanStack Virtual"
  >
    <TanStackList
      :data="data"
      :content-type="contentType"
      @update:checked="handleCheckedUpdate"
    />
  </VirtualDemoLayout>
</template>
