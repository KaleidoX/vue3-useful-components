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
import { Graph, Shape } from '@antv/x6'

defineOptions({
  name: 'FlowAntvX6',
})

const containerRef = ref<HTMLElement>()
const nodeCount = ref(10)

let graph: Graph

function setNodeCount(count: number) {
  if (!graph) return
  nodeCount.value = count
  graph.clearCells()
  const COLS = 5,
    GAP_X = 180,
    GAP_Y = 80
  const rects: Shape.Rect[] = []
  for (let i = 0; i < count; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const node = graph.addNode({
      shape: 'rect',
      x: 40 + col * GAP_X,
      y: 40 + row * GAP_Y,
      width: 100,
      height: 36,
      label: `N${i + 1}`,
      attrs: {
        body: { fill: '#3b82f6', stroke: '#1e40af', rx: 6, ry: 6 },
        label: { fill: '#fff', fontSize: 12 },
      },
    })
    rects.push(node)
  }
  for (let i = 0; i < count - 1; i++) {
    graph.addEdge({
      source: { cell: rects[i].id },
      target: { cell: rects[i + 1].id },
      attrs: {
        line: {
          stroke: '#94a3b8',
          strokeWidth: 1.5,
          targetMarker: { name: 'block', width: 6, height: 4 },
        },
      },
    })
    if (i % 7 === 0 && i + 5 < count) {
      graph.addEdge({
        source: { cell: rects[i].id },
        target: { cell: rects[i + 5].id },
        attrs: { line: { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 2' } },
      })
    }
  }
  graph.centerContent()
}

onMounted(() => {
  if (!containerRef.value) return

  graph = new Graph({
    container: containerRef.value,
    width: containerRef.value.clientWidth,
    height: containerRef.value.clientHeight,
    grid: { size: 10, visible: true },
    panning: { enabled: true, eventTypes: ['leftMouseDown', 'mouseWheel'] },
    mousewheel: { enabled: true, modifiers: 'ctrl' },
    selecting: { enabled: true, rubberband: true, showNodeSelectionBox: true },
    background: { color: '#f5f5f5' },
  })

  setNodeCount(10)

  const handleResize = () => {
    graph.resize(containerRef.value!.clientWidth, containerRef.value!.clientHeight)
  }
  window.addEventListener('resize', handleResize)
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    graph.dispose()
  })
})
</script>
