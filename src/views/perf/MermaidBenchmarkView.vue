<template>
  <div class="space-y-6">
    <PreviewSection
      title="跑分设置"
      description="同一份 Mermaid 源码分别交给两个引擎渲染，比较解析生成、插入布局与输出体积；每轮逐引擎交替执行以抵消顺序偏差。"
      compact
    >
      <div
        class="flex flex-wrap items-center gap-x-5 gap-y-3 border border-base-400 rounded-xl border-solid bg-base-200 px-4 py-3"
      >
        <label class="flex items-center gap-2 text-sm text-slate-600">
          <span class="whitespace-nowrap">轮次</span>
          <ElSelect v-model="rounds" size="small" class="w-20!" :disabled="running">
            <ElOption v-for="n in [1, 3, 5, 10]" :key="n" :label="String(n)" :value="n" />
          </ElSelect>
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-600">
          <span class="whitespace-nowrap" title="关闭后只跑常规规模的图表，跳过压力大图">
            含压力项
          </span>
          <ElSwitch v-model="includeStress" size="small" :disabled="running" />
        </label>

        <div class="ml-auto flex items-center gap-2">
          <PreviewButton v-if="!running" variant="primary" @click="start">开始跑分</PreviewButton>
          <PreviewButton v-else @click="stop">停止</PreviewButton>
          <PreviewButton :disabled="running || samples.length === 0" @click="clearResults">
            清空
          </PreviewButton>
          <PreviewButton :disabled="running || samples.length === 0" @click="exportJson">
            导出 JSON
          </PreviewButton>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span>用例：{{ activeCases.length }} 张图</span>
        <span>引擎：mermaid {{ mermaidVersion }} / pele {{ peleVersion }}</span>
        <span v-if="running" class="text-primary">进度 {{ progressLabel }}</span>
        <span v-if="warmupNotice" class="text-amber-600">{{ warmupNotice }}</span>
      </div>
    </PreviewSection>

    <PreviewSection
      v-if="summaries.length > 0"
      title="结果对比"
      description="耗时取多轮中位数。端到端是「给源码、拿到可见图表」的完整成本，对比列以它为准；渲染与插入分开列出，便于看清差异落在哪一段。"
      compact
    >
      <div class="overflow-x-auto border border-base-400 rounded-xl border-solid bg-white">
        <table class="min-w-[980px] w-full border-collapse text-left text-sm" data-testid="mermaid-result-table">
          <thead class="bg-base-300 text-xs text-slate-500 tracking-wide uppercase">
            <tr>
              <th class="px-4 py-3">图表</th>
              <th class="px-4 py-3">渲染 mermaid</th>
              <th class="px-4 py-3">渲染 pele</th>
              <th class="px-4 py-3">插入 mermaid</th>
              <th class="px-4 py-3">插入 pele</th>
              <th class="px-4 py-3">端到端 mermaid</th>
              <th class="px-4 py-3">端到端 pele</th>
              <th class="px-4 py-3">对比</th>
              <th class="px-4 py-3">SVG 体积</th>
              <th class="px-4 py-3">元素数</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in tableRows" :key="row.caseId" class="align-top">
              <td class="px-4 py-2.5">
                <div class="text-slate-800 font-medium">
                  {{ row.label }}
                  <span
                    v-if="row.stress"
                    class="ml-1 rounded bg-amber-100 px-1 text-[10px] text-amber-700 font-normal"
                  >
                    压力
                  </span>
                </div>
                <div class="mt-0.5 text-xs text-slate-400" :class="row.typeMismatch ? 'text-amber-600' : ''">
                  {{ row.typeLabel }}
                </div>
              </td>
              <td class="px-4 py-2.5 text-slate-700 font-mono">{{ row.renderMermaid }}</td>
              <td class="px-4 py-2.5 text-slate-700 font-mono">{{ row.renderPele }}</td>
              <td class="px-4 py-2.5 text-slate-700 font-mono">{{ row.insertMermaid }}</td>
              <td class="px-4 py-2.5 text-slate-700 font-mono">{{ row.insertPele }}</td>
              <td class="px-4 py-2.5 text-slate-800 font-medium font-mono">{{ row.endToEndMermaid }}</td>
              <td class="px-4 py-2.5 text-slate-800 font-medium font-mono">{{ row.endToEndPele }}</td>
              <td class="px-4 py-2.5 text-xs" :class="row.verdictClass">{{ row.verdict }}</td>
              <td class="px-4 py-2.5 text-slate-700 font-mono">{{ row.svgBytes }}</td>
              <td class="px-4 py-2.5 text-slate-700 font-mono">{{ row.svgNodes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-xs text-slate-400">
        指标取 {{ rounds }} 轮中位数。端到端 = 渲染 + 插入布局，是「给一段源码、拿到可见图表」的完整成本，
        对比列以此为基准；渲染、插入两列分开列出，便于看清差异落在哪一段。
        SVG 体积与元素数按「mermaid / pele」给出，反映输出结构差异而非性能。
      </p>
    </PreviewSection>

    <PreviewSection
      v-if="typeMismatches.length > 0"
      title="类型判定差异"
      description="两个引擎对同一份源码识别出的图类型不同，说明其中一方走了非预期的渲染路径，该行耗时不具可比性。"
      compact
    >
      <ul class="text-xs space-y-1.5">
        <li v-for="item in typeMismatches" :key="item.caseId" class="text-amber-600">
          <span class="font-medium">{{ item.label }}</span>
          <span class="ml-2">mermaid：{{ item.mermaidType ?? '—' }}；pele：{{ item.peleType ?? '—' }}</span>
        </li>
      </ul>
    </PreviewSection>

    <PreviewSection
      v-if="failures.length > 0"
      title="渲染失败"
      description="这些用例至少有一个引擎（或某个轮次）没能产出 SVG，对应行的耗时指标会缺失。"
      compact
    >
      <ul class="text-xs space-y-1.5">
        <li v-for="item in failures" :key="`${item.caseId}-${item.engine}`" class="text-red-500">
          <span class="font-medium">{{ item.label }} · {{ item.engine }}</span>
          <span class="ml-2 text-slate-500">{{ item.error ?? '未知错误' }}</span>
          <span v-if="item.successRate < 1" class="ml-1 text-slate-400">
            （成功 {{ (item.successRate * 100).toFixed(0) }}%）
          </span>
        </li>
      </ul>
    </PreviewSection>

    <PreviewSection title="渲染结果预览" compact>
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <span class="text-xs text-slate-400">选择图表：</span>
        <PreviewButton
          v-for="item in activeCases"
          :key="item.id"
          :variant="item.id === previewCaseId ? 'primary' : 'secondary'"
          :disabled="running"
          @click="previewCaseId = item.id"
        >
          {{ item.label }}
        </PreviewButton>
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="border border-base-400 rounded-xl border-solid bg-white">
          <div class="border-b border-base-400 px-3 py-2 text-xs text-slate-500">
            mermaid {{ mermaidVersion }}
          </div>
          <div ref="mermaidPreviewRef" class="mermaid-preview" data-testid="mermaid-preview" />
        </div>
        <div class="border border-base-400 rounded-xl border-solid bg-white">
          <div class="border-b border-base-400 px-3 py-2 text-xs text-slate-500">
            pele {{ peleVersion }}
          </div>
          <div ref="pelePreviewRef" class="mermaid-preview" data-testid="pele-preview" />
        </div>
      </div>
      <p class="mt-2 text-xs text-slate-400">
        预览在跑分结束后填充；两个引擎都插入同一份源码的输出，可直观比较布局与配色差异。
      </p>
    </PreviewSection>

    <!-- 跑分用的落点：mermaid 需要真实在文档中的容器插临时节点，这里隐藏但保持可布局 -->
    <div
      data-mermaid-bench-host
      class="fixed left-[-10000px] top-0 h-[600px] w-[800px] overflow-hidden"
      aria-hidden="true"
    />

    <PreviewSection v-if="errorMessage" title="运行异常" compact>
      <p class="text-sm text-red-500">{{ errorMessage }}</p>
    </PreviewSection>

    <PreviewSection title="口径说明" compact>
      <ul class="text-xs text-slate-500 leading-relaxed space-y-1.5">
        <li>
          · 「端到端」= 渲染 + 插入布局，是「给一段源码、拿到可见图表」的完整成本，对比列以它为准。
          单独看渲染列会低估 mermaid：它在 `render()` 内部就用 DOM 量文字并插临时节点，
          而 pele 的 `render()` 完全在内存里完成，两列的边界本就不对齐。
        </li>
        <li>
          · 「插入布局」是同一段代码对两引擎输出执行的相同动作（写入
          <code class="rounded bg-base-300 px-1">innerHTML</code> 后读
          <code class="rounded bg-base-300 px-1">scrollHeight</code> 强制同步布局），
          可直接横向比较；它体现的是输出 SVG 的结构复杂度，而不是引擎速度。
        </li>
        <li>
          · 两个引擎都在计时开始前用全部用例预热一遍，按图类型懒加载的模块不计入任何指标。
          未预热时 mermaid 的首个同类图会额外付出模块加载成本，对照会失真。
        </li>
        <li>
          · mermaid 关闭了错误示意图渲染（<code class="rounded bg-base-300 px-1">suppressErrorRendering</code>），
          语法错误直接记为失败；pele 本身以异常形式报错。任一引擎失败都会在「渲染失败」中列出，不会静默略过。
        </li>
        <li>
          · 两个引擎版本各自独立，主题与字体虽已对齐（默认主题、sans-serif），但配色与布局算法本就不同，
          SVG 体积与元素数只反映输出结构差异。
        </li>
      </ul>
    </PreviewSection>
  </div>
</template>

<script lang="ts" setup>
import type { LocationQuery } from 'vue-router'

import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
import { DIAGRAM_CASES } from '@/components/mermaid/diagrams'
import type { DiagramCase } from '@/components/mermaid/diagrams'
import type { EngineKey } from '@/components/mermaid/engines'
import { ENGINE_VERSIONS, renderDiagram, warmupEngine } from '@/components/mermaid/engines'
import type { CaseSample, CaseSummary } from '@/components/mermaid/runner'
import { aggregateSamples, pickSummary, sampleCase } from '@/components/mermaid/runner'
import type { DiagramBenchmarkReport } from '@/components/mermaid/runner'
import { formatMsPrecise, formatNumber } from '@/components/markdown/metrics'

defineOptions({ name: 'MermaidBenchmarkView' })

const ENGINES: EngineKey[] = ['mermaid', 'pele']

const mermaidVersion = ENGINE_VERSIONS.mermaid
const peleVersion = ENGINE_VERSIONS.pele

const rounds = ref(3)
const includeStress = ref(false)

const running = ref(false)
const errorMessage = ref('')
/** 预热失败提示；不影响流程，只是说明首轮可能混入模块加载 */
const warmupNotice = ref('')
const progress = ref<{ caseId: string; engine: EngineKey; done: number; total: number } | null>(null)
const samples = ref<CaseSample[]>([])
const previewCaseId = ref(DIAGRAM_CASES[0].id)

const mermaidPreviewRef = ref<HTMLElement | null>(null)
const pelePreviewRef = ref<HTMLElement | null>(null)

const activeCases = computed<DiagramCase[]>(() =>
  includeStress.value ? DIAGRAM_CASES : DIAGRAM_CASES.filter((item) => !item.stress)
)

const summaries = computed<CaseSummary[]>(() => aggregateSamples(samples.value))

const failures = computed(() => summaries.value.filter((item) => !item.ok))

/** 两个引擎都成功、但识别出的图类型不一致的用例 */
const typeMismatches = computed(() => {
  const result: { caseId: string; label: string; mermaidType?: string; peleType?: string }[] = []
  for (const diagram of activeCases.value) {
    const m = pickSummary(summaries.value, diagram.id, 'mermaid')
    const p = pickSummary(summaries.value, diagram.id, 'pele')
    const mType = m?.normalizedType
    const pType = p?.normalizedType
    if (mType && pType && mType !== pType) {
      result.push({
        caseId: diagram.id,
        label: diagram.label,
        mermaidType: m?.type,
        peleType: p?.type
      })
    }
  }
  return result
})

const progressLabel = computed(() => {
  if (!progress.value) return '—'
  const { done, total, engine } = progress.value
  return `${engine} ${done}/${total}`
})

interface TableRow {
  caseId: string
  label: string
  stress: boolean
  typeLabel: string
  /** 两个引擎识别出的类型不一致时为 true，该行耗时不具可比性 */
  typeMismatch: boolean
  renderMermaid: string
  renderPele: string
  insertMermaid: string
  insertPele: string
  endToEndMermaid: string
  endToEndPele: string
  svgBytes: string
  svgNodes: string
  verdict: string
  verdictClass: string
}

/** 以 mermaid 为基准给出方向；两边都成功且有值时才比较 */
function compareEngines(mermaidMs: number, peleMs: number): { verdict: string; verdictClass: string } {
  if (!mermaidMs || !peleMs) return { verdict: '—', verdictClass: 'text-slate-400' }
  const ratio = peleMs / mermaidMs
  if (ratio < 0.95) {
    return { verdict: `pele 快 ${(1 / ratio).toFixed(2)}×`, verdictClass: 'text-emerald-600' }
  }
  if (ratio > 1.05) {
    return { verdict: `mermaid 快 ${ratio.toFixed(2)}×`, verdictClass: 'text-sky-600' }
  }
  return { verdict: '基本持平', verdictClass: 'text-slate-400' }
}

function formatBytes(value: number | undefined): string {
  if (!value) return '—'
  return value >= 1024 ? `${(value / 1024).toFixed(1)} KB` : `${value.toFixed(0)} B`
}

/** 端到端成本 = 引擎渲染 + 我们做的插入与强制布局，两者缺一不可 */
function endToEndMs(summary: CaseSummary | undefined): number {
  if (!summary?.ok) return 0
  return summary.renderMs.p50 + summary.insertMs.p50
}

const tableRows = computed<TableRow[]>(() => {
  const result: TableRow[] = []
  for (const diagram of activeCases.value) {
    const m = pickSummary(summaries.value, diagram.id, 'mermaid')
    const p = pickSummary(summaries.value, diagram.id, 'pele')
    if (!m && !p) continue

    const mermaidEnd = endToEndMs(m)
    const peleEnd = endToEndMs(p)
    const { verdict, verdictClass } = compareEngines(mermaidEnd, peleEnd)
    // 类型名先归一再比：mermaid 报内部 id（class / state），pele 报 Mermaid 名称（classDiagram）
    const typeMismatch = Boolean(
      m?.normalizedType && p?.normalizedType && m.normalizedType !== p.normalizedType
    )
    const typeLabel = typeMismatch
      ? `${m?.type ?? '—'} / ${p?.type ?? '—'}`
      : (m?.normalizedType ?? p?.normalizedType ?? diagram.expectedType)
    result.push({
      caseId: diagram.id,
      label: diagram.label,
      stress: Boolean(diagram.stress),
      typeLabel,
      typeMismatch,
      renderMermaid: m?.ok ? formatMsPrecise(m.renderMs.p50) : m ? '失败' : '—',
      renderPele: p?.ok ? formatMsPrecise(p.renderMs.p50) : p ? '失败' : '—',
      insertMermaid: m?.ok ? formatMsPrecise(m.insertMs.p50) : '—',
      insertPele: p?.ok ? formatMsPrecise(p.insertMs.p50) : '—',
      endToEndMermaid: mermaidEnd ? formatMsPrecise(mermaidEnd) : '—',
      endToEndPele: peleEnd ? formatMsPrecise(peleEnd) : '—',
      svgBytes: formatBytes(m?.svgBytes) + ' / ' + formatBytes(p?.svgBytes),
      svgNodes: formatNumber(m?.svgNodes, 0) + ' / ' + formatNumber(p?.svgNodes, 0),
      verdict,
      verdictClass
    })
  }
  return result
})

let cancelled = false

async function start() {
  if (running.value) return
  cancelled = false
  errorMessage.value = ''
  warmupNotice.value = ''
  samples.value = []
  progress.value = null
  running.value = true

  try {
    const cases = activeCases.value

    // 预热容器：mermaid 需要真实节点插临时 SVG，用离屏但已挂载的元素
    const warmupHost = document.createElement('div')
    warmupHost.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:600px;'
    document.body.append(warmupHost)
    try {
      for (const engine of ENGINES) {
        if (cancelled) return
        await warmupEngine(engine, cases, warmupHost)
      }
    } catch (error) {
      warmupNotice.value = `预热未完成（${error instanceof Error ? error.message : String(error)}），首轮耗时可能混入模块加载`
    } finally {
      warmupHost.remove()
    }
    if (cancelled) return

    const host = document.querySelector<HTMLElement>('[data-mermaid-bench-host]')
    if (!host) throw new Error('跑分容器未就绪')

    for (let round = 0; round < rounds.value; round++) {
      // 交替顺序：偶数轮以 mermaid 开头，奇数轮反过来
      const order = round % 2 === 0 ? ENGINES : [...ENGINES].reverse()
      for (const diagram of cases) {
        for (const engine of order) {
          if (cancelled) return
          progress.value = { caseId: diagram.id, engine, done: samples.value.length, total: cases.length * ENGINES.length * rounds.value }
          const sample = await sampleCase(engine, diagram, host)
          samples.value = [...samples.value, sample]
        }
      }
    }

    await renderPreview()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  } finally {
    running.value = false
    progress.value = null
  }
}

function stop() {
  cancelled = true
  running.value = false
}

/** 把当前选中图表在两个引擎下的输出并排插入预览区 */
async function renderPreview() {
  const diagram = DIAGRAM_CASES.find((item) => item.id === previewCaseId.value)
  if (!diagram) return
  const mermaidHost = mermaidPreviewRef.value
  const peleHost = pelePreviewRef.value
  if (!mermaidHost || !peleHost) return

  const mermaidResult = await renderDiagram('mermaid', diagram.code, mermaidHost, 'preview-mermaid')
  mermaidHost.innerHTML = mermaidResult.ok && mermaidResult.svg ? mermaidResult.svg : errorBlock(mermaidResult.error)

  const peleResult = await renderDiagram('pele', diagram.code, peleHost, 'preview-pele')
  peleHost.innerHTML = peleResult.ok && peleResult.svg ? peleResult.svg : errorBlock(peleResult.error)
}

function errorBlock(message: string | undefined): string {
  const div = document.createElement('div')
  div.className = 'p-3 text-xs text-red-500 whitespace-pre-wrap'
  div.textContent = message ?? '渲染失败'
  return div.outerHTML
}

watch(previewCaseId, () => {
  if (running.value) return
  void renderPreview()
})

function clearResults() {
  samples.value = []
  errorMessage.value = ''
}

function buildReport(): DiagramBenchmarkReport {
  return {
    generatedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    rounds: rounds.value,
    engineVersions: { mermaid: mermaidVersion, pele: peleVersion },
    samples: samples.value
  }
}

function exportJson() {
  const blob = new Blob([JSON.stringify(buildReport(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `mermaid-benchmark-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/*
 * URL 参数入口，便于自动化复现：
 *   ?rounds=1&stress=1&case=flowchart&autorun=1
 * 用 hash 路由的 query 承载，只在 hash 参数变化时生效。
 */
function applyQueryParams(query: LocationQuery): boolean {
  const roundCount = Number(query.rounds)
  if (Number.isFinite(roundCount) && roundCount > 0) rounds.value = roundCount
  if (query.stress !== undefined) includeStress.value = String(query.stress) !== '0'
  if (query.case && DIAGRAM_CASES.some((item) => item.id === query.case)) {
    previewCaseId.value = String(query.case)
  }
  return String(query.autorun ?? '') === '1'
}

const route = useRoute()
const querySignature = computed(() => JSON.stringify(route.query))

watch(
  querySignature,
  async () => {
    if (!applyQueryParams(route.query)) return
    await nextTick()
    await start()
  },
  { immediate: true }
)

onMounted(() => {
  void renderPreview()
})
</script>

<style scoped>
.mermaid-preview {
  min-height: 260px;
  max-height: 520px;
  overflow: auto;
  padding: 12px;
}

.mermaid-preview :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
