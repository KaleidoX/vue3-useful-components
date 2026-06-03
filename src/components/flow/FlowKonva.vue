<template>
  <div ref="containerRef" class="relative h-full w-full bg-gray-100">
    <Stage
      :config="{ width: stageSize.width, height: stageSize.height, draggable: true, scaleX: stageScale, scaleY: stageScale, x: stageX, y: stageY }"
      @wheel="handleWheel"
    >
      <Layer>
        <Line
          v-for="edge in edges"
          :key="edge.from + '-' + edge.to"
          :config="{ points: getEdgePoints(edge), stroke: '#94a3b8', strokeWidth: 2, lineCap: 'round', lineJoin: 'round' }"
        />
        <Group
          v-for="node in nodes"
          :key="node.id"
          :config="{ x: node.x, y: node.y, draggable: true }"
          @dragmove="handleDragMove(node.id, $event)"
          @click="selectedNodeId = node.id"
        >
          <Rect :config="{ width: node.width, height: node.height, fill: node.fill, stroke: '#1e40af', strokeWidth: selectedNodeId === node.id ? 3 : 1.5, cornerRadius: 6, shadowColor: selectedNodeId === node.id ? 'black' : undefined, shadowBlur: selectedNodeId === node.id ? 8 : 0 }" />
          <Text :config="{ text: node.label, fontSize: 13, fill: '#fff', width: node.width, height: node.height, align: 'center', verticalAlign: 'middle' }" />
        </Group>
      </Layer>
    </Stage>
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
import { Stage, Layer, Rect, Text, Line, Group } from 'vue-konva'

defineOptions({
  name: 'FlowKonva',
})

interface FlowNode { id: string; x: number; y: number; label: string; width: number; height: number; fill: string }
interface FlowEdge { from: string; to: string }

const containerRef = ref<HTMLElement>()
const nodes = ref<FlowNode[]>([])
const edges = ref<FlowEdge[]>([])

const nodeCount = ref(10)
const counts = [10, 50, 100]

function generateGraph(count: number) {
  const COLS = 5, GAP_X = 140, GAP_Y = 55
  const w = count > 10 ? 80 : 100
  const h = count > 10 ? 32 : 40
  const newNodes: FlowNode[] = []
  for (let i = 0; i < count; i++) {
    newNodes.push({
      id: String(i + 1),
      x: 20 + (i % COLS) * GAP_X,
      y: 20 + Math.floor(i / COLS) * GAP_Y,
      label: `N${i + 1}`,
      width: w, height: h,
      fill: '#3b82f6',
    })
  }
  const newEdges: FlowEdge[] = []
  for (let i = 0; i < count - 1; i++) {
    newEdges.push({ from: String(i + 1), to: String(i + 2) })
    if (i % 7 === 0 && i + 5 < count) {
      newEdges.push({ from: String(i + 1), to: String(i + 6) })
    }
  }
  nodes.value = newNodes
  edges.value = newEdges
}

function setNodeCount(count: number) {
  nodeCount.value = count
  generateGraph(count)
}

generateGraph(10)

const stageScale = ref(1)
const stageX = ref(0)
const stageY = ref(0)
const selectedNodeId = ref<string | null>(null)
const stageSize = ref({ width: 1200, height: 500 })

function handleDragMove(nodeId: string, e: any) {
  const node = nodes.value.find((n) => n.id === nodeId)
  if (node) {
    node.x = e.target.x()
    node.y = e.target.y()
  }
}

function getEdgePoints(edge: FlowEdge): number[] {
  const from = nodes.value.find((n) => n.id === edge.from)
  const to = nodes.value.find((n) => n.id === edge.to)
  if (!from || !to) return [0, 0, 0, 0]
  return [from.x + from.width / 2, from.y + from.height, to.x + to.width / 2, to.y]
}

function handleWheel(e: any) {
  e.evt.preventDefault()
  if (e.evt.ctrlKey) {
    const scaleBy = 1.05
    const oldScale = stageScale.value
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    stageScale.value = Math.max(0.2, Math.min(3, newScale))
  } else {
    stageX.value -= e.evt.deltaX
    stageY.value -= e.evt.deltaY
  }
}
</script>
