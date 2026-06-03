<template>
  <div class="relative h-full w-full">
    <FlowToolbar
      :mode="mode"
      :node-count="nodeCount"
      @update:mode="onModeChange"
      @update:node-count="onNodeCountChange"
    />
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :default-viewport="{ zoom: 1 }"
      fit-view-on-init
      :pan-on-scroll="true"
      :zoom-on-scroll="true"
      zoom-activation-key-code="Control"
    >
      <Background />
      <Controls position="bottom-left" />
      <MiniMap position="bottom-right" />
      <template #node-default="props">
        <div
          class="cursor-pointer border-2 border-blue-600 rounded bg-blue-500 px-4 py-2 text-sm text-white font-medium shadow"
        >
          {{ props.data.label }}
        </div>
      </template>
      <template #node-info="props">
        <FlowNodeInfo
          :title="props.data.title"
          :subtitle="props.data.subtitle"
          :status="props.data.status"
          :status-label="props.data.statusLabel"
        />
      </template>
      <template #node-form="props">
        <FlowNodeForm
          :title="props.data.label"
          :input-value="formData.find((n) => n.id === props.id)?.inputValue ?? ''"
          :select-value="formData.find((n) => n.id === props.id)?.selectValue ?? 'option1'"
          :toggle-value="formData.find((n) => n.id === props.id)?.toggleValue ?? false"
          @update:input-value="(val: string) => updateFormInput(props.id, val)"
          @update:select-value="(val: string) => updateFormSelect(props.id, val)"
          @update:toggle-value="(val: boolean) => updateFormToggle(props.id, val)"
        />
      </template>
    </VueFlow>
    <div
      class="pointer-events-none absolute bottom-2 right-2 z-10 rounded bg-white/80 px-2 py-1 text-xs text-gray-400 shadow"
    >
      滚轮平移 | Ctrl+滚轮缩放
    </div>
  </div>
</template>

<script lang="ts" setup>
import '@vue-flow/core/dist/style.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import { VueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import FlowNodeInfo from './nodes/FlowNodeInfo.vue'
import FlowNodeForm from './nodes/FlowNodeForm.vue'
import FlowToolbar from './FlowToolbar.vue'
import { useFlowData, SIMPLE_GAP_X, SIMPLE_GAP_Y } from './composables/useFlowData'
import type { FlowMode } from './composables/useFlowData'

defineOptions({
  name: 'FlowVueFlow'
})

const {
  mode,
  nodeCount,
  infoData,
  formData,
  getSimpleNodes,
  getSimpleEdges,
  getInfoPosition,
  getFormPosition,
  getComplexEdges,
  updateFormInput,
  updateFormSelect,
  updateFormToggle
} = useFlowData()

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

function onModeChange(newMode: FlowMode) {
  mode.value = newMode
}

function onNodeCountChange(newCount: number) {
  nodeCount.value = newCount
}

function regenerateGraph() {
  if (mode.value === 'simple') {
    const simpleNodes = getSimpleNodes()
    const newNodes: Node[] = []
    for (const n of simpleNodes) {
      newNodes.push({
        id: n.id,
        type: 'default',
        position: { x: 50 + n.col * SIMPLE_GAP_X, y: 50 + n.row * SIMPLE_GAP_Y },
        data: { label: n.label }
      })
    }
    nodes.value = newNodes
    const simpleEdges = getSimpleEdges()
    const newEdges: Edge[] = []
    for (const e of simpleEdges) {
      newEdges.push({ id: e.id, source: e.source, target: e.target })
    }
    edges.value = newEdges
  } else {
    const newNodes: Node[] = []
    for (const [i, d] of infoData.entries()) {
      const pos = getInfoPosition(i)
      newNodes.push({
        id: d.id,
        type: 'info',
        position: pos,
        data: { title: d.title, subtitle: d.subtitle, status: d.status, statusLabel: d.statusLabel }
      })
    }
    for (const [i, d] of formData.entries()) {
      const pos = getFormPosition(i)
      newNodes.push({
        id: d.id,
        type: 'form',
        position: pos,
        data: { label: d.title }
      })
    }
    nodes.value = newNodes
    const complexEdges = getComplexEdges()
    const newEdges: Edge[] = []
    for (const e of complexEdges) {
      newEdges.push({ id: e.id, source: e.source, target: e.target })
    }
    edges.value = newEdges
  }
}

watch([mode, nodeCount], regenerateGraph, { immediate: true })
</script>
