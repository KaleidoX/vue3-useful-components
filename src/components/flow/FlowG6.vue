<template>
  <div class="relative h-full w-full">
    <div ref="containerRef" class="h-full w-full" />
    <div class="absolute left-2 top-2 z-20 flex gap-1 rounded bg-white/90 px-2 py-1 shadow">
      <button v-for="n in counts" :key="n"
        :class="['px-2 py-0.5 text-xs rounded', nodeCount === n ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200']"
        @click="setNodeCount(n)">{{ n }}</button>
    </div>
    <div class="pointer-events-none absolute bottom-2 right-2 z-10 rounded bg-white/80 px-2 py-1 text-xs text-gray-400 shadow">
      滚轮平移 | Ctrl+滚轮缩放
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Graph } from '@antv/g6'

defineOptions({
  name: 'FlowG6',
})

const containerRef = ref<HTMLElement>()
let graph: Graph | null = null

const nodeCount = ref(10)
const counts = [10, 50, 100, 500]

function buildGraph(count: number) {
  if (!graph) return
  const COLS = 5, GAP_X = 140, GAP_Y = 60
  const nodes: any[] = []
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: String(i + 1),
      style: { x: 20 + (i % COLS) * GAP_X, y: 20 + Math.floor(i / COLS) * GAP_Y },
      data: { label: `N${i + 1}` },
    })
  }
  const edges: any[] = []
  for (let i = 0; i < count - 1; i++) {
    edges.push({ source: String(i + 1), target: String(i + 2) })
    if (i % 7 === 0 && i + 5 < count) {
      edges.push({ source: String(i + 1), target: String(i + 6) })
    }
  }
  graph.setData({ nodes, edges })
  // @ts-ignore
  graph.render()
}

function setNodeCount(count: number) {
  nodeCount.value = count
  buildGraph(count)
}

onMounted(() => {
  if (!containerRef.value) return

  graph = new Graph({
    container: containerRef.value,
    width: containerRef.value.clientWidth,
    height: containerRef.value.clientHeight,
    node: {
      style: {
        fill: '#3b82f6',
        labelText: (d: any) => d.data?.label || d.id,
        labelFill: '#fff',
        labelFontSize: 13,
        size: [100, 36],
        radius: 6,
      },
    },
    edge: { style: { stroke: '#94a3b8', lineWidth: 2, endArrow: true } },
    behaviors: ['drag-element', 'click-select'],
    autoFit: 'view',
  })
  // @ts-ignore
  graph.render()

  buildGraph(10)

  const handleWheel = (e: WheelEvent) => {
    if (!graph) return
    e.preventDefault()
    if (e.ctrlKey) {
      // Ctrl+wheel = zoom
      const zoom = graph.getZoom()
      const newZoom = zoom * (1 - e.deltaY * 0.002)
      const clamped = Math.max(0.2, Math.min(5, newZoom))
      const rect = containerRef.value!.getBoundingClientRect()
      // Zoom towards mouse position (origin in viewport coordinates, Point = [x, y])
      graph.zoomTo(clamped, undefined, [e.clientX - rect.left, e.clientY - rect.top])
    } else {
      // Default wheel = pan
      graph.translateBy([-e.deltaX, -e.deltaY])
    }
  }
  containerRef.value!.addEventListener('wheel', handleWheel, { passive: false })

  const handleResize = () => {
    if (graph && containerRef.value) {
      // @ts-ignore
      graph.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
    }
  }
  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    containerRef.value?.removeEventListener('wheel', handleWheel)
    window.removeEventListener('resize', handleResize)
    graph?.destroy()
  })
})
</script>
