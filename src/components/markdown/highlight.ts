/**
 * 代码块高亮的统一预热入口。
 *
 * 两个库的高亮都不在主包内，且都要在首次渲染代码块时动态加载：
 * - markstream-vue 内部 `import('stream-diffs/markstream')`，后者再 `import('@pierre/diffs')`
 * - vue-stream-markdown 通过 `extensions.code` 注入 @stream-markdown/code，其内部 `import('shiki')`
 *
 * 若不在挂载前预热，第一个代码块触发的模块拉取会混进该片耗时，
 * 且两库的加载成本不对等，对照就不成立。预热放在计时开始之前，因此不进入任何指标。
 *
 * 单例化：同一个引擎只加载一次，多轮跑分不会重复付这份成本。
 */

import type { ExtensionOverrides } from 'vue-stream-markdown'

type CodeExtension = NonNullable<ExtensionOverrides['code']>

export interface HighlightWarmupResult {
  /** 高亮引擎是否成功就绪 */
  ready: boolean
  /** 失败原因，仅 ready=false 时有值 */
  error?: string
}

let markstreamTask: Promise<HighlightWarmupResult> | null = null
let vsmTask: Promise<HighlightWarmupResult> | null = null

/** vue-stream-markdown 的 code 扩展实例，供组件以响应式方式取用 */
export const vsmCodeExtension = shallowRef<CodeExtension | null>(null)

/** 预热 markstream-vue 的代码块运行时（stream-diffs + @pierre/diffs + shiki） */
export function warmupMarkstreamHighlight(): Promise<HighlightWarmupResult> {
  markstreamTask ??= import('markstream-vue')
    .then(async (mod) => {
      const ok = await mod.preloadCodeBlockRuntime()
      return ok
        ? { ready: true }
        : { ready: false, error: 'stream-diffs 未安装或加载失败，代码块退化为纯文本' }
    })
    .catch((error: unknown) => ({
      ready: false,
      error: error instanceof Error ? error.message : String(error)
    }))
  return markstreamTask
}

/** 预热 vue-stream-markdown 的 code 扩展（@stream-markdown/code + shiki） */
export function warmupVsmHighlight(): Promise<HighlightWarmupResult> {
  vsmTask ??= import('@stream-markdown/code')
    .then(async (mod) => {
      const extension = mod.code()
      // preload 会建好共享 highlighter 并载入默认主题与语言
      await extension.preload()
      vsmCodeExtension.value = extension
      return { ready: true }
    })
    .catch((error: unknown) => {
      vsmCodeExtension.value = null
      return {
        ready: false,
        error: error instanceof Error ? error.message : String(error)
      }
    })
  return vsmTask
}

/** 同时预热两个引擎，返回各自结果，供页面提示差异 */
export async function warmupHighlightEngines(): Promise<{
  markstream: HighlightWarmupResult
  vsm: HighlightWarmupResult
}> {
  const [markstream, vsm] = await Promise.all([warmupMarkstreamHighlight(), warmupVsmHighlight()])
  return { markstream, vsm }
}
