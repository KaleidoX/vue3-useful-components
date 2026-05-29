<script setup lang="ts">
import { useTreeData } from '@/components/virtual/shared/useTreeData'
import VirtualDemoLayout from '@/components/virtual/shared/VirtualDemoLayout.vue'
import VForTree from '@/components/virtual/vfor/VForTree.vue'

defineOptions({ name: 'VirtualVForTreeView' })

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
    title="v-for 树形列表"
    :max-count="5000"
  >
    <VForTree
      :nodes="allNodes"
      :content-type="contentType"
      @toggle="toggleExpand"
      @update:checked="handleCheckedUpdate"
    />
  </VirtualDemoLayout>
</template>
