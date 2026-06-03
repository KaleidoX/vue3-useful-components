<template>
  <div class="relative h-full w-full">
    <canvas ref="canvasEl" />
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
import { Canvas, Rect, FabricText, Line, Point } from 'fabric'

defineOptions({
  name: 'FlowFabric',
})

const canvasEl = ref<HTMLCanvasElement>()
let fabricCanvas: Canvas

interface NodeCfg { id: string; label: string; fill: string; x: number; y: number }
interface LineRef { line: Line; fromId: string; toId: string }

const nodeMap = new Map<string, { rect: Rect; text: FabricText }>()
const lineRefs: LineRef[] = []

const nodeCount = ref(10)
const counts = [10, 50, 100]

function makeLine(from: { rect: Rect }, to: { rect: Rect }, w: number, h: number) {
  const fx = (from.rect.left ?? 0) + w / 2
  const fy = (from.rect.top ?? 0) + h
  const tx = (to.rect.left ?? 0) + w / 2
  const ty = to.rect.top ?? 0
  return new Line([fx, fy, tx, ty], {
    stroke: '#94a3b8', strokeWidth: 2, selectable: false, evented: false,
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

function buildGraph(count: number) {
  if (!fabricCanvas) return
  fabricCanvas.clear()
  nodeMap.clear()
  lineRefs.length = 0

  const COLS = 5, GAP_X = 160, GAP_Y = 65
  const w = count > 10 ? 100 : 120
  const h = count > 10 ? 30 : 44
  const fs = count > 10 ? 11 : 13

  // Build nodes
  const cfg: NodeCfg[] = []
  for (let i = 0; i < count; i++) {
    const x = 40 + (i % COLS) * GAP_X
    const y = 40 + Math.floor(i / COLS) * GAP_Y
    cfg.push({
      id: String(i + 1),
      label: `N${i + 1}`,
      fill: '#3b82f6',
      x, y,
    })
  }

  for (const c of cfg) {
    const rect = new Rect({
      left: c.x, top: c.y,
      width: w, height: h,
      rx: 6, ry: 6,
      fill: c.fill,
      stroke: '#1e40af', strokeWidth: 1.5,
      hasControls: true,
      lockUniScaling: true,
    })
    const text = new FabricText(c.label, {
      left: c.x + 8,
      top: c.y + (h - fs - 3) / 2,
      fontSize: fs,
      fill: '#ffffff',
      fontFamily: 'sans-serif',
      selectable: false,
      evented: false,
    })
    rect.on('moving', () => {
      text.set({
        left: (rect.left ?? 0) + 8,
        top: (rect.top ?? 0) + (h - fs - 3) / 2,
      })
      text.setCoords()
    })
    fabricCanvas.add(rect)
    fabricCanvas.add(text)
    nodeMap.set(c.id, { rect, text })
  }

  // Build edges
  const pairs: [string, string][] = []
  for (let i = 0; i < count - 1; i++) {
    pairs.push([String(i + 1), String(i + 2)])
    if (i % 7 === 0 && i + 5 < count) {
      pairs.push([String(i + 1), String(i + 6)])
    }
  }

  for (const [fid, tid] of pairs) {
    const f = nodeMap.get(fid)
    const t = nodeMap.get(tid)
    if (!f || !t) continue
    const line = makeLine(f, t, w, h)
    fabricCanvas.add(line)
    fabricCanvas.sendObjectToBack(line)
    lineRefs.push({ line, fromId: fid, toId: tid })
  }

  fabricCanvas.requestRenderAll()
}

function setNodeCount(count: number) {
  nodeCount.value = count
  buildGraph(count)
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
    renderOnAddRemove: false,
  })

  buildGraph(10)

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
