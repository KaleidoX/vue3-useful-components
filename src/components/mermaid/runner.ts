/**
 * Mermaid 引擎对照的执行与统计。
 *
 * 单次采样：调用引擎拿到 SVG 字符串 → 插入容器并强制布局 → 记录耗时与体积。
 *
 * 两边都只产出 SVG 字符串，插入与强制布局是我们自己做的、完全相同的动作，
 * 因此「插入耗时」这一项可以直接横向比较；「渲染耗时」则各自包含引擎自己的
 * 解析、布局计算与文本测量（mermaid 会往页面插临时节点，pele 用 canvas 量文字），
 * 那正是引擎之间的真实差异，不做剔除。
 *
 * 每个用例逐引擎交替执行，避免固定顺序让前一个引擎承担 JIT 与 GC 的不利影响。
 */

import type { DiagramCase } from './diagrams'
import type { EngineKey } from './engines'
import { renderDiagram } from './engines'
import type { Percentiles } from '@/components/markdown/metrics'
import { afterPaint, countNodes, median, summarize } from '@/components/markdown/metrics'

export interface CaseSample {
  caseId: string
  label: string
  stress: boolean
  engine: EngineKey
  /** 是否渲染成功；失败时其余指标无意义 */
  ok: boolean
  error?: string
  /** 引擎自报的图类型 */
  type?: string
  /** 归一后的图类型，跨引擎可比较 */
  normalizedType?: string
  /** 引擎解析 + 生成 SVG 的耗时 */
  renderMs: number
  /** 插入容器并强制布局的耗时 */
  insertMs: number
  /** SVG 字符串的 UTF-8 字节数 */
  svgBytes: number
  /** 插入后容器内的元素总数（含 svg 根） */
  svgNodes: number
}

export interface CaseSummary {
  caseId: string
  label: string
  stress: boolean
  engine: EngineKey
  ok: boolean
  error?: string
  type?: string
  /** 归一后的图类型，跨引擎可比较 */
  normalizedType?: string
  /** 成功轮次占全部轮次的比例，便于发现偶发失败 */
  successRate: number
  renderMs: Percentiles
  insertMs: Percentiles
  svgBytes: number
  svgNodes: number
}

export interface DiagramBenchmarkReport {
  generatedAt: string
  userAgent: string
  rounds: number
  engineVersions: Record<EngineKey, string>
  samples: CaseSample[]
}

/** 一次完整采样的结果；container 必须已在文档中，mermaid 需要往里插临时节点 */
export async function sampleCase(
  engine: EngineKey,
  diagram: DiagramCase,
  container: HTMLElement
): Promise<CaseSample> {
  const base: CaseSample = {
    caseId: diagram.id,
    label: diagram.label,
    stress: Boolean(diagram.stress),
    engine,
    ok: false,
    renderMs: 0,
    insertMs: 0,
    svgBytes: 0,
    svgNodes: 0
  }

  const renderStart = performance.now()
  const result = await renderDiagram(engine, diagram.code, container, `bench-${engine}`)
  const renderMs = performance.now() - renderStart

  if (!result.ok || !result.svg) {
    container.innerHTML = ''
    return {
      ...base,
      renderMs,
      error: result.error ?? '引擎未返回 SVG',
      type: result.type,
      normalizedType: result.normalizedType
    }
  }

  // 插入与强制布局：读取 scrollHeight 触发同步布局，这是图表真正变可见的成本
  const insertStart = performance.now()
  container.innerHTML = result.svg
  void container.scrollHeight
  void container.scrollWidth
  const insertMs = performance.now() - insertStart

  const svgNodes = countNodes(container.firstElementChild)

  // 等一帧再进入下个采样，避免上一次的绘制与本次测量重叠
  await afterPaint()

  return {
    ...base,
    ok: true,
    type: result.type,
    normalizedType: result.normalizedType,
    renderMs,
    insertMs,
    svgBytes: utf8Bytes(result.svg),
    svgNodes
  }
}

/** 按 用例 × 引擎 分组取中位数；失败轮次不参与耗时统计，但会拉低 successRate */
export function aggregateSamples(samples: CaseSample[]): CaseSummary[] {
  const groups = new Map<string, CaseSample[]>()
  for (const sample of samples) {
    const key = `${sample.caseId}::${sample.engine}`
    const list = groups.get(key) ?? []
    list.push(sample)
    groups.set(key, list)
  }

  return [...groups.values()].map((group) => {
    const first = group[0]
    const succeeded = group.filter((item) => item.ok)
    const failed = group.find((item) => !item.ok)
    return {
      caseId: first.caseId,
      label: first.label,
      stress: first.stress,
      engine: first.engine,
      ok: succeeded.length === group.length,
      error: failed?.error,
      type: succeeded[0]?.type ?? failed?.type,
      normalizedType: succeeded[0]?.normalizedType ?? failed?.normalizedType,
      successRate: succeeded.length / group.length,
      renderMs: summarize(succeeded.map((item) => item.renderMs)),
      insertMs: summarize(succeeded.map((item) => item.insertMs)),
      svgBytes: median(succeeded.map((item) => item.svgBytes)),
      svgNodes: median(succeeded.map((item) => item.svgNodes))
    }
  })
}

/** 取某个用例在某引擎下的汇总；缺失时返回 undefined */
export function pickSummary(
  summaries: CaseSummary[],
  caseId: string,
  engine: EngineKey
): CaseSummary | undefined {
  return summaries.find((item) => item.caseId === caseId && item.engine === engine)
}

function utf8Bytes(text: string): number {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length
  return text.length
}