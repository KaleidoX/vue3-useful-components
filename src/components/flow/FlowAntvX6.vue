<template>
  <div class="relative h-full w-full">
    <FlowToolbar
      :mode="mode"
      :node-count="nodeCount"
      @update:mode="onModeChange"
      @update:node-count="onCountChange"
    />
    <div ref="containerRef" class="h-full w-full" />
    <div
      class="pointer-events-none absolute bottom-2 right-2 z-10 rounded bg-white/80 px-2 py-1 text-xs text-gray-400 shadow"
    >
      滚轮平移 | Ctrl+滚轮缩放
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Graph, Selection } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import FlowNodeInfo from './nodes/FlowNodeInfo.vue'
import FlowNodeForm from './nodes/FlowNodeForm.vue'
import { useFlowData, SIMPLE_GAP_X, SIMPLE_GAP_Y } from './composables/useFlowData'

defineOptions({
  name: 'FlowAntvX6'
})

const containerRef = ref<HTMLElement>()

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
  updateFormToggle,
} = useFlowData()

let graph: Graph

// --- Wrapper components for x6-vue-shape ---
const FlowNodeInfoWrapper = defineComponent({
  props: ['node'],
  setup(props) {
    return () => {
      const data = props.node?.getData?.() || {}
      return h(FlowNodeInfo, {
        title: data.title || '',
        subtitle: data.subtitle || '',
        status: data.status || 'success',
        statusLabel: data.statusLabel || ''
      })
    }
  }
})

const FlowNodeFormWrapper = defineComponent({
  props: ['node'],
  setup(props) {
    const nodeId = computed(() => props.node?.id || '')
    return () => {
      const id = nodeId.value
      if (!id) return null
      const data = formData.find((n) => n.id === id)
      if (!data) return null
      return h(FlowNodeForm, {
        title: data.title,
        inputValue: data.inputValue,
        selectValue: data.selectValue,
        toggleValue: data.toggleValue,
        'onUpdate:inputValue': (val: string) => {
          updateFormInput(id, val)
        },
        'onUpdate:selectValue': (val: string) => {
          updateFormSelect(id, val)
        },
        'onUpdate:toggleValue': (val: boolean) => {
          updateFormToggle(id, val)
        }
      })
    }
  }
})

// --- Register custom node shapes ---
register({
  shape: 'info-card',
  component: FlowNodeInfoWrapper,
  width: 260,
  height: 56,
  attrs: {
    body: {
      fill: 'none',
      stroke: 'none'
    },
    fo: {
      refWidth: '100%',
      refHeight: '100%'
    }
  }
})

register({
  shape: 'form-node',
  component: FlowNodeFormWrapper,
  width: 200,
  height: 110,
  attrs: {
    body: {
      fill: 'none',
      stroke: 'none'
    },
    fo: {
      refWidth: '100%',
      refHeight: '100%'
    }
  }
})

// --- Simple node rendering ---
function renderSimple() {
  if (!graph) return
  graph.clearCells()
  const nodes = getSimpleNodes()
  const edges = getSimpleEdges()

  for (const node of nodes) {
    graph.addNode({
      id: node.id,
      shape: 'rect',
      x: 40 + node.col * SIMPLE_GAP_X,
      y: 40 + node.row * SIMPLE_GAP_Y,
      width: 100,
      height: 36,
      label: node.label,
      attrs: {
        body: { fill: '#3b82f6', stroke: '#1e40af', rx: 6, ry: 6 },
        label: { fill: '#fff', fontSize: 12 }
      }
    })
  }
  for (const edge of edges) {
    graph.addEdge({
      source: edge.source,
      target: edge.target,
      attrs: {
        line: {
          stroke: '#94a3b8',
          strokeWidth: 1.5,
          targetMarker: { name: 'block', width: 6, height: 4 }
        }
      }
    })
  }
  graph.centerContent()
}

// --- Complex node rendering ---
function renderComplex() {
  if (!graph) return
  graph.clearCells()

  // InfoCard nodes
  for (let i = 0; i < infoData.length; i++) {
    const pos = getInfoPosition(i)
    graph.addNode({
      id: infoData[i].id,
      shape: 'info-card',
      x: pos.x,
      y: pos.y,
      data: infoData[i]
    })
  }

  // FormNode nodes
  for (let i = 0; i < formData.length; i++) {
    const pos = getFormPosition(i)
    graph.addNode({
      id: formData[i].id,
      shape: 'form-node',
      x: pos.x,
      y: pos.y,
      data: formData[i]
    })
  }

  // Edges
  const edges = getComplexEdges()
  for (const edge of edges) {
    graph.addEdge({
      source: edge.source,
      target: edge.target,
      attrs: {
        line: {
          stroke: '#94a3b8',
          strokeWidth: 1.5,
          targetMarker: { name: 'block', width: 6, height: 4 }
        }
      }
    })
  }

  graph.centerContent()
}

// --- Toolbar event handlers ---
function onModeChange(newMode: 'simple' | 'complex') {
  if (newMode === mode.value || !graph) return
  mode.value = newMode
  if (newMode === 'simple') {
    renderSimple()
  } else {
    renderComplex()
  }
}

function onCountChange(count: number) {
  nodeCount.value = count
  if (graph && mode.value === 'simple') {
    renderSimple()
  }
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
    background: { color: '#f5f5f5' }
  })

  graph.use(
    new Selection({
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true
    })
  )

  renderSimple()

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
