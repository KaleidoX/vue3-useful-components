<template>
  <div class="relative h-full w-full">
    <div class="absolute left-2 top-2 z-20 flex gap-1 rounded bg-white/90 px-2 py-1 shadow">
      <button
        v-for="n in [10, 50, 100]"
        :key="n"
        :class="['px-2 py-0.5 text-xs rounded', nodeCount === n ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200']"
        @click="generateGraph(n)"
      >
        {{ n }}
      </button>
    </div>
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
    </VueFlow>
    <div class="pointer-events-none absolute bottom-2 right-2 z-10 rounded bg-white/80 px-2 py-1 text-xs text-gray-400 shadow">
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

defineOptions({
  name: 'FlowVueFlow',
})

const nodeCount = ref(10)

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

function generateGraph(count: number) {
  nodeCount.value = count
  const COLS = 5,
    GAP_X = 180,
    GAP_Y = 80
  const newNodes: Node[] = []
  for (let i = 0; i < count; i++) {
    newNodes.push({
      id: String(i + 1),
      position: { x: 40 + (i % COLS) * GAP_X, y: 40 + Math.floor(i / COLS) * GAP_Y },
      data: { label: `N${i + 1}` },
      type: 'default',
    })
  }
  const newEdges: Edge[] = []
  for (let i = 0; i < count - 1; i++) {
    newEdges.push({ id: `e${i + 1}-${i + 2}`, source: String(i + 1), target: String(i + 2) })
    if (i % 7 === 0 && i + 5 < count) {
      newEdges.push({ id: `e${i + 1}-${i + 6}`, source: String(i + 1), target: String(i + 6) })
    }
  }
  nodes.value = newNodes
  edges.value = newEdges
}

generateGraph(10)
</script>
