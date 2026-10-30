/**
 * 流式渲染基准的指标采集与统计工具。
 *
 * 设计约束：
 * - 统计函数保持纯函数，可在 jsdom 下直接单测，不依赖浏览器时序 API。
 * - 采样器的浏览器依赖（PerformanceObserver / performance.memory）全部做能力探测，
 *   缺失时降级为 undefined 而不是抛错——Safari 与 Firefox 没有 memory，jsdom 没有 longtask。
 */

export type RendererKey = 'markstream-vue' | 'vue-stream-markdown'

export interface Percentiles {
  p50: number
  p95: number
  max: number
  mean: number
  count: number
}

export interface LongTaskStats {
  count: number
  totalMs: number
  maxMs: number
}

export interface RunMetrics {
  renderer: RendererKey
  /** 语料字符数 */
  chars: number
  /** 每帧推入的字符数 */
  chunkSize: number
  /** 首切片推入到首次 DOM 提交的时间 */
  firstPaintMs: number
  /** 每次切片后的更新耗时分布 */
  perUpdate: Percentiles
  /** 全部切片推完的总耗时（含等待） */
  streamTotalMs: number
  /** 推流结束到终态收敛（render-final / end 事件）的时间 */
  settleMs: number
  /** 长任务统计，不支持时 undefined */
  longTask?: LongTaskStats
  /** 累计布局偏移，不支持时 undefined */
  layoutShift?: number
  /** 渲染期间的 rAF 帧间隔统计 */
  frameGapMs?: Percentiles
  /** 掉帧数（帧间隔 > 1.5 倍 16.7ms 且 < 1s 的帧数） */
  droppedFrames?: number
  /** pane 内 DOM 节点峰值 */
  peakNodes: number
  /** 推流峰值堆占用（MB），仅 Chromium 可用 */
  heapPeakMb?: number
  /** 切片总数 */
  chunkCount: number
  /** 是否启用了自动滚动到底部 */
  autoScroll?: boolean
  /**
   * 自动滚动模式下，滚动完成后距容器底部的像素距离。
   * 恒为 0 表示滚动始终追得上渲染；持续为正表示内容在滚动之后仍在异步补齐，
   * 即真实聊天窗口里「滚到底又被顶下去」的跟随滞后。
   */
  scrollLagPx?: Percentiles
  /** 自动滚动模式下滚动动作本身耗时（含读取布局触发的强制回流） */
  scrollMs?: Percentiles
}

export interface BenchmarkReport {
  generatedAt: string
  userAgent: string
  documentChars: number
  documentBytes: number
  rounds: number
  chunkSize: number
  autoScroll: boolean
  runs: RunMetrics[]
}

/** 计算分位数与均值；空数组返回全 0，避免调用侧写分支 */
export function summarize(samples: number[]): Percentiles {
  if (samples.length === 0) {
    return { p50: 0, p95: 0, max: 0, mean: 0, count: 0 }
  }
  const sorted = [...samples].sort((a, b) => a - b)
  const sum = sorted.reduce((acc, value) => acc + value, 0)
  return {
    p50: quantile(sorted, 0.5),
    p95: quantile(sorted, 0.95),
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    count: sorted.length
  }
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 1) return sorted[0]
  const position = (sorted.length - 1) * q
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)
}

/** 帧间隔超过该阈值即记为掉帧；16.7ms 是 60Hz 的理论帧长 */
export const DROPPED_FRAME_THRESHOLD_MS = 16.7 * 1.5

export function countDroppedFrames(gaps: number[]): number {
  return gaps.filter((gap) => gap > DROPPED_FRAME_THRESHOLD_MS && gap < 1000).length
}

/** 轮次聚合：同 renderer 的同名指标取中位数，抵抗偶发 GC 抖动 */
export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * 把多轮 RunMetrics 压成中位数摘要，供结果表展示。
 * 可选字段在部分轮次缺失时按「有值的轮次」取中位数，全缺则为 undefined。
 */
export function aggregateRuns(runs: RunMetrics[]): RunMetrics[] {
  const byRenderer = new Map<RendererKey, RunMetrics[]>()
  for (const run of runs) {
    const list = byRenderer.get(run.renderer) ?? []
    list.push(run)
    byRenderer.set(run.renderer, list)
  }

  const pickMedian = (list: number[] | undefined): number | undefined =>
    list && list.length > 0 ? median(list) : undefined

  return [...byRenderer.entries()].map(([renderer, group]) => {
    const first = group[0]
    return {
      renderer,
      chars: first.chars,
      chunkSize: first.chunkSize,
      chunkCount: first.chunkCount,
      firstPaintMs: median(group.map((run) => run.firstPaintMs)),
      perUpdate: {
        p50: median(group.map((run) => run.perUpdate.p50)),
        p95: median(group.map((run) => run.perUpdate.p95)),
        max: median(group.map((run) => run.perUpdate.max)),
        mean: median(group.map((run) => run.perUpdate.mean)),
        count: first.perUpdate.count
      },
      streamTotalMs: median(group.map((run) => run.streamTotalMs)),
      settleMs: median(group.map((run) => run.settleMs)),
      longTask: aggregateLongTasks(group),
      layoutShift: pickMedian(group.map((run) => run.layoutShift).filter(isNumber)),
      frameGapMs: aggregatePercentiles(group.map((run) => run.frameGapMs).filter(isPercentiles)),
      droppedFrames: pickMedian(
        group.map((run) => run.droppedFrames).filter(isNumber)
      ),
      peakNodes: median(group.map((run) => run.peakNodes)),
      heapPeakMb: pickMedian(group.map((run) => run.heapPeakMb).filter(isNumber)),
      autoScroll: first.autoScroll,
      scrollLagPx: aggregatePercentiles(
        group.map((run) => run.scrollLagPx).filter(isPercentiles)
      ),
      scrollMs: aggregatePercentiles(group.map((run) => run.scrollMs).filter(isPercentiles))
    }
  })
}

function aggregateLongTasks(group: RunMetrics[]): LongTaskStats | undefined {
  const present = group.map((run) => run.longTask).filter(isLongTask)
  if (present.length === 0) return undefined
  return {
    count: median(present.map((task) => task.count)),
    totalMs: median(present.map((task) => task.totalMs)),
    maxMs: median(present.map((task) => task.maxMs))
  }
}

function aggregatePercentiles(list: Percentiles[]): Percentiles | undefined {
  if (list.length === 0) return undefined
  return {
    p50: median(list.map((item) => item.p50)),
    p95: median(list.map((item) => item.p95)),
    max: median(list.map((item) => item.max)),
    mean: median(list.map((item) => item.mean)),
    count: median(list.map((item) => item.count))
  }
}

function isNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isLongTask(value: LongTaskStats | undefined): value is LongTaskStats {
  return value !== undefined
}

function isPercentiles(value: Percentiles | undefined): value is Percentiles {
  return value !== undefined
}

/** 长任务观察器：浏览器不支持时返回 null，调用侧据此跳过采集 */
export function observeLongTasks(): {
  stats: () => LongTaskStats
  stop: () => void
} | null {
  if (typeof PerformanceObserver === 'undefined') return null
  const supported = PerformanceObserver.supportedEntryTypes ?? []
  if (!supported.includes('longtask')) return null

  let count = 0
  let totalMs = 0
  let maxMs = 0

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      count++
      totalMs += entry.duration
      maxMs = Math.max(maxMs, entry.duration)
    }
  })

  try {
    observer.observe({ entryTypes: ['longtask'] })
  } catch {
    return null
  }

  return {
    stats: () => ({ count, totalMs, maxMs }),
    stop: () => observer.disconnect()
  }
}

/** 布局偏移观察器，返回读取函数与停止函数；不支持时返回 null */
export function observeLayoutShift(): {
  total: () => number
  stop: () => void
} | null {
  if (typeof PerformanceObserver === 'undefined') return null
  const supported = PerformanceObserver.supportedEntryTypes ?? []
  if (!supported.includes('layout-shift')) return null

  let total = 0
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean }
      if (shift.hadRecentInput) continue
      total += shift.value ?? 0
    }
  })

  try {
    observer.observe({ entryTypes: ['layout-shift'] })
  } catch {
    return null
  }

  return {
    total: () => total,
    stop: () => observer.disconnect()
  }
}

interface MemoryInfo {
  usedJSHeapSize: number
}

/** 读取当前堆占用（MB）；非 Chromium 返回 undefined */
export function readHeapMb(): number | undefined {
  const memory = (performance as Performance & { memory?: MemoryInfo }).memory
  if (!memory || typeof memory.usedJSHeapSize !== 'number') return undefined
  return memory.usedJSHeapSize / (1024 * 1024)
}

/** 等待下一帧的 DOM 提交完成：nextTick 之后仍需两帧才能确保layout 与 paint 落地 */
export function afterPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/** 统计某个根节点下的元素总数（含自身） */
export function countNodes(root: Element | null | undefined): number {
  if (!root) return 0
  return 1 + root.querySelectorAll('*').length
}

export function formatMs(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '—'
  return value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${value.toFixed(1)} ms`
}

/**
 * 亚毫秒级耗时用两位小数。
 * performance.now 在非跨源隔离页面里分辨率为 0.1ms，单次强制布局常落在这一量级，
 * 用 toFixed(1) 会把它统一压成 0.0，看起来像没测到。
 */
export function formatMsPrecise(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '—'
  if (value >= 1000) return `${(value / 1000).toFixed(2)} s`
  return value >= 1 ? `${value.toFixed(1)} ms` : `${value.toFixed(2)} ms`
}

export function formatNumber(value: number | undefined, digits = 1): string {
  if (value === undefined || !Number.isFinite(value)) return '—'
  return value.toFixed(digits)
}
