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
import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js'

defineOptions({
  name: 'FlowPixi',
})

const containerRef = ref<HTMLElement>()
let app: Application
let mainContainer: Container
let dragTarget: Container | null = null
let dragOffset = { x: 0, y: 0 }

interface NodeData { id: string; label: string; fill: number; x: number; y: number; container?: Container }

const nodeData: NodeData[] = []

const nodeCount = ref(10)
const counts = [10, 50, 100, 500]

const edgeLines = new Map<string, { line: Graphics; fromId: string; toId: string }>()

function redrawEdge(fromId: string, toId: string) {
  const entry = edgeLines.get(`${fromId}-${toId}`)
  if (!entry) return
  const fromNode = nodeData.find((n) => n.id === fromId)
  const toNode = nodeData.find((n) => n.id === toId)
  if (!fromNode?.container || !toNode?.container) return
  const NODE_W = nodeCount.value > 50 ? 80 : 100
  const NODE_H = nodeCount.value > 50 ? 28 : 36
  entry.line.clear()
  entry.line.moveTo(fromNode.container.x + NODE_W / 2, fromNode.container.y + NODE_H)
  entry.line.lineTo(toNode.container.x + NODE_W / 2, toNode.container.y)
  entry.line.stroke({ width: 2, color: 0x94a3b8 })
}

function redrawConnectedEdges(container: Container) {
  const nd = nodeData.find((n) => n.container === container)
  if (!nd) return
  for (const [key] of edgeLines) {
    const [fid, tid] = key.split('-')
    if (fid === nd.id || tid === nd.id) {
      redrawEdge(fid, tid)
    }
  }
}

function buildGraph(count: number) {
  if (!mainContainer) return
  // Clear everything
  mainContainer.removeChildren()
  edgeLines.clear()
  nodeData.length = 0

  const COLS = 5, GAP_X = 140, GAP_Y = 55
  const w = count > 50 ? 80 : 100
  const h = count > 50 ? 28 : 36
  const fs = count > 50 ? 10 : 12

  // Build nodeData
  for (let i = 0; i < count; i++) {
    const nd: NodeData = {
      id: String(i + 1),
      label: `N${i + 1}`,
      fill: 0x3b82f6,
      x: 20 + (i % COLS) * GAP_X,
      y: 20 + Math.floor(i / COLS) * GAP_Y,
    }
    nodeData.push(nd)
  }

  // Build edges list
  const localEdges: { from: string; to: string }[] = []
  for (let i = 0; i < count - 1; i++) {
    localEdges.push({ from: String(i + 1), to: String(i + 2) })
    if (i % 7 === 0 && i + 5 < count) {
      localEdges.push({ from: String(i + 1), to: String(i + 6) })
    }
  }

  // Draw edges
  for (const edge of localEdges) {
    const from = nodeData.find((n) => n.id === edge.from)
    const to = nodeData.find((n) => n.id === edge.to)
    if (!from || !to) continue
    const line = new Graphics()
    line.moveTo(from.x + w / 2, from.y + h)
    line.lineTo(to.x + w / 2, to.y)
    line.stroke({ width: 2, color: 0x94a3b8 })
    mainContainer.addChild(line)
    edgeLines.set(`${edge.from}-${edge.to}`, { line, fromId: edge.from, toId: edge.to })
  }

  // Draw nodes
  for (const nd of nodeData) {
    const c = new Container()
    c.x = nd.x
    c.y = nd.y
    const bg = new Graphics()
    bg.roundRect(0, 0, w, h, 6)
    bg.fill({ color: nd.fill })
    c.addChild(bg)
    const txt = new Text({
      text: nd.label,
      style: new TextStyle({ fontSize: fs, fill: 0xffffff, fontFamily: 'sans-serif' }),
    })
    txt.anchor.set(0.5)
    txt.x = w / 2
    txt.y = h / 2
    c.addChild(txt)
    c.eventMode = 'static'
    c.cursor = 'pointer'
    c.on('pointerdown', (e: any) => {
      dragTarget = c
      dragOffset = { x: e.global.x - c.x, y: e.global.y - c.y }
      c.alpha = 0.8
    })
    mainContainer.addChild(c)
    nd.container = c
  }
}

function setNodeCount(count: number) {
  nodeCount.value = count
  buildGraph(count)
}

onMounted(async () => {
  if (!containerRef.value) return

  app = new Application()
  await app.init({
    background: '#f5f5f5',
    resizeTo: containerRef.value,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })
  containerRef.value.appendChild(app.canvas)

  mainContainer = new Container()
  app.stage.addChild(mainContainer)
  app.stage.eventMode = 'static'
  app.stage.hitArea = app.screen

  buildGraph(10)

  app.stage.on('pointermove', (e) => {
    if (dragTarget) {
      dragTarget.x = e.global.x - dragOffset.x
      dragTarget.y = e.global.y - dragOffset.y
      redrawConnectedEdges(dragTarget)
    }
  })
  app.stage.on('pointerup', () => { if (dragTarget) { dragTarget.alpha = 1; dragTarget = null } })
  app.stage.on('pointerupoutside', () => { if (dragTarget) { dragTarget.alpha = 1; dragTarget = null } })

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (e.ctrlKey) {
      const d = e.deltaY > 0 ? 0.95 : 1.05
      mainContainer.scale.x *= d
      mainContainer.scale.y *= d
    } else {
      mainContainer.x -= e.deltaX
      mainContainer.y -= e.deltaY
    }
  }
  containerRef.value.addEventListener('wheel', handleWheel, { passive: false })
  onUnmounted(() => {
    containerRef.value?.removeEventListener('wheel', handleWheel)
    app?.destroy(true)
  })
})
</script>
