<template>
  <div ref="containerRef" class="relative h-full w-full bg-gray-100">
    <Stage
      :config="{
        width: stageSize.width,
        height: stageSize.height,
        draggable: true,
        scaleX: stageScale,
        scaleY: stageScale,
        x: stageX,
        y: stageY
      }"
      @wheel="handleWheel"
    >
      <Layer>
        <Line
          v-for="edge in edges"
          :key="edge.from + '-' + edge.to"
          :config="{
            points: getEdgePoints(edge),
            stroke: '#94a3b8',
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round'
          }"
        />
        <Group
          v-for="node in nodes"
          :key="node.id"
          :config="{ x: node.x, y: node.y, draggable: true }"
          @dragmove="handleDragMove(node.id, $event)"
          @click="selectedNodeId = node.id"
        >
          <!-- 简单节点 -->
          <template v-if="!node.type">
            <Rect
              :config="{
                width: node.width,
                height: node.height,
                fill: node.fill,
                stroke: '#1e40af',
                strokeWidth: selectedNodeId === node.id ? 3 : 1.5,
                cornerRadius: 6,
                shadowColor: selectedNodeId === node.id ? 'black' : undefined,
                shadowBlur: selectedNodeId === node.id ? 8 : 0
              }"
            />
            <Text
              :config="{
                text: node.label,
                fontSize: 13,
                fill: '#fff',
                width: node.width,
                height: node.height,
                align: 'center',
                verticalAlign: 'middle'
              }"
            />
          </template>

          <!-- InfoCard 节点 -->
          <template v-else-if="node.type === 'info'">
            <!-- 背景 -->
            <Rect
              :config="{
                width: 180,
                height: 80,
                cornerRadius: 8,
                fill: 'white',
                stroke: selectedNodeId === node.id ? '#3b82f6' : '#e5e7eb',
                strokeWidth: selectedNodeId === node.id ? 2 : 1
              }"
            />
            <!-- 状态圆点 -->
            <Circle
              :config="{
                x: 16,
                y: 24,
                radius: 6,
                fill: statusColor(node.status!).dot
              }"
            />
            <!-- 标题 -->
            <Text
              :config="{
                x: 28,
                y: 14,
                text: node.label,
                fontSize: 13,
                fontStyle: 'bold',
                fill: '#111827'
              }"
            />
            <!-- 副标题 -->
            <Text
              :config="{
                x: 28,
                y: 34,
                text: node.subtitle,
                fontSize: 11,
                fill: '#6b7280'
              }"
            />
            <!-- 徽章背景 -->
            <Rect
              :config="{
                x: 125,
                y: 14,
                width: 42,
                height: 18,
                cornerRadius: 9,
                fill: statusColor(node.status!).badgeBg
              }"
            />
            <!-- 徽章文字 -->
            <Text
              :config="{
                x: 125,
                y: 14,
                width: 42,
                height: 18,
                text: node.statusLabel,
                fontSize: 10,
                fontStyle: 'bold',
                fill: statusColor(node.status!).badgeText,
                align: 'center',
                verticalAlign: 'middle'
              }"
            />
          </template>

          <!-- FormNode 节点 -->
          <template v-else-if="node.type === 'form'">
            <!-- 背景 -->
            <Rect
              :config="{
                width: 200,
                height: 120,
                cornerRadius: 8,
                fill: 'white',
                stroke: selectedNodeId === node.id ? '#3b82f6' : '#e5e7eb',
                strokeWidth: selectedNodeId === node.id ? 2 : 1
              }"
            />
            <!-- 顶部分隔线 -->
            <Line
              :config="{
                points: [0, 32, 200, 32],
                stroke: '#f3f4f6',
                strokeWidth: 1
              }"
            />
            <!-- 图标 -->
            <Text
              :config="{
                x: 10,
                y: 8,
                text: '📋',
                fontSize: 14
              }"
            />
            <!-- 标题 -->
            <Text
              :config="{
                x: 30,
                y: 10,
                text: node.label,
                fontSize: 12,
                fontStyle: 'bold',
                fill: '#111827'
              }"
            />
            <!-- 输入框背景 -->
            <Rect
              :config="{
                x: 10,
                y: 42,
                width: 180,
                height: 22,
                cornerRadius: 4,
                fill: '#f9fafb',
                stroke: '#d1d5db',
                strokeWidth: 0.5
              }"
            />
            <!-- 输入框占位文字 -->
            <Text
              :config="{
                x: 14,
                y: 42,
                width: 172,
                height: 22,
                text: '输入内容',
                fontSize: 11,
                fill: '#9ca3af',
                verticalAlign: 'middle'
              }"
            />
            <!-- 下拉框背景 -->
            <Rect
              :config="{
                x: 10,
                y: 72,
                width: 100,
                height: 22,
                cornerRadius: 4,
                fill: '#f9fafb',
                stroke: '#d1d5db',
                strokeWidth: 0.5
              }"
            />
            <!-- 下拉框文字 -->
            <Text
              :config="{
                x: 14,
                y: 72,
                width: 92,
                height: 22,
                text: selectLabel(node.selectValue!),
                fontSize: 11,
                fill: '#374151',
                verticalAlign: 'middle'
              }"
            />
            <!-- 开关背景 -->
            <Rect
              :config="{
                x: 140,
                y: 73,
                width: 36,
                height: 20,
                cornerRadius: 10,
                fill: node.toggleValue ? '#3b82f6' : '#d1d5db'
              }"
            />
            <!-- 开关圆形滑块 -->
            <Circle
              :config="{
                x: node.toggleValue ? 166 : 150,
                y: 83,
                radius: 8,
                fill: 'white'
              }"
            />
          </template>
        </Group>
      </Layer>
    </Stage>

    <FlowToolbar
      :mode="mode"
      :node-count="nodeCount"
      @update:mode="onModeChange"
      @update:node-count="onCountChange"
    />

    <div
      class="pointer-events-none absolute bottom-2 right-2 z-10 rounded bg-white/80 px-2 py-1 text-xs text-gray-400 shadow"
    >
      滚轮平移 | Ctrl+滚轮缩放
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Stage, Layer, Rect, Text, Line, Group, Circle } from 'vue-konva'
import { useFlowData, SIMPLE_GAP_X, SIMPLE_GAP_Y } from './composables/useFlowData'
import type { FlowMode } from './composables/useFlowData'
import FlowToolbar from './FlowToolbar.vue'

defineOptions({
  name: 'FlowKonva'
})

interface FlowNode {
  id: string
  x: number
  y: number
  label: string
  width: number
  height: number
  fill: string
  type?: 'info' | 'form'
  subtitle?: string
  status?: 'success' | 'warning' | 'danger'
  statusLabel?: string
  inputValue?: string
  selectValue?: string
  toggleValue?: boolean
}

interface FlowEdge {
  from: string
  to: string
}

const {
  mode,
  nodeCount,
  infoData,
  formData,
  getSimpleNodes,
  getSimpleEdges,
  getInfoPosition,
  getFormPosition,
  getComplexEdges
} = useFlowData()

// --- Computed nodes ---

const simpleNodes = computed<FlowNode[]>(() => {
  const count = nodeCount.value
  const w = count > 10 ? 80 : 100
  const h = count > 10 ? 32 : 40
  return getSimpleNodes().map((n) => ({
    id: n.id,
    x: 20 + n.col * SIMPLE_GAP_X,
    y: 20 + n.row * SIMPLE_GAP_Y,
    label: n.label,
    width: w,
    height: h,
    fill: '#3b82f6'
  }))
})

const complexNodes = computed<FlowNode[]>(() => {
  const nodes: FlowNode[] = []

  infoData.forEach((info, i) => {
    const pos = getInfoPosition(i)
    nodes.push({
      id: info.id,
      x: pos.x,
      y: pos.y,
      label: info.title,
      subtitle: info.subtitle,
      width: 180,
      height: 80,
      fill: '#ffffff',
      type: 'info',
      status: info.status,
      statusLabel: info.statusLabel
    })
  })

  formData.forEach((form, i) => {
    const pos = getFormPosition(i)
    nodes.push({
      id: form.id,
      x: pos.x,
      y: pos.y,
      label: form.title,
      width: 200,
      height: 120,
      fill: '#ffffff',
      type: 'form',
      selectValue: form.selectValue,
      toggleValue: form.toggleValue
    })
  })

  return nodes
})

const nodes = computed<FlowNode[]>(() =>
  mode.value === 'simple' ? simpleNodes.value : complexNodes.value
)

// --- Computed edges ---

const edges = computed<FlowEdge[]>(() => {
  const rawEdges = mode.value === 'simple' ? getSimpleEdges() : getComplexEdges()
  return rawEdges.map((e) => ({ from: e.source, to: e.target }))
})

// --- Toolbar handlers ---

function onModeChange(m: FlowMode) {
  selectedNodeId.value = null
  mode.value = m
}

function onCountChange(count: number) {
  nodeCount.value = count
}

// --- Konva-specific state & helpers ---

const containerRef = ref<HTMLElement>()
const stageScale = ref(1)
const stageX = ref(0)
const stageY = ref(0)
const selectedNodeId = ref<string | null>(null)
const stageSize = ref({ width: 1200, height: 500 })

function statusColor(status: string) {
  const colors: Record<string, { dot: string; badgeBg: string; badgeText: string }> = {
    success: { dot: '#22c55e', badgeBg: '#dcfce7', badgeText: '#15803d' },
    warning: { dot: '#eab308', badgeBg: '#fef9c3', badgeText: '#a16207' },
    danger: { dot: '#ef4444', badgeBg: '#fee2e2', badgeText: '#b91c1c' }
  }
  return colors[status] || colors.success
}

function selectLabel(value: string) {
  const labels: Record<string, string> = {
    option1: '选项一',
    option2: '选项二',
    option3: '选项三'
  }
  return labels[value] || value
}

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
