<template>
  <div class="relative h-full w-full">
    <FlowToolbar
      :mode="mode"
      :node-count="nodeCount"
      @update:mode="onModeChange"
      @update:node-count="onCountChange"
    />
    <div ref="containerRef" class="h-full w-full" />
    <div class="pointer-events-none absolute bottom-2 right-2 z-10 rounded bg-white/80 px-2 py-1 text-xs text-gray-400 shadow">
      滚轮平移 | Ctrl+滚轮缩放
    </div>
  </div>
</template>

<script lang="ts" setup>
import LogicFlow, { HtmlNodeModel, HtmlNode } from '@logicflow/core'
import '@logicflow/core/dist/index.css'
import { createApp, h } from 'vue'
import FlowNodeInfo from './nodes/FlowNodeInfo.vue'
import FlowNodeForm from './nodes/FlowNodeForm.vue'
import FlowToolbar from './FlowToolbar.vue'
import { useFlowData, SIMPLE_GAP_X, SIMPLE_GAP_Y } from './composables/useFlowData'
import type { FlowMode } from './composables/useFlowData'

defineOptions({
  name: 'FlowLogicFlow',
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

let lf: LogicFlow

// ========== HTML 节点模型 ==========

class InfoCardModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 220
    this.height = 64
  }
}

class InfoCardView extends HtmlNode {
  setHtml(rootEl: SVGForeignObjectElement) {
    const props = this.props.model.properties || {}
    rootEl.innerHTML = ''
    const el = document.createElement('div')
    el.style.width = '220px'
    rootEl.appendChild(el)
    const app = createApp({
      render() {
        return h(FlowNodeInfo, {
          title: (props.title as string) || '信息节点',
          subtitle: (props.subtitle as string) || '',
          status: (props.status as 'success' | 'warning' | 'danger') || 'success',
          statusLabel: (props.statusLabel as string) || '',
        })
      },
    })
    app.mount(el)
  }
}

class FormNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 210
    this.height = 130
  }
}

class FormNodeView extends HtmlNode {
  vueApp: any = null

  setHtml(rootEl: SVGForeignObjectElement) {
    if (this.vueApp) return
    const nodeId = (this.props.model as any).id
    const nodeData = formData.find((n) => n.id === nodeId)

    rootEl.innerHTML = ''
    const el = document.createElement('div')
    el.style.width = '210px'
    rootEl.appendChild(el)

    this.vueApp = createApp({
      render: () => {
        if (!nodeData) return null
        return h(FlowNodeForm, {
          title: nodeData.title,
          inputValue: nodeData.inputValue,
          selectValue: nodeData.selectValue,
          toggleValue: nodeData.toggleValue,
          'onUpdate:inputValue': (v: string) => {
            updateFormInput(nodeId, v)
          },
          'onUpdate:selectValue': (v: string) => {
            updateFormSelect(nodeId, v)
          },
          'onUpdate:toggleValue': (v: boolean) => {
            updateFormToggle(nodeId, v)
          },
        })
      },
    })
    this.vueApp.mount(el)
  }

  componentWillUnmount() {
    if (this.vueApp) {
      this.vueApp.unmount()
      this.vueApp = null
    }
  }
}

// ========== 图渲染 ==========

function renderSimpleGraph() {
  if (!lf) return
  const simpleNodes = getSimpleNodes()
  const simpleEdges = getSimpleEdges()

  const nodes = simpleNodes.map((n) => ({
    id: n.id,
    type: (parseInt(n.id) - 1) % 10 === 6 ? 'diamond' : 'rect',
    x: 40 + n.col * SIMPLE_GAP_X,
    y: 40 + n.row * SIMPLE_GAP_Y,
    text: n.label,
  }))

  const edges = simpleEdges.map((e) => ({
    id: e.id,
    type: 'polyline',
    sourceNodeId: e.source,
    targetNodeId: e.target,
  }))

  lf.render({ nodes, edges })
  lf.translateCenter()
}

function renderComplexGraph() {
  if (!lf) return

  const nodes: any[] = []

  infoData.forEach((info, index) => {
    const pos = getInfoPosition(index)
    nodes.push({
      id: info.id,
      type: 'info-card',
      x: pos.x,
      y: pos.y,
      properties: {
        title: info.title,
        subtitle: info.subtitle,
        status: info.status,
        statusLabel: info.statusLabel,
      },
    })
  })

  formData.forEach((form, index) => {
    const pos = getFormPosition(index)
    nodes.push({
      id: form.id,
      type: 'form-node',
      x: pos.x,
      y: pos.y,
      properties: {
        title: form.title,
      },
    })
  })

  const edges = getComplexEdges().map((e) => ({
    id: e.id,
    type: 'polyline',
    sourceNodeId: e.source,
    targetNodeId: e.target,
  }))

  lf.render({ nodes, edges })
  lf.translateCenter()
}

function onModeChange(newMode: FlowMode) {
  if (newMode === mode.value) return
  mode.value = newMode
  if (newMode === 'complex') {
    renderComplexGraph()
  } else {
    renderSimpleGraph()
  }
}

function onCountChange(count: number) {
  nodeCount.value = count
  renderSimpleGraph()
}

function registerComplexNodes() {
  if (!lf) return
  lf.register({
    type: 'info-card',
    view: InfoCardView as any,
    model: InfoCardModel as any,
  })
  lf.register({
    type: 'form-node',
    view: FormNodeView as any,
    model: FormNodeModel as any,
  })
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

  // 预注册复杂节点类型
  registerComplexNodes()

  renderSimpleGraph()

  onUnmounted(() => {
    lf.destroy()
  })
})
</script>
