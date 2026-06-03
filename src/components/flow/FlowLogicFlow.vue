<template>
  <div class="relative h-full w-full">
    <div class="absolute left-2 top-2 z-20 flex gap-1 rounded bg-white/90 px-2 py-1 shadow">
      <button
        v-for="n in [10, 50, 100]"
        :key="n"
        :class="['px-2 py-0.5 text-xs rounded', nodeCount === n ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200']"
        @click="setNodeCount(n)"
      >
        {{ n }}
      </button>
    </div>
    <div ref="containerRef" class="h-full w-full" />
    <div class="pointer-events-none absolute bottom-2 right-2 z-10 rounded bg-white/80 px-2 py-1 text-xs text-gray-400 shadow">
      滚轮平移 | Ctrl+滚轮缩放
    </div>
  </div>
</template>

<script lang="ts" setup>
import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/index.css'

defineOptions({
  name: 'FlowLogicFlow',
})

const containerRef = ref<HTMLElement>()
const nodeCount = ref(10)

let lf: LogicFlow

function setNodeCount(count: number) {
  if (!lf) return
  nodeCount.value = count
  const COLS = 5,
    GAP_X = 160,
    GAP_Y = 70
  const nodes: any[] = []
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: String(i + 1),
      type: i % 10 === 6 ? 'diamond' : 'rect',
      x: 40 + (i % COLS) * GAP_X,
      y: 40 + Math.floor(i / COLS) * GAP_Y,
      text: `N${i + 1}`,
    })
  }
  const edges: any[] = []
  for (let i = 0; i < count - 1; i++) {
    edges.push({
      id: `e${i + 1}-${i + 2}`,
      type: 'polyline',
      sourceNodeId: String(i + 1),
      targetNodeId: String(i + 2),
    })
    if (i % 7 === 0 && i + 5 < count) {
      edges.push({
        id: `e${i + 1}-cross${i}`,
        type: 'polyline',
        sourceNodeId: String(i + 1),
        targetNodeId: String(i + 6),
      })
    }
  }
  lf.render({ nodes, edges })
  lf.translateCenter()
}

onMounted(() => {
  if (!containerRef.value) return

  lf = new LogicFlow({
    container: containerRef.value,
    grid: true,
    keyboard: { enabled: true },
  })

  lf.setTheme({
    rect: { fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2 },
    diamond: { fill: '#f59e0b', stroke: '#d97706', strokeWidth: 2 },
  })

  setNodeCount(10)

  onUnmounted(() => {
    lf.destroy()
  })
})
</script>
