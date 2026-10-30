/**
 * 两个 Mermaid 渲染引擎的加载与调用封装。
 *
 * - mermaid.js：完整实现，按图类型懒加载各自的解析器与渲染器，`render()` 是异步的
 * - pele：零依赖实现，所有图类型都在主入口内，`render()` 是同步的
 *
 * 因此「预热」在这里是必需的：mermaid 首次渲染某类图会动态加载该类型的模块，
 * 若把这段加载算进计时，pele 的同步调用会显得毫无成本。预热在计时之外完成，
 * 两个引擎各自只付一次。
 */

import type { DiagramCase } from './diagrams'
import mermaidPkg from 'mermaid/package.json'
import pelePkg from 'pele/package.json'

export type EngineKey = 'mermaid' | 'pele'

/**
 * 引擎版本直接读包内 package.json，避免页面上写死版本号后与真实依赖脱节。
 * 结果导出时带上版本，便于判断两次跑分的结果是否可比。
 */
export const ENGINE_VERSIONS: Record<EngineKey, string> = {
  mermaid: mermaidPkg.version,
  pele: pelePkg.version
}

export interface EngineRenderResult {
  ok: boolean
  /** SVG 字符串，失败时为空 */
  svg?: string
  /** 引擎自报的图类型，原样保留 */
  type?: string
  /** 归一后的图类型，用于跨引擎比较（两套命名有出入，见 normalizeDiagramType） */
  normalizedType?: string
  /** 失败原因 */
  error?: string
}

/**
 * 把两个引擎的图类型名归一成同一个口径。
 *
 * mermaid 的 `render()` 返回内部 id（`class`、`state`、`flowchart-v2`），
 * pele 返回 Mermaid 源码里用的名字（`classDiagram`、`stateDiagram`、`flowchart-v2`）。
 * 同一个图因此会显示成两个名字，直接字符串相减会把正常用例误判成类型不一致。
 */
export function normalizeDiagramType(type: string | undefined): string | undefined {
  if (!type) return type
  const aliases: Record<string, string> = {
    class: 'classDiagram',
    state: 'stateDiagram',
    er: 'erDiagram',
    'flowchart-v2': 'flowchart',
    'flowchart-elk': 'flowchart',
    railroadEbnf: 'railroad',
    railroadAbnf: 'railroad',
    railroadPeg: 'railroad'
  }
  return aliases[type] ?? type
}

type MermaidInstance = typeof import('mermaid')['default']

let mermaidPromise: Promise<MermaidInstance> | null = null
let pelePromise: Promise<typeof import('pele')> | null = null

/**
 * 加载并初始化 mermaid。
 *
 * 与 pele 对齐的口径：默认主题、`sans-serif` 字体、`strict` 安全级别。
 * `suppressErrorRendering` 关掉错误示意图的插入，语法错误直接抛出，
 * 由调用侧统一记为失败，避免把错误示意图当成有效渲染结果。
 */
export function loadMermaid(): Promise<MermaidInstance> {
  mermaidPromise ??= import('mermaid').then((mod) => {
    const mermaid = mod.default
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: 'default',
      fontFamily: 'sans-serif'
    })
    return mermaid
  })
  return mermaidPromise
}

export function loadPele(): Promise<typeof import('pele')> {
  pelePromise ??= import('pele')
  return pelePromise
}

let renderSeq = 0

/**
 * 调用引擎渲染，返回统一结构。
 * mermaid 需要一个可插入临时节点的容器，pele 完全不需要 DOM 插入。
 */
export async function renderDiagram(
  engine: EngineKey,
  code: string,
  container: HTMLElement,
  idPrefix: string
): Promise<EngineRenderResult> {
  const seq = ++renderSeq
  try {
    if (engine === 'mermaid') {
      const mermaid = await loadMermaid()
      // id 必须全局唯一：mermaid 会用它生成 SVG 内部的 id 与临时节点
      const result = await mermaid.render(`${idPrefix}-${seq}`, code, container)
      return {
        ok: true,
        svg: result.svg,
        type: result.diagramType,
        normalizedType: normalizeDiagramType(result.diagramType)
      }
    }

    const { render } = await loadPele()
    // pele 同样要求 idPrefix 唯一，否则同页多图会共享 id
    const result = render(code, { idPrefix: `pele-${idPrefix}-${seq}` })
    return {
      ok: true,
      svg: result.svg,
      type: result.mermaidType,
      normalizedType: normalizeDiagramType(result.mermaidType)
    }
  } catch (error) {
    return { ok: false, error: describeError(error) }
  }
}

/**
 * 用一个用例把引擎完整跑一遍，用于加载各自的按类型模块。
 * 预热阶段的失败不抛出：正式计时时会再次暴露并记录。
 */
export async function warmupEngine(
  engine: EngineKey,
  cases: DiagramCase[],
  container: HTMLElement
): Promise<void> {
  await loadMermaid().catch(() => null)
  await loadPele().catch(() => null)
  for (const item of cases) {
    try {
      await renderDiagram(engine, item.code, container, `warmup-${engine}-${item.id}`)
    } catch {
      // 预热失败留给正式计时上报，这里只保证流程继续
    }
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}
