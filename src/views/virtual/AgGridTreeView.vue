<script setup lang="ts">
import { useTreeData } from '@/components/virtual/shared/useTreeData'
import VirtualDemoLayout from '@/components/virtual/shared/VirtualDemoLayout.vue'
import AgGridTree from '@/components/virtual/ag-grid/AgGridTree.vue'

defineOptions({ name: 'VirtualAgGridTreeView' })

const count = ref(100)
const contentType = ref('plain')
const enableMemo = ref(false)
const { allNodes } = useTreeData(count)
</script>

<template>
  <VirtualDemoLayout
    v-model:count="count"
    v-model:content-type="contentType"
    v-model:enable-memo="enableMemo"
    title="AG Grid Community 树"
  >
    <AgGridTree :nodes="allNodes" :content-type="contentType" />
  </VirtualDemoLayout>
</template>
