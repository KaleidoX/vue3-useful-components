<template>
  <div class="relative h-full w-full">
    <canvas ref="canvasEl" />
    <FlowToolbar
      :mode="mode"
      :node-count="nodeCount"
      :counts="[10, 50, 100]"
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
import { Canvas, Rect, FabricText, Line, Point, Circle, FabricObject } from 'fabric'
import FlowToolbar from './FlowToolbar.vue'
import { useFlowData, SIMPLE_GAP_X, SIMPLE_GAP_Y } from './composables/useFlowData'

defineOptions({
  name: 'FlowFabric'
})

const canvasEl = ref<HTMLCanvasElement>()
let fabricCanvas: Canvas

interface LineRef {
  line: Line
  fromId: string
  toId: string
}

const nodeMap = new Map<string, { rect: Rect; text: FabricText }>()
const lineRefs: LineRef[] = []

// ---- Composables ----
const { mode, nodeCount, infoData, formData, getSimpleNodes, getSimpleEdges, getInfoPosition, getFormPosition } =
  useFlowData()

// ---- Complex node management ----
interface ChildObj {
  obj: FabricObject
  offsetX: number
  offsetY: number
}
interface ComplexGroup {
  bg: Rect
  children: ChildObj[]
}
const complexGroups: ComplexGroup[] = []

const STATUS_COLORS: Record<string, { dot: string; badge: string; badgeText: string }> = {
  success: { dot: '#22c55e', badge: '#dcfce7', badgeText: '#16a34a' },
  warning: { dot: '#eab308', badge: '#fef9c3', badgeText: '#ca8a04' },
  danger: { dot: '#ef4444', badge: '#fee2e2', badgeText: '#dc2626' }
}

function makeLine(from: { rect: Rect }, to: { rect: Rect }, w: number, h: number) {
  const fx = (from.rect.left ?? 0) + w / 2
  const fy = (from.rect.top ?? 0) + h
  const tx = (to.rect.left ?? 0) + w / 2
  const ty = to.rect.top ?? 0
  return new Line([fx, fy, tx, ty], {
    stroke: '#94a3b8',
    strokeWidth: 2,
    selectable: false,
    evented: false
  })
}

function refreshLine(ref: LineRef) {
  const f = nodeMap.get(ref.fromId)
  const t = nodeMap.get(ref.toId)
  if (!f || !t) return
  const w = nodeCount.value > 10 ? 100 : 120
  const h = nodeCount.value > 10 ? 30 : 44
  const fx = (f.rect.left ?? 0) + w / 2
  const fy = (f.rect.top ?? 0) + h
  const tx = (t.rect.left ?? 0) + w / 2
  const ty = t.rect.top ?? 0
  ref.line.set({ x1: fx, y1: fy, x2: tx, y2: ty })
  ref.line.setCoords()
}

function buildGraph() {
  if (!fabricCanvas) return
  fabricCanvas.clear()
  nodeMap.clear()
  lineRefs.length = 0
  complexGroups.length = 0

  const count = nodeCount.value
  const w = count > 10 ? 100 : 120
  const h = count > 10 ? 30 : 44
  const fs = count > 10 ? 11 : 13

  const simpleNodes = getSimpleNodes()

  // Build nodes
  for (const node of simpleNodes) {
    const x = 40 + node.col * SIMPLE_GAP_X
    const y = 40 + node.row * SIMPLE_GAP_Y

    const rect = new Rect({
      left: x,
      top: y,
      width: w,
      height: h,
      rx: 6,
      ry: 6,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 1.5,
      hasControls: true,
      lockUniScaling: true
    })
    const text = new FabricText(node.label, {
      left: x + 8,
      top: y + (h - fs - 3) / 2,
      fontSize: fs,
      fill: '#ffffff',
      fontFamily: 'sans-serif',
      selectable: false,
      evented: false
    })
    rect.on('moving', () => {
      text.set({
        left: (rect.left ?? 0) + 8,
        top: (rect.top ?? 0) + (h - fs - 3) / 2
      })
      text.setCoords()
    })
    fabricCanvas.add(rect)
    fabricCanvas.add(text)
    nodeMap.set(node.id, { rect, text })
  }

  // Build edges
  const simpleEdges = getSimpleEdges()
  for (const edge of simpleEdges) {
    const f = nodeMap.get(edge.source)
    const t = nodeMap.get(edge.target)
    if (!f || !t) continue
    const line = makeLine(f, t, w, h)
    fabricCanvas.add(line)
    fabricCanvas.sendObjectToBack(line)
    lineRefs.push({ line, fromId: edge.source, toId: edge.target })
  }

  fabricCanvas.requestRenderAll()
}

// ---- Complex node builders ----

function registerComplexGroup(bg: Rect, children: ChildObj[]) {
  const group: ComplexGroup = { bg, children }
  bg.on('moving', () => {
    const bx = bg.left ?? 0
    const by = bg.top ?? 0
    for (const ch of children) {
      ch.obj.set({ left: bx + ch.offsetX, top: by + ch.offsetY })
      ch.obj.setCoords()
    }
  })
  complexGroups.push(group)
}

function createInfoCard(
  x: number,
  y: number,
  title: string,
  subtitle: string,
  status: 'success' | 'warning' | 'danger',
  statusLabel: string
) {
  const W = 180,
    H = 80
  const sc = STATUS_COLORS[status]

  const bg = new Rect({
    left: x,
    top: y,
    width: W,
    height: H,
    rx: 8,
    ry: 8,
    fill: '#ffffff',
    stroke: '#e5e7eb',
    strokeWidth: 1,
    hasControls: true,
    lockUniScaling: true
  })

  const dot = new Circle({
    left: x + 16,
    top: y + (H - 12) / 2,
    radius: 6,
    fill: sc.dot,
    selectable: false,
    evented: false
  })

  const titleText = new FabricText(title, {
    left: x + 30,
    top: y + 12,
    fontSize: 13,
    fontWeight: 'bold',
    fill: '#111827',
    fontFamily: 'sans-serif',
    selectable: false,
    evented: false
  })

  const subText = new FabricText(subtitle, {
    left: x + 30,
    top: y + 34,
    fontSize: 11,
    fill: '#6b7280',
    fontFamily: 'sans-serif',
    selectable: false,
    evented: false
  })

  const badgeW = 36
  const badgeH = 18
  const badgeX = x + W - badgeW - 12
  const badgeY = y + 14
  const badgeBg = new Rect({
    left: badgeX,
    top: badgeY,
    width: badgeW,
    height: badgeH,
    rx: 9,
    ry: 9,
    fill: sc.badge,
    strokeWidth: 0,
    selectable: false,
    evented: false
  })

  const badgeText = new FabricText(statusLabel, {
    left: badgeX + badgeW / 2,
    top: badgeY + 1,
    fontSize: 10,
    fill: sc.badgeText,
    fontFamily: 'sans-serif',
    textAlign: 'center',
    originX: 'center',
    selectable: false,
    evented: false
  })

  const children: ChildObj[] = [
    { obj: dot, offsetX: 16, offsetY: (H - 12) / 2 },
    { obj: titleText, offsetX: 30, offsetY: 12 },
    { obj: subText, offsetX: 30, offsetY: 34 },
    { obj: badgeBg, offsetX: W - badgeW - 12, offsetY: 14 },
    { obj: badgeText, offsetX: W - badgeW / 2 - 12, offsetY: 15 }
  ]

  fabricCanvas.add(bg)
  fabricCanvas.add(dot)
  fabricCanvas.add(titleText)
  fabricCanvas.add(subText)
  fabricCanvas.add(badgeBg)
  fabricCanvas.add(badgeText)
  registerComplexGroup(bg, children)
}

function createFormNode(
  x: number,
  y: number,
  title: string,
  inputPlaceholder: string,
  selectText: string,
  toggleOn: boolean
) {
  const W = 200,
    H = 120

  const bg = new Rect({
    left: x,
    top: y,
    width: W,
    height: H,
    rx: 8,
    ry: 8,
    fill: '#ffffff',
    stroke: '#e5e7eb',
    strokeWidth: 1,
    hasControls: true,
    lockUniScaling: true
  })

  // Header separator line
  const sepLine = new Line([x + 0, y + 30, x + W, y + 30], {
    stroke: '#f3f4f6',
    strokeWidth: 1,
    selectable: false,
    evented: false
  })

  // Title icon + text
  const iconText = new FabricText('📋', {
    left: x + 10,
    top: y + 6,
    fontSize: 12,
    fontFamily: 'sans-serif',
    selectable: false,
    evented: false
  })

  const titleText = new FabricText(title, {
    left: x + 30,
    top: y + 7,
    fontSize: 12,
    fontWeight: 'bold',
    fill: '#111827',
    fontFamily: 'sans-serif',
    selectable: false,
    evented: false
  })

  // Input field background
  const inputBg = new Rect({
    left: x + 8,
    top: y + 38,
    width: W - 16,
    height: 24,
    rx: 3,
    ry: 3,
    fill: '#f9fafb',
    stroke: '#d1d5db',
    strokeWidth: 1,
    selectable: false,
    evented: false
  })

  const inputText = new FabricText(inputPlaceholder, {
    left: x + 12,
    top: y + 42,
    fontSize: 11,
    fill: '#9ca3af',
    fontFamily: 'sans-serif',
    selectable: false,
    evented: false
  })

  // Select field background
  const selectBg = new Rect({
    left: x + 8,
    top: y + 72,
    width: 100,
    height: 24,
    rx: 3,
    ry: 3,
    fill: '#f9fafb',
    stroke: '#d1d5db',
    strokeWidth: 1,
    selectable: false,
    evented: false
  })

  const selectTextObj = new FabricText(selectText + ' ▼', {
    left: x + 12,
    top: y + 75,
    fontSize: 11,
    fill: '#374151',
    fontFamily: 'sans-serif',
    selectable: false,
    evented: false
  })

  // Toggle background
  const toggleBg = new Rect({
    left: x + 140,
    top: y + 72,
    width: 36,
    height: 20,
    rx: 10,
    ry: 10,
    fill: toggleOn ? '#3b82f6' : '#d1d5db',
    strokeWidth: 0,
    selectable: false,
    evented: false
  })

  const toggleKnobX = toggleOn ? 18 : 2
  const toggleKnob = new Circle({
    left: x + 140 + toggleKnobX + 8,
    top: y + 72 + 10,
    radius: 8,
    fill: '#ffffff',
    selectable: false,
    evented: false
  })

  const children: ChildObj[] = [
    { obj: sepLine, offsetX: 0, offsetY: 30 },
    { obj: iconText, offsetX: 10, offsetY: 6 },
    { obj: titleText, offsetX: 30, offsetY: 7 },
    { obj: inputBg, offsetX: 8, offsetY: 38 },
    { obj: inputText, offsetX: 12, offsetY: 42 },
    { obj: selectBg, offsetX: 8, offsetY: 72 },
    { obj: selectTextObj, offsetX: 12, offsetY: 75 },
    { obj: toggleBg, offsetX: 140, offsetY: 72 },
    { obj: toggleKnob, offsetX: 140 + toggleKnobX + 8, offsetY: 82 }
  ]

  fabricCanvas.add(bg)
  fabricCanvas.add(sepLine)
  fabricCanvas.add(iconText)
  fabricCanvas.add(titleText)
  fabricCanvas.add(inputBg)
  fabricCanvas.add(inputText)
  fabricCanvas.add(selectBg)
  fabricCanvas.add(selectTextObj)
  fabricCanvas.add(toggleBg)
  fabricCanvas.add(toggleKnob)
  registerComplexGroup(bg, children)
}

function buildComplexGraph() {
  if (!fabricCanvas) return
  fabricCanvas.clear()
  nodeMap.clear()
  lineRefs.length = 0
  complexGroups.length = 0

  // InfoCard nodes from composable
  for (let i = 0; i < infoData.length; i++) {
    const data = infoData[i]
    const pos = getInfoPosition(i)
    createInfoCard(pos.x, pos.y, data.title, data.subtitle, data.status, data.statusLabel)
  }

  // FormNode nodes from composable
  for (let i = 0; i < formData.length; i++) {
    const data = formData[i]
    const pos = getFormPosition(i)
    createFormNode(pos.x, pos.y, data.title, data.inputValue, data.selectValue, data.toggleValue)
  }

  fabricCanvas.requestRenderAll()
}

// ---- Mode / count handlers ----

function onModeChange(m: 'simple' | 'complex') {
  mode.value = m
  if (m === 'simple') {
    buildGraph()
  } else {
    buildComplexGraph()
  }
}

function onCountChange(count: number) {
  nodeCount.value = count
  buildGraph()
}

onMounted(() => {
  if (!canvasEl.value) return
  const vw = canvasEl.value.parentElement!.clientWidth
  const vh = canvasEl.value.parentElement!.clientHeight

  fabricCanvas = new Canvas(canvasEl.value, {
    width: vw,
    height: vh,
    backgroundColor: '#f5f5f5',
    selection: false,
    renderOnAddRemove: false
  })

  buildGraph()

  // ---- Refresh edges when any rect moves ----
  fabricCanvas.on('object:moving', (e: any) => {
    if (!(e.target instanceof Rect)) return
    for (const ref of lineRefs) {
      if (ref.fromId !== undefined && ref.toId !== undefined) {
        refreshLine(ref)
      }
    }
  })

  fabricCanvas.requestRenderAll()

  // ---- Wheel: pan (default) / zoom (ctrl) ----
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (e.ctrlKey) {
      let z = fabricCanvas.getZoom()
      z *= e.deltaY > 0 ? 1 / 1.05 : 1.05
      z = Math.max(0.2, Math.min(5, z))
      fabricCanvas.zoomToPoint(new Point(e.offsetX, e.offsetY), z)
    } else {
      const vpt = fabricCanvas.viewportTransform
      if (vpt) {
        vpt[4] -= e.deltaX
        vpt[5] -= e.deltaY
        fabricCanvas.requestRenderAll()
      }
    }
  }
  canvasEl.value.parentElement!.addEventListener('wheel', handleWheel, { passive: false })

  onUnmounted(() => {
    canvasEl.value?.parentElement?.removeEventListener('wheel', handleWheel)
    fabricCanvas?.dispose()
  })
})
</script>
