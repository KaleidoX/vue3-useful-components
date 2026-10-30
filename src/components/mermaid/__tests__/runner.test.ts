import { describe, expect, it } from 'vitest'

import { DIAGRAM_CASES } from '@/components/mermaid/diagrams'
import { normalizeDiagramType } from '@/components/mermaid/engines'
import { aggregateSamples, pickSummary } from '@/components/mermaid/runner'
import type { CaseSample } from '@/components/mermaid/runner'

function makeSample(overrides: Partial<CaseSample> = {}): CaseSample {
  return {
    caseId: 'flowchart',
    label: '流程图',
    stress: false,
    engine: 'mermaid',
    ok: true,
    type: 'flowchart',
    normalizedType: 'flowchart',
    renderMs: 10,
    insertMs: 2,
    svgBytes: 1000,
    svgNodes: 50,
    ...overrides
  }
}

describe('normalizeDiagramType', () => {
  it('maps mermaid internal ids to their mermaid names', () => {
    expect(normalizeDiagramType('class')).toBe('classDiagram')
    expect(normalizeDiagramType('state')).toBe('stateDiagram')
    expect(normalizeDiagramType('er')).toBe('erDiagram')
    expect(normalizeDiagramType('flowchart-v2')).toBe('flowchart')
  })

  it('passes through names both engines already agree on', () => {
    expect(normalizeDiagramType('sequence')).toBe('sequence')
    expect(normalizeDiagramType('gantt')).toBe('gantt')
    expect(normalizeDiagramType('classDiagram')).toBe('classDiagram')
  })

  it('keeps undefined undefined', () => {
    expect(normalizeDiagramType(undefined)).toBeUndefined()
  })
})

describe('DIAGRAM_CASES', () => {
  it('uses only normalized type names as expectations', () => {
    for (const item of DIAGRAM_CASES) {
      expect(normalizeDiagramType(item.expectedType)).toBe(item.expectedType)
    }
  })

  it('has unique ids', () => {
    const ids = DIAGRAM_CASES.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps non-trivial code for every case', () => {
    for (const item of DIAGRAM_CASES) {
      expect(item.code.trim().length).toBeGreaterThan(0)
      expect(item.label.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('aggregateSamples', () => {
  it('groups by case and engine', () => {
    const summaries = aggregateSamples([
      makeSample({ engine: 'mermaid' }),
      makeSample({ engine: 'pele', renderMs: 1 }),
      makeSample({ caseId: 'pie', label: '饼图', engine: 'mermaid' })
    ])

    expect(summaries).toHaveLength(3)
    expect(pickSummary(summaries, 'flowchart', 'pele')?.renderMs.p50).toBe(1)
    expect(pickSummary(summaries, 'pie', 'pele')).toBeUndefined()
  })

  it('medians render time across rounds', () => {
    const summaries = aggregateSamples([
      makeSample({ renderMs: 10 }),
      makeSample({ renderMs: 30 }),
      makeSample({ renderMs: 20 })
    ])

    expect(summaries[0].renderMs.p50).toBe(20)
  })

  it('excludes failed rounds from timing but reports them', () => {
    const summaries = aggregateSamples([
      makeSample({ renderMs: 10 }),
      makeSample({ ok: false, renderMs: 999, error: 'boom' })
    ])

    expect(summaries[0].ok).toBe(false)
    expect(summaries[0].error).toBe('boom')
    expect(summaries[0].successRate).toBe(0.5)
    // 失败轮次的高耗时不能污染中位数
    expect(summaries[0].renderMs.p50).toBe(10)
  })

  it('reports ok only when every round succeeded', () => {
    const summaries = aggregateSamples([makeSample(), makeSample()])

    expect(summaries[0].ok).toBe(true)
    expect(summaries[0].successRate).toBe(1)
  })
})
