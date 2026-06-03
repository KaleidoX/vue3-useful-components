<template>
  <div class="relative h-full w-full">
    <div ref="containerRef" class="h-full w-full" />
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
import { Graph, register, HTML } from '@antv/g6'
import FlowNodeInfo from './nodes/FlowNodeInfo.vue'
import FlowNodeForm from './nodes/FlowNodeForm.vue'
import FlowToolbar from './FlowToolbar.vue'
import { useFlowData, SIMPLE_GAP_X, SIMPLE_GAP_Y } from './composables/useFlowData'

defineOptions({
  name: 'FlowG6'
})

const containerRef = ref<HTMLElement>()
let graph: Graph | null = null

const { mode, nodeCount, infoData, formData, getSimpleNodes, getSimpleEdges, getInfoPosition, getFormPosition, getComplexEdges } = useFlowData()

/** Track mounted Vue apps for proper cleanup on mode switch or unmount */
const vueApps: Array<{ unmount: () => void }> = []

function cleanupVueApps() {
  vueApps.forEach((app) => app.unmount())
  vueApps.length = 0
}

function mountVueComponent(component: any, props: Record<string, any>): HTMLElement {
  const container = document.createElement('div')
  const app = createApp(component, props)
  app.mount(container)
  vueApps.push(app)
  return container
}

// ---- Simple node mode ----

function buildSimpleGraph() {
  if (!graph) return
  const composableNodes = getSimpleNodes()
  const composableEdges = getSimpleEdges()
  const nodes = composableNodes.map((n) => ({
    id: n.id,
    style: { x: 20 + n.col * SIMPLE_GAP_X, y: 20 + n.row * SIMPLE_GAP_Y },
    data: { label: n.label }
  }))
  const edges = composableEdges.map((e) => ({ source: e.source, target: e.target }))
  graph.setData({ nodes, edges })
  graph.render()
}

// ---- Complex node mode ----

function buildComplexGraph() {
  if (!graph) return
  cleanupVueApps()

  register('node', 'info-card', HTML)
  register('node', 'form-node', HTML)

  const nodes: any[] = []
  const edges: any[] = []

  // InfoCard nodes with DOM overlay
  infoData.forEach((item, i) => {
    const container = mountVueComponent(FlowNodeInfo, {
      title: item.title,
      subtitle: item.subtitle,
      status: item.status,
      statusLabel: item.statusLabel
    })
    const pos = getInfoPosition(i)
    nodes.push({
      id: item.id,
      type: 'info-card',
      style: {
        x: pos.x,
        y: pos.y,
        innerHTML: container,
        width: 200,
        height: 52
      },
      data: { label: item.title, nodeType: 'info-card' }
    })
  })

  // FormNode nodes with DOM overlay
  formData.forEach((item, i) => {
    const container = mountVueComponent(FlowNodeForm, {
      title: item.title,
      inputValue: item.inputValue,
      selectValue: item.selectValue,
      toggleValue: item.toggleValue
    })
    const pos = getFormPosition(i)
    nodes.push({
      id: item.id,
      type: 'form-node',
      style: {
        x: pos.x,
        y: pos.y,
        innerHTML: container,
        width: 200,
        height: 120
      },
      data: { label: item.title, nodeType: 'form-node' }
    })
  })

  // Edges from composable
  getComplexEdges().forEach((e) => {
    edges.push({ source: e.source, target: e.target })
  })

  graph.setData({ nodes, edges })
  graph.render()
}

// ---- Mode / count handlers ----

function onModeChange(newMode: 'simple' | 'complex') {
  mode.value = newMode
  if (newMode === 'complex') {
    buildComplexGraph()
  } else {
    cleanupVueApps()
    buildSimpleGraph()
  }
}

function onCountChange(count: number) {
  nodeCount.value = count
  buildSimpleGraph()
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
        radius: 6
      }
    },
    edge: { style: { stroke: '#94a3b8', lineWidth: 2, endArrow: true } },
    behaviors: ['drag-element', 'click-select'],
    autoFit: 'view'
  })
  graph.render()

  buildSimpleGraph()

  const handleWheel = (e: WheelEvent) => {
    if (!graph) return
    e.preventDefault()
    if (e.ctrlKey) {
      const zoom = graph.getZoom()
      const newZoom = zoom * (1 - e.deltaY * 0.002)
      const clamped = Math.max(0.2, Math.min(5, newZoom))
      const rect = containerRef.value!.getBoundingClientRect()
      graph.zoomTo(clamped, undefined, [e.clientX - rect.left, e.clientY - rect.top])
    } else {
      graph.translateBy([-e.deltaX, -e.deltaY])
    }
  }
  containerRef.value!.addEventListener('wheel', handleWheel, { passive: false })

  const handleResize = () => {
    if (graph && containerRef.value) {
      graph.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
    }
  }
  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    containerRef.value?.removeEventListener('wheel', handleWheel)
    window.removeEventListener('resize', handleResize)
    cleanupVueApps()
    graph?.destroy()
  })
})
</script>
