import { describe, expect, it } from 'vitest'

import {
  aggregateRuns,
  countDroppedFrames,
  median,
  summarize
} from '@/components/markdown/metrics'
import type { RunMetrics } from '@/components/markdown/metrics'

describe('summarize', () => {
  it('returns zeros for an empty sample set instead of NaN', () => {
    expect(summarize([])).toEqual({ p50: 0, p95: 0, max: 0, mean: 0, count: 0 })
  })

  it('computes percentiles with linear interpolation', () => {
    // 1..10 的 p50 落在 5.5，p95 落在 9.55
    const result = summarize([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    expect(result.count).toBe(10)
    expect(result.p50).toBeCloseTo(5.5, 6)
    expect(result.p95).toBeCloseTo(9.55, 6)
    expect(result.max).toBe(10)
    expect(result.mean).toBeCloseTo(5.5, 6)
  })

  it('handles a single sample without dividing by zero', () => {
    expect(summarize([42])).toEqual({ p50: 42, p95: 42, max: 42, mean: 42, count: 1 })
  })

  it('does not mutate the input array', () => {
    const input = [3, 1, 2]
    summarize(input)

    expect(input).toEqual([3, 1, 2])
  })
})

describe('median', () => {
  it('returns the middle value for odd lengths', () => {
    expect(median([5, 1, 3])).toBe(3)
  })

  it('averages the two middle values for even lengths', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })

  it('returns 0 for an empty list', () => {
    expect(median([])).toBe(0)
  })
})

describe('countDroppedFrames', () => {
  it('counts frames slower than the threshold', () => {
    // 16.7 的 1.5 倍约为 25.05ms
    expect(countDroppedFrames([16, 20, 30, 40])).toBe(2)
  })

  it('ignores gaps at or beyond 1s, which come from backgrounded tabs', () => {
    expect(countDroppedFrames([16, 5000])).toBe(0)
  })
})

function makeRun(overrides: Partial<RunMetrics> = {}): RunMetrics {
  return {
    renderer: 'markstream-vue',
    chars: 1000,
    chunkSize: 200,
    firstPaintMs: 10,
    perUpdate: { p50: 10, p95: 20, max: 30, mean: 15, count: 5 },
    streamTotalMs: 100,
    settleMs: 5,
    peakNodes: 500,
    chunkCount: 5,
    ...overrides
  }
}

describe('aggregateRuns', () => {
  it('groups runs by renderer and takes the median of each metric', () => {
    const runs: RunMetrics[] = [
      makeRun({ renderer: 'markstream-vue', firstPaintMs: 10 }),
      makeRun({ renderer: 'markstream-vue', firstPaintMs: 30 }),
      makeRun({ renderer: 'markstream-vue', firstPaintMs: 20 }),
      makeRun({ renderer: 'vue-stream-markdown', firstPaintMs: 100 })
    ]

    const summary = aggregateRuns(runs)
    const markstream = summary.find((item) => item.renderer === 'markstream-vue')
    const vsm = summary.find((item) => item.renderer === 'vue-stream-markdown')

    expect(summary).toHaveLength(2)
    expect(markstream?.firstPaintMs).toBe(20)
    expect(vsm?.firstPaintMs).toBe(100)
  })

  it('keeps optional metrics undefined when no round reported them', () => {
    const summary = aggregateRuns([makeRun()])

    expect(summary[0].longTask).toBeUndefined()
    expect(summary[0].heapPeakMb).toBeUndefined()
    expect(summary[0].layoutShift).toBeUndefined()
  })

  it('medians optional metrics across only the rounds that reported them', () => {
    const runs: RunMetrics[] = [
      makeRun({ heapPeakMb: undefined }),
      makeRun({ heapPeakMb: 40 }),
      makeRun({ heapPeakMb: 60 })
    ]

    const summary = aggregateRuns(runs)

    expect(summary[0].heapPeakMb).toBe(50)
  })

  it('carries the autoScroll flag and aggregates scroll metrics', () => {
    const scroll = (p50: number) => ({ p50, p95: p50 * 2, max: p50 * 3, mean: p50, count: 10 })
    const runs: RunMetrics[] = [
      makeRun({ autoScroll: true, scrollLagPx: scroll(10), scrollMs: scroll(1) }),
      makeRun({ autoScroll: true, scrollLagPx: scroll(30), scrollMs: scroll(3) }),
      makeRun({ autoScroll: true, scrollLagPx: scroll(20), scrollMs: scroll(2) })
    ]

    const summary = aggregateRuns(runs)

    expect(summary[0].autoScroll).toBe(true)
    expect(summary[0].scrollLagPx?.p50).toBe(20)
    expect(summary[0].scrollMs?.p50).toBe(2)
  })

  it('carries the codeHighlight flag through aggregation', () => {
    const summary = aggregateRuns([
      makeRun({ codeHighlight: true }),
      makeRun({ codeHighlight: true })
    ])

    expect(summary[0].codeHighlight).toBe(true)
  })

  it('leaves codeHighlight undefined when the run did not report it', () => {
    const summary = aggregateRuns([makeRun()])

    expect(summary[0].codeHighlight).toBeUndefined()
  })

  it('leaves scroll metrics undefined when autoScroll was off', () => {
    const summary = aggregateRuns([makeRun({ autoScroll: false })])

    expect(summary[0].autoScroll).toBe(false)
    expect(summary[0].scrollLagPx).toBeUndefined()
    expect(summary[0].scrollMs).toBeUndefined()
  })
})
