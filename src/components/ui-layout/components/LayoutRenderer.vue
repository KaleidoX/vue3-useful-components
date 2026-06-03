<script setup lang="ts">
import ContainerHost from './ContainerHost.vue'
import SplitPane from './SplitPane.vue'
import type { PanelDefinition } from '../core/types'
import { isContainerNode, isSplitNode } from '../domain'
import type { LayoutNode, LayoutSize } from '../domain'

defineProps<{
  node: LayoutNode
  definitions: PanelDefinition[]
}>()

const emit = defineEmits<{
  'resize-end': [nodeId: string, sizes: LayoutSize[]]
  collapse: [nodeId: string, childIndex: number]
  'panel-select': [containerId: string, panelId: string]
  'panel-close': [containerId: string, panelId: string]
}>()
</script>

<template>
  <SplitPane
    v-if="isSplitNode(node)"
    :key="node.id"
    :node="node"
    @resize-end="(nodeId, sizes) => emit('resize-end', nodeId, sizes)"
    @collapse="(nodeId, childIndex) => emit('collapse', nodeId, childIndex)"
  >
    <template v-for="child in node.children" :key="child.id" #[child.id]>
      <LayoutRenderer
        :node="child"
        :definitions="definitions"
        @resize-end="(nodeId, sizes) => emit('resize-end', nodeId, sizes)"
        @collapse="(nodeId, childIndex) => emit('collapse', nodeId, childIndex)"
        @panel-select="(cId, pId) => emit('panel-select', cId, pId)"
        @panel-close="(cId, pId) => emit('panel-close', cId, pId)"
      />
    </template>
  </SplitPane>

  <ContainerHost
    v-else-if="isContainerNode(node)"
    :key="node.id"
    :node="node"
    :definitions="definitions"
    @panel-select="(cId, pId) => emit('panel-select', cId, pId)"
    @panel-close="(cId, pId) => emit('panel-close', cId, pId)"
  />

  <div v-else class="p-5 text-red-400">Unknown node type: {{ (node as any).type }}</div>
</template>
