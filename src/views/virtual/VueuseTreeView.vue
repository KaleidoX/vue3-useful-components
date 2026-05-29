<script setup lang="ts">
import { useTreeData } from '@/components/virtual/shared/useTreeData'
import VirtualDemoLayout from '@/components/virtual/shared/VirtualDemoLayout.vue'
import VueuseTree from '@/components/virtual/vueuse/VueuseTree.vue'

defineOptions({ name: 'VirtualVueuseTreeView' })

const count = ref(100)
const contentType = ref('plain')
const enableMemo = ref(false)
const { allNodes, toggleExpand } = useTreeData(count)

function handleCheckedUpdate(id: number, checked: boolean) {
  const nodes = [...allNodes.value]
  const idx = nodes.findIndex((n) => n.id === id)
  if (idx !== -1) {
    nodes[idx] = { ...nodes[idx], checked }
    allNodes.value = nodes
  }
}
</script>

<template>
  <VirtualDemoLayout
    v-model:count="count"
    v-model:content-type="contentType"
    v-model:enable-memo="enableMemo"
    title="VueUse useVirtualList 树"
  >
    <VueuseTree
      :nodes="allNodes"
      :content-type="contentType"
      @toggle="toggleExpand"
      @update:checked="handleCheckedUpdate"
    />
  </VirtualDemoLayout>
</template>
