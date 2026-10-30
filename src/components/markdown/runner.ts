/**
 * 串行 A/B 跑分引擎。
 *
 * 主线程只有一个，两个库同时挂载时无法把耗时归因到某一个，因此每轮只挂载一个库、
 * 交替顺序执行，最后按库聚合多轮中位数。
 *
 * 单轮流程：清空 → 挂载 → 逐片推流（每片等一次 paint）→ 切终态 → 等 DOM 稳定 → 卸载。
 *
 * 收敛信号刻意不用两库各自的事件：markstream 的 `render-final` 仅在虚拟化路径触发，
 * vue-stream-markdown 的 `end` 仅在 static 模式触发，两者语义不对等。
 * 统一改为「DOM 节点数与内容高度连续 N 帧不变」这个与实现无关的判据。
 */

import type { RendererKey, RunMetrics } from './metrics'
import {
  afterPaint,
  countDroppedFrames,
  countNodes,
  observeLayoutShift,
  observeLongTasks,
  readHeapMb,
  summarize
} from './metrics'

export interface RunnerHandles {
  /** 被测渲染器的容器，用于统计节点数与内容高度 */
  getContainer: () => HTMLElement | null | undefined
}

export interface BenchRunnerOptions {
  renderer: RendererKey
  /** 已切好的内容前缀切片，最后一片是完整文档 */
  chunks: string[]
  /** 每片推进的字符数，仅用于结果记录 */
  chunkSize: number
  /** 挂载被测组件（空内容）；返回容器句柄 */
  mount: () => Promise<RunnerHandles>
  /** 推入新的 content 前缀 */
  update: (content: string) => Promise<void>
  /** 切到终态（markstream 置 final、vsm 切 static） */
  applyFinal: () => Promise<void>
  /** 卸载被测组件 */
  unmount: () => Promise<void>
  /**
   * 每片渲染完成后自动把容器滚动到底部，模拟聊天窗口「跟随最新输出」的真实用法。
   * 开启后滚动动作计入该片耗时，并额外采样滚动跟随滞后。
   */
  autoScroll?: boolean
  onProgress?: (done: number, total: number) => void
  /** 每次采样到新指标时的回调，用于实时刷新界面 */
  onSample?: (metrics: Partial<RunMetrics>) => void
  /** 取消信号，检查点处抛错退出 */
  signal?: AbortSignal
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 180_000
/** 连续多少帧节点数/高度不变即认为渲染稳定 */
const STABLE_FRAMES = 4
/** 稳定检测的兜底上限，防止始终在变化的页面永久等待 */
const STABLE_MAX_MS = 15_000

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('已取消')
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} 超时（${ms}ms）`)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

interface StabilitySnapshot {
  nodes: number
  height: number
}

function readStability(container: HTMLElement | null | undefined): StabilitySnapshot {
  return {
    nodes: countNodes(container),
    height: container ? container.scrollHeight : 0
  }
}

/** 等待 DOM 结构连续若干帧不再变化，返回等待耗时 */
async function waitForStableDom(
  handles: RunnerHandles,
  stableFrames = STABLE_FRAMES,
  maxMs = STABLE_MAX_MS
): Promise<number> {
  const start = performance.now()
  let previous = readStability(handles.getContainer())
  let stableCount = 0

  while (performance.now() - start < maxMs) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    const current = readStability(handles.getContainer())
    if (current.nodes === previous.nodes && current.height === previous.height) {
      stableCount++
      if (stableCount >= stableFrames) return performance.now() - start
    } else {
      stableCount = 0
      previous = current
    }
  }
  return performance.now() - start
}

export async function runBenchmarkRound(options: BenchRunnerOptions): Promise<RunMetrics> {
  const {
    renderer,
    chunks,
    chunkSize,
    mount,
    update,
    applyFinal,
    unmount,
    autoScroll = false,
    onProgress,
    onSample,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = options

  const perUpdateSamples: number[] = []
  const frameGaps: number[] = []
  const scrollSamples: number[] = []
  const scrollLagSamples: number[] = []
  let peakNodes = 0
  let heapPeak: number | undefined

  const longTaskObserver = observeLongTasks()
  const shiftObserver = observeLayoutShift()

  let rafId: number | null = null
  let lastFrameTime = performance.now()

  // 帧间隔采样：连续 rAF 之间的间隔，反映推流期间主线程是否被长任务占满
  const sampleFrame = () => {
    const now = performance.now()
    // 页面切到后台时 rAF 会暂停，间隔会异常大，超过 1s 的样本丢弃
    const gap = now - lastFrameTime
    if (gap < 1000) frameGaps.push(gap)
    lastFrameTime = now
    rafId = requestAnimationFrame(sampleFrame)
  }

  const startFrameSampling = () => {
    lastFrameTime = performance.now()
    rafId = requestAnimationFrame(sampleFrame)
  }

  const stopFrameSampling = () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = null
  }

  const sampleNodes = (handles: RunnerHandles) => {
    const count = countNodes(handles.getContainer())
    if (count > peakNodes) peakNodes = count
    const heap = readHeapMb()
    if (heap !== undefined && (heapPeak === undefined || heap > heapPeak)) {
      heapPeak = heap
    }
  }

  /**
   * 滚到底，并计入读取布局触发的强制同步布局。
   *
   * 调用点紧跟 nextTick、布局尚未计算，此时读 scrollHeight 会对整篇文档触发一次强制
   * 同步布局——这正是真实聊天窗口「nextTick 后滚到底」的写法，成本真实存在，不做剔除。
   */
  const scrollToBottom = (handles: RunnerHandles) => {
    const container = handles.getContainer()
    if (!container) return
    const scrollStart = performance.now()
    // 右侧先求值：DOM 已 patch、布局脏，这次读取即强制回流
    container.scrollTop = container.scrollHeight
    scrollSamples.push(performance.now() - scrollStart)
  }

  /**
   * 滚动之后距离底部还有多远。
   *
   * 直接量用户看到的现象：滚到底之后，若渲染器在本次绘制里又补了内容，容器就被顶离底部。
   * 恒为 0 表示滚动始终追得上；持续为正表示内容在滚动之后仍在异步补齐（视口优先、
   * 延迟挂载、批处理都会这样），用户会看到「已经到底了又被顶下去」。
   */
  const readDistanceFromBottom = (handles: RunnerHandles): number => {
    const container = handles.getContainer()
    if (!container) return 0
    return Math.max(0, container.scrollHeight - container.clientHeight - container.scrollTop)
  }

  try {
    throwIfAborted(signal)

    // --- 挂载 ---
    const mountStart = performance.now()
    const handles = await withTimeout(mount(), timeoutMs, `${renderer} 挂载`)
    await afterPaint()
    startFrameSampling()

    // --- 逐片推流 ---
    let firstPaintMs = 0
    const streamStart = performance.now()

    for (let i = 0; i < chunks.length; i++) {
      throwIfAborted(signal)
      const updateStart = performance.now()
      await withTimeout(update(chunks[i]), timeoutMs, `${renderer} 第 ${i + 1} 片更新`)
      // 滚动紧跟 nextTick：此刻布局尚未计算，读 scrollHeight 会对整篇文档触发强制同步布局。
      // 这正是聊天窗口「nextTick 后滚到底」的真实写法，成本计入本片耗时，不做剔除。
      if (autoScroll) scrollToBottom(handles)
      await afterPaint()
      // 滚到底之后若渲染器在本帧里又补了内容，容器就被顶离底部；量下用户实际会看到的这段距离
      if (autoScroll) scrollLagSamples.push(readDistanceFromBottom(handles))
      perUpdateSamples.push(performance.now() - updateStart)
      if (i === 0) firstPaintMs = performance.now() - mountStart

      sampleNodes(handles)
      onProgress?.(i + 1, chunks.length)
      onSample?.({
        firstPaintMs,
        perUpdate: summarize(perUpdateSamples),
        peakNodes,
        scrollLagPx: scrollLagSamples.length > 0 ? summarize(scrollLagSamples) : undefined,
        scrollMs: scrollSamples.length > 0 ? summarize(scrollSamples) : undefined
      })
    }

    const streamTotalMs = performance.now() - streamStart

    // --- 终态收敛 ---
    throwIfAborted(signal)
    const settleStart = performance.now()
    await withTimeout(applyFinal(), timeoutMs, `${renderer} 切换终态`)
    await afterPaint()
    await waitForStableDom(handles)
    const settleMs = performance.now() - settleStart

    sampleNodes(handles)
    stopFrameSampling()

    const longTask = longTaskObserver?.stats()
    const layoutShift = shiftObserver?.total()

    return {
      renderer,
      chars: chunks[chunks.length - 1]?.length ?? 0,
      chunkSize,
      firstPaintMs,
      perUpdate: summarize(perUpdateSamples),
      streamTotalMs,
      settleMs,
      longTask,
      layoutShift,
      frameGapMs: frameGaps.length > 0 ? summarize(frameGaps) : undefined,
      droppedFrames: frameGaps.length > 0 ? countDroppedFrames(frameGaps) : undefined,
      peakNodes,
      heapPeakMb: heapPeak,
      chunkCount: chunks.length,
      autoScroll,
      scrollLagPx: scrollLagSamples.length > 0 ? summarize(scrollLagSamples) : undefined,
      scrollMs: scrollSamples.length > 0 ? summarize(scrollSamples) : undefined
    }
  } finally {
    stopFrameSampling()
    longTaskObserver?.stop()
    shiftObserver?.stop()
    await Promise.resolve(unmount()).catch(() => undefined)
    // 卸载后再等两帧，确保下一轮不会把上轮的清理开销算进去
    await afterPaint()
  }
}
