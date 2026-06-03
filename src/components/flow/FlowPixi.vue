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
import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js'
import FlowToolbar from './FlowToolbar.vue'
import { useFlowData, SIMPLE_GAP_X, SIMPLE_GAP_Y } from './composables/useFlowData'
import type { FlowMode, InfoNodeData, FormNodeData } from './composables/useFlowData'

defineOptions({
  name: 'FlowPixi'
})

const containerRef = ref<HTMLElement>()
let app: Application
let mainContainer: Container
let dragTarget: Container | null = null
let dragOffset = { x: 0, y: 0 }

const { mode, nodeCount, infoData, formData, getSimpleNodes, getSimpleEdges, getInfoPosition, getFormPosition, getComplexEdges } = useFlowData()

// ---- Container metadata for edge redrawing ----
interface ContainerEntry {
  container: Container
  width: number
  height: number
}

const containerMap = new Map<string, ContainerEntry>()

const edgeLines = new Map<string, { line: Graphics; fromId: string; toId: string }>()

// ---- Node dimensions ----
const INFO_W = 180
const INFO_H = 80
const FORM_W = 200
const FORM_H = 120
const SIMPLE_START_X = 20
const SIMPLE_START_Y = 20

function getSimpleNodeSize(): { w: number; h: number; fs: number } {
  const count = nodeCount.value
  if (count > 50) return { w: 80, h: 28, fs: 10 }
  return { w: 100, h: 36, fs: 12 }
}

// ---- Status color helpers ----
const STATUS_COLORS = {
  success: { circle: 0x22c55e, badgeBg: 0xdcfce7, badgeText: 0x15803d },
  warning: { circle: 0xeab308, badgeBg: 0xfef9c3, badgeText: 0xa16207 },
  danger: { circle: 0xef4444, badgeBg: 0xfee2e2, badgeText: 0xb91c1c }
} as const

const SELECT_OPTIONS: Record<string, string> = {
  option1: '选项一',
  option2: '选项二',
  option3: '选项三'
}

// ---- Pixi node builders ----

function buildInfoCard(info: InfoNodeData, x: number, y: number): Container {
  const c = new Container()
  c.x = x
  c.y = y
  const colors = STATUS_COLORS[info.status]

  // White rounded rect bg
  const bg = new Graphics()
  bg.roundRect(0, 0, INFO_W, INFO_H, 8)
  bg.fill({ color: 0xffffff })
  bg.stroke({ width: 1, color: 0xe5e7eb })
  c.addChild(bg)

  // Colored circle
  const circle = new Graphics()
  circle.circle(22, 40, 6)
  circle.fill({ color: colors.circle })
  c.addChild(circle)

  // Title
  const title = new Text({
    text: info.title,
    style: new TextStyle({
      fontSize: 14,
      fill: 0x1f2937,
      fontWeight: 'bold',
      fontFamily: 'sans-serif'
    })
  })
  title.x = 34
  title.y = 26
  c.addChild(title)

  // Subtitle
  const subtitle = new Text({
    text: info.subtitle,
    style: new TextStyle({ fontSize: 12, fill: 0x6b7280, fontFamily: 'sans-serif' })
  })
  subtitle.x = 34
  subtitle.y = 46
  c.addChild(subtitle)

  // Badge bg
  const badgeBg = new Graphics()
  badgeBg.roundRect(120, 26, 52, 20, 10)
  badgeBg.fill({ color: colors.badgeBg })
  c.addChild(badgeBg)

  // Badge text
  const badgeText = new Text({
    text: info.statusLabel,
    style: new TextStyle({ fontSize: 10, fill: colors.badgeText, fontFamily: 'sans-serif' })
  })
  badgeText.anchor.set(0.5)
  badgeText.x = 146
  badgeText.y = 36
  c.addChild(badgeText)

  c.eventMode = 'static'
  c.cursor = 'pointer'
  c.on('pointerdown', (e: any) => {
    dragTarget = c
    dragOffset = { x: e.global.x - c.x, y: e.global.y - c.y }
    c.alpha = 0.8
  })
  return c
}

function buildFormNode(form: FormNodeData, x: number, y: number): Container {
  const c = new Container()
  c.x = x
  c.y = y

  // White rounded rect bg
  const bg = new Graphics()
  bg.roundRect(0, 0, FORM_W, FORM_H, 8)
  bg.fill({ color: 0xffffff })
  bg.stroke({ width: 1, color: 0xe5e7eb })
  c.addChild(bg)

  // Header separator line
  const sep = new Graphics()
  sep.moveTo(0, 32)
  sep.lineTo(FORM_W, 32)
  sep.stroke({ width: 1, color: 0xf3f4f6 })
  c.addChild(sep)

  // Title
  const title = new Text({
    text: `📋 ${form.title}`,
    style: new TextStyle({
      fontSize: 12,
      fill: 0x1f2937,
      fontWeight: 'bold',
      fontFamily: 'sans-serif'
    })
  })
  title.x = 12
  title.y = 12
  c.addChild(title)

  // Input field bg
  const inputBg = new Graphics()
  inputBg.roundRect(12, 40, 176, 24, 4)
  inputBg.fill({ color: 0xffffff })
  inputBg.stroke({ width: 1, color: 0xd1d5db })
  c.addChild(inputBg)

  // Input text
  const inputText = new Text({
    text: form.inputValue,
    style: new TextStyle({ fontSize: 12, fill: 0x6b7280, fontFamily: 'sans-serif' })
  })
  inputText.x = 20
  inputText.y = 47
  c.addChild(inputText)

  // Select bg
  const selectBg = new Graphics()
  selectBg.roundRect(12, 72, 80, 22, 4)
  selectBg.fill({ color: 0xffffff })
  selectBg.stroke({ width: 1, color: 0xd1d5db })
  c.addChild(selectBg)

  // Select text
  const selectLabel = SELECT_OPTIONS[form.selectValue] || form.selectValue
  const selectText = new Text({
    text: selectLabel,
    style: new TextStyle({ fontSize: 11, fill: 0x374151, fontFamily: 'sans-serif' })
  })
  selectText.x = 20
  selectText.y = 77
  c.addChild(selectText)

  // Toggle bg
  const toggleBg = new Graphics()
  const toggleX = 160,
    toggleY = 72,
    toggleW = 36,
    toggleH = 20
  toggleBg.roundRect(toggleX, toggleY, toggleW, toggleH, toggleH / 2)
  toggleBg.fill({ color: form.toggleValue ? 0x3b82f6 : 0xd1d5db })
  c.addChild(toggleBg)

  // Toggle circle
  const toggleCircle = new Graphics()
  const circleRadius = 8
  const circleX = form.toggleValue
    ? toggleX + toggleW - 4 - circleRadius
    : toggleX + 4 + circleRadius
  const circleY = toggleY + toggleH / 2
  toggleCircle.circle(circleX, circleY, circleRadius)
  toggleCircle.fill({ color: 0xffffff })
  c.addChild(toggleCircle)

  c.eventMode = 'static'
  c.cursor = 'pointer'
  c.on('pointerdown', (e: any) => {
    dragTarget = c
    dragOffset = { x: e.global.x - c.x, y: e.global.y - c.y }
    c.alpha = 0.8
  })
  return c
}

// ---- Edge redrawing ----

function findNodeIdByContainer(container: Container): string | undefined {
  for (const [id, entry] of containerMap) {
    if (entry.container === container) return id
  }
  return undefined
}

function redrawEdge(fromId: string, toId: string) {
  const entry = edgeLines.get(`${fromId}-${toId}`)
  if (!entry) return
  const fromEntry = containerMap.get(fromId)
  const toEntry = containerMap.get(toId)
  if (!fromEntry || !toEntry) return
  entry.line.clear()
  entry.line.moveTo(
    fromEntry.container.x + fromEntry.width / 2,
    fromEntry.container.y + fromEntry.height
  )
  entry.line.lineTo(toEntry.container.x + toEntry.width / 2, toEntry.container.y)
  entry.line.stroke({ width: 2, color: 0x94a3b8 })
}

function redrawConnectedEdges(container: Container) {
  const nodeId = findNodeIdByContainer(container)
  if (!nodeId) return
  for (const [key] of edgeLines) {
    const [fid, tid] = key.split('-')
    if (fid === nodeId || tid === nodeId) {
      redrawEdge(fid, tid)
    }
  }
}

// ---- Graph build functions ----

function buildSimpleGraph() {
  if (!mainContainer) return
  mainContainer.removeChildren()
  edgeLines.clear()
  containerMap.clear()

  const { w, h, fs } = getSimpleNodeSize()
  const nodes = getSimpleNodes()
  const edges = getSimpleEdges()

  // Draw nodes
  for (const nd of nodes) {
    const x = SIMPLE_START_X + nd.col * SIMPLE_GAP_X
    const y = SIMPLE_START_Y + nd.row * SIMPLE_GAP_Y
    const fillColor = 0x3b82f6

    const c = new Container()
    c.x = x
    c.y = y
    const bg = new Graphics()
    bg.roundRect(0, 0, w, h, 6)
    bg.fill({ color: fillColor })
    c.addChild(bg)
    const txt = new Text({
      text: nd.label,
      style: new TextStyle({ fontSize: fs, fill: 0xffffff, fontFamily: 'sans-serif' })
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
    containerMap.set(nd.id, { container: c, width: w, height: h })
  }

  // Draw edges
  for (const edge of edges) {
    const fromEntry = containerMap.get(edge.source)
    const toEntry = containerMap.get(edge.target)
    if (!fromEntry || !toEntry) continue
    const line = new Graphics()
    line.moveTo(fromEntry.container.x + w / 2, fromEntry.container.y + h)
    line.lineTo(toEntry.container.x + w / 2, toEntry.container.y)
    line.stroke({ width: 2, color: 0x94a3b8 })
    mainContainer.addChild(line)
    edgeLines.set(`${edge.source}-${edge.target}`, {
      line,
      fromId: edge.source,
      toId: edge.target
    })
  }
}

function buildComplexGraph() {
  if (!mainContainer) return
  mainContainer.removeChildren()
  edgeLines.clear()
  containerMap.clear()

  // Build info card nodes
  for (let i = 0; i < infoData.length; i++) {
    const pos = getInfoPosition(i)
    const c = buildInfoCard(infoData[i], pos.x, pos.y)
    mainContainer.addChild(c)
    containerMap.set(infoData[i].id, { container: c, width: INFO_W, height: INFO_H })
  }

  // Build form nodes
  for (let i = 0; i < formData.length; i++) {
    const pos = getFormPosition(i)
    const c = buildFormNode(formData[i], pos.x, pos.y)
    mainContainer.addChild(c)
    containerMap.set(formData[i].id, { container: c, width: FORM_W, height: FORM_H })
  }

  // Draw edges
  const edges = getComplexEdges()
  for (const edge of edges) {
    const fromEntry = containerMap.get(edge.source)
    const toEntry = containerMap.get(edge.target)
    if (!fromEntry || !toEntry) continue
    const line = new Graphics()
    line.moveTo(
      fromEntry.container.x + fromEntry.width / 2,
      fromEntry.container.y + fromEntry.height
    )
    line.lineTo(toEntry.container.x + toEntry.width / 2, toEntry.container.y)
    line.stroke({ width: 2, color: 0x94a3b8 })
    mainContainer.addChild(line)
    edgeLines.set(`${edge.source}-${edge.target}`, {
      line,
      fromId: edge.source,
      toId: edge.target
    })
  }
}

// ---- Mode / count handlers ----

function onModeChange(newMode: FlowMode) {
  mode.value = newMode
  if (newMode === 'complex') {
    buildComplexGraph()
  } else {
    buildSimpleGraph()
  }
}

function onCountChange(count: number) {
  nodeCount.value = count
  buildSimpleGraph()
}

// ---- Pixi Application setup ----

onMounted(async () => {
  if (!containerRef.value) return

  app = new Application()
  await app.init({
    background: '#f5f5f5',
    resizeTo: containerRef.value,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
  })
  containerRef.value.appendChild(app.canvas)

  mainContainer = new Container()
  app.stage.addChild(mainContainer)
  app.stage.eventMode = 'static'
  app.stage.hitArea = app.screen

  buildSimpleGraph()

  app.stage.on('pointermove', (e) => {
    if (dragTarget) {
      dragTarget.x = e.global.x - dragOffset.x
      dragTarget.y = e.global.y - dragOffset.y
      redrawConnectedEdges(dragTarget)
    }
  })
  app.stage.on('pointerup', () => {
    if (dragTarget) {
      dragTarget.alpha = 1
      dragTarget = null
    }
  })
  app.stage.on('pointerupoutside', () => {
    if (dragTarget) {
      dragTarget.alpha = 1
      dragTarget = null
    }
  })

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
