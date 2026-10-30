<template>
  <div class="space-y-6">
    <PreviewSection
      title="语料与运行参数"
      description="语料由固定 seed 在浏览器本地生成，两个渲染器拿到逐字节相同的输入；跑分按「每轮只挂载一个库」交替执行。"
      compact
    >
      <div class="flex flex-wrap items-center gap-x-5 gap-y-3 border border-base-400 rounded-xl border-solid bg-base-200 px-4 py-3">
        <label class="flex items-center gap-2 text-sm text-slate-600">
          <span class="whitespace-nowrap">语料规模</span>
          <ElSelect v-model="targetChars" size="small" class="w-32!" :disabled="running">
            <ElOption
              v-for="size in sizeOptions"
              :key="size.value"
              :label="size.label"
              :value="size.value"
            />
          </ElSelect>
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-600">
          <span class="whitespace-nowrap">每片字符数</span>
          <ElSelect v-model="chunkSize" size="small" class="w-28!" :disabled="running">
            <ElOption v-for="size in chunkOptions" :key="size" :label="String(size)" :value="size" />
          </ElSelect>
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-600">
          <span class="whitespace-nowrap">轮次</span>
          <ElSelect v-model="rounds" size="small" class="w-20!" :disabled="running">
            <ElOption v-for="n in [1, 3, 5]" :key="n" :label="String(n)" :value="n" />
          </ElSelect>
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-600">
          <span class="whitespace-nowrap">虚拟化</span>
          <ElSwitch v-model="virtualization" size="small" :disabled="running" />
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-600">
          <span class="whitespace-nowrap" title="每片渲染完成后自动滚动到底部，模拟聊天窗口跟随最新输出">
            自动滚到底
          </span>
          <ElSwitch v-model="autoScroll" size="small" :disabled="running" />
        </label>

        <div class="ml-auto flex items-center gap-2">
          <PreviewButton v-if="!running" variant="primary" @click="start">开始跑分</PreviewButton>
          <PreviewButton v-else @click="stop">停止</PreviewButton>
          <PreviewButton :disabled="running || runs.length === 0" @click="clearResults">清空</PreviewButton>
          <PreviewButton :disabled="running || runs.length === 0" @click="exportJson">
            导出 JSON
          </PreviewButton>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span>文档：{{ docStats.chars.toLocaleString() }} 字符 / {{ docStats.size }}</span>
        <span>切片：{{ chunkCount }} 片</span>
        <span v-if="running" class="text-primary">进度 {{ progressLabel }}</span>
      </div>
    </PreviewSection>

    <PreviewSection
      title="实时渲染区"
      description="跑分时只挂载当前被测的渲染器；跑分结束后可在此切换两库的最终渲染结果做肉眼对照。"
      compact
    >
      <StreamBenchmarkHarness
        ref="harnessRef"
        :key="harnessKey"
        :virtualization="virtualization"
        @progress="onProgress"
        @sample="onSample"
      />
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <span class="text-xs text-slate-400">最终态预览：</span>
        <PreviewButton :disabled="running || !benchmarkDoc" @click="previewDoc('markstream-vue')">
          markstream-vue
        </PreviewButton>
        <PreviewButton :disabled="running || !benchmarkDoc" @click="previewDoc('vue-stream-markdown')">
          vue-stream-markdown
        </PreviewButton>
        <PreviewButton :disabled="running" @click="harnessRef?.clear()">清除预览</PreviewButton>
      </div>
    </PreviewSection>

    <PreviewSection v-if="summary.length === RENDERERS.length" title="结果对比" compact>
      <div class="overflow-x-auto border border-base-400 rounded-xl border-solid bg-white">
        <table
          class="min-w-[900px] w-full border-collapse text-left text-sm"
          data-testid="benchmark-result-table"
        >
          <thead class="bg-base-300 text-xs text-slate-500 tracking-wide uppercase">
            <tr>
              <th class="px-4 py-3">指标</th>
              <th v-for="item in summary" :key="item.renderer" class="px-4 py-3">
                {{ item.renderer }}
              </th>
              <th class="px-4 py-3">对比</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in tableRows" :key="row.label" class="align-top">
              <td class="px-4 py-3">
                <div class="text-slate-800 font-medium">{{ row.label }}</div>
                <div class="mt-0.5 text-xs text-slate-400">{{ row.hint }}</div>
              </td>
              <td v-for="(cell, i) in row.values" :key="i" class="px-4 py-3 text-slate-700 font-mono">
                {{ cell }}
              </td>
              <td class="px-4 py-3 text-xs" :class="row.verdictClass">{{ row.verdict }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-xs text-slate-400">
        指标取 {{ rounds }} 轮中位数；「对比」列以较小值为优，仅作方向提示，不代表统计显著性。
      </p>
    </PreviewSection>

    <PreviewSection v-if="errorMessage" title="运行异常" compact>
      <p class="text-sm text-red-500">{{ errorMessage }}</p>
    </PreviewSection>

    <PreviewSection title="口径说明" compact>
      <ul class="text-xs text-slate-500 leading-relaxed space-y-1.5">
        <li>
          · 两库均关闭淡入动画与打字机光标；vue-stream-markdown 额外关闭
          <code class="rounded bg-base-300 px-1">completion</code>，因其默认会自动补全未闭合语法，而
          markstream 无此行为。
        </li>
        <li>
          · 代码块统一渲染为无高亮的纯 <code class="rounded bg-base-300 px-1">&lt;pre&gt;</code>：未安装
          stream-diffs 与 shiki 扩展，避免单方开启高亮造成失真。
        </li>
        <li>
          · 收敛判据为「容器节点数与内容高度连续 4 帧不变」，不依赖任一方的事件；markstream 的
          <code class="rounded bg-base-300 px-1">render-final</code> 仅在虚拟化路径触发，vsm 的
          <code class="rounded bg-base-300 px-1">end</code> 仅在 static 模式触发，语义不对等。
        </li>
        <li>
          · 开启「自动滚到底」后，每片更新完立即把容器滚到底（紧跟
          <code class="rounded bg-base-300 px-1">nextTick</code>），滚动前读取
          <code class="rounded bg-base-300 px-1">scrollHeight</code> 会触发对整篇文档的强制同步布局，这正是聊天窗口的真实成本，计入该片耗时，不做剔除。
          「滚动跟随滞后」为滚动完成并绘制后，容器距底部还剩多少像素：恒为 0 说明滚动始终追得上渲染，持续为正说明内容在滚动之后仍在异步补齐
          （视口优先、延迟挂载、批处理都会这样），用户会看到「已经到底了又被顶下去」。
        </li>
        <li>
          · 堆占用与长任务来自 Chromium 专有接口，其他浏览器显示为「—」；长任务采样不包含页面切到后台的时段。
        </li>
      </ul>
    </PreviewSection>
  </div>
</template>

<script lang="ts" setup>
import type { LocationQuery } from 'vue-router'

import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
import StreamBenchmarkHarness from '@/components/markdown/StreamBenchmarkHarness.vue'
import { buildBenchmarkDocument, sliceChunks, utf8Bytes } from '@/components/markdown/benchmarkDocument'
import { aggregateRuns } from '@/components/markdown/metrics'
import type { BenchmarkReport, RendererKey, RunMetrics } from '@/components/markdown/metrics'
import { formatMs, formatMsPrecise, formatNumber } from '@/components/markdown/metrics'

defineOptions({ name: 'MarkdownBenchmarkView' })

const RENDERERS: RendererKey[] = ['markstream-vue', 'vue-stream-markdown']

const sizeOptions = [
  { label: '10K', value: 10 * 1024 },
  { label: '100K', value: 100 * 1024 },
  { label: '500K', value: 500 * 1024 }
]
const chunkOptions = [200, 2000, 10000]

const targetChars = ref(500 * 1024)
// 500K 文档按 2000 字符切片约 256 片；再小会让每片固定的两帧等待主导总耗时
const chunkSize = ref(2000)
const rounds = ref(3)
const virtualization = ref(true)
const autoScroll = ref(false)

const running = ref(false)
const errorMessage = ref('')
const progress = ref<{ renderer: RendererKey; done: number; total: number } | null>(null)
const liveMetrics = ref<Partial<RunMetrics> | null>(null)
const runs = ref<RunMetrics[]>([])
const benchmarkDoc = ref('')
// 每次开始跑分换 key，强制重建宿主，避免上一轮残留的挂载状态污染计时
const harnessKey = ref(0)

const harnessRef = ref<InstanceType<typeof StreamBenchmarkHarness> | null>(null)

const docStats = computed(() => {
  if (!benchmarkDoc.value) return { chars: 0, size: '—' }
  const bytes = utf8Bytes(benchmarkDoc.value)
  return {
    chars: benchmarkDoc.value.length,
    size: bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`
  }
})

const chunkCount = computed(() =>
  benchmarkDoc.value ? Math.max(1, Math.ceil(benchmarkDoc.value.length / chunkSize.value)) : 0
)

const progressLabel = computed(() => {
  if (!progress.value) return '—'
  const percent = Math.round((progress.value.done / progress.value.total) * 100)
  return `${progress.value.renderer} ${progress.value.done}/${progress.value.total}（${percent}%）`
})

const summary = computed(() => aggregateRuns(runs.value))

interface TableRow {
  label: string
  hint: string
  values: string[]
  verdict: string
  verdictClass: string
}

/** 用较小值判定方向；两个值都存在且差异可观时才比较 */
function compare(a: number | undefined, b: number | undefined): string {
  if (a === undefined || b === undefined) return '—'
  if (a === 0 || b === 0) return '—'
  // 两个值都在 1ms 以下时，差异落在计时器分辨率附近，比值放大没有意义
  if (Math.max(a, b) < 1) return '差异低于计时精度'
  const ratio = a / b
  if (ratio > 1.05) return `vsm 快 ${ratio.toFixed(2)}×`
  if (ratio < 0.95) return `markstream 快 ${(1 / ratio).toFixed(2)}×`
  return '基本持平'
}

function verdictClass(a: number | undefined, b: number | undefined): string {
  if (a === undefined || b === undefined) return 'text-slate-400'
  if (a === 0 || b === 0) return 'text-slate-400'
  if (Math.max(a, b) < 1) return 'text-slate-400'
  const ratio = a / b
  if (ratio > 1.05) return 'text-emerald-600'
  if (ratio < 0.95) return 'text-sky-600'
  return 'text-slate-400'
}

const tableRows = computed<TableRow[]>(() => {
  const [a, b] = summary.value
  if (!a || !b) return []

  const define = (
    label: string,
    hint: string,
    pick: (metric: RunMetrics) => number | undefined,
    format: (value: number | undefined) => string,
    /** 仅在满足条件时展示该行，例如滚动指标只在开启自动滚动后才有意义 */
    when = true
  ): TableRow | null => {
    if (!when) return null
    const av = pick(a)
    const bv = pick(b)
    return {
      label,
      hint,
      values: [format(av), format(bv)],
      verdict: compare(av, bv),
      verdictClass: verdictClass(av, bv)
    }
  }

  const rows = [
    define('首屏时间', '挂载到首片内容完成绘制', (m) => m.firstPaintMs, formatMs),
    define('单次更新 p50', '每次推流片的耗时中位数', (m) => m.perUpdate.p50, formatMs),
    define('单次更新 p95', '95% 的推流片不超过该耗时', (m) => m.perUpdate.p95, formatMs),
    define('单次更新最大', '最慢的一次推流片', (m) => m.perUpdate.max, formatMs),
    define('推流总耗时', '全部切片推完的墙钟时间', (m) => m.streamTotalMs, formatMs),
    define('终态收敛', '切终态后到底层 DOM 稳定', (m) => m.settleMs, formatMs),
    define(
      '滚动动作耗时',
      '每片滚到底的耗时均值，含读取布局的强制回流',
      // 单次样本会被 0.1ms 的计时精度量化，均值才反映真实开销
      (m) => m.scrollMs?.mean,
      formatMsPrecise,
      autoScroll.value
    ),
    define(
      '滚动跟随滞后',
      '滚到底并绘制后仍距底部多远，越小越跟得上',
      (m) => m.scrollLagPx?.p50,
      (v) => (v === undefined ? '—' : `${v.toFixed(0)} px`),
      autoScroll.value
    ),
    define('长任务次数', '单次超过 50ms 的主线程任务数', (m) => m.longTask?.count, (v) => formatNumber(v, 0)),
    define('长任务总时长', '长任务累计占用主线程时间', (m) => m.longTask?.totalMs, formatMs),
    define('累计布局偏移', 'CLS，越小越稳定', (m) => m.layoutShift, (v) => formatNumber(v, 3)),
    define('帧间隔 p95', 'rAF 间隔 95 分位，越大越卡', (m) => m.frameGapMs?.p95, formatMs),
    define('掉帧数', '帧间隔超过 25ms 的帧数', (m) => m.droppedFrames, (v) => formatNumber(v, 0)),
    define('节点峰值', '渲染过程中的 DOM 元素峰值', (m) => m.peakNodes, (v) => formatNumber(v, 0)),
    define('堆占用峰值', '仅 Chromium 可用', (m) => m.heapPeakMb, (v) => (v === undefined ? '—' : `${v.toFixed(1)} MB`))
  ]

  return rows.filter((row): row is TableRow => row !== null)
})

function onProgress(payload: { renderer: RendererKey; done: number; total: number }) {
  progress.value = payload
}

function onSample(payload: { renderer: RendererKey; metrics: Partial<RunMetrics> }) {
  liveMetrics.value = payload.metrics
}

async function start() {
  if (running.value) return
  errorMessage.value = ''
  runs.value = []
  progress.value = null
  liveMetrics.value = null
  running.value = true
  harnessKey.value++

  try {
    // 语料本地生成，两个库共用同一份字符串
    const generated = buildBenchmarkDocument({ targetChars: targetChars.value })
    benchmarkDoc.value = generated
    const chunks = sliceChunks(generated, chunkSize.value)

    await nextTick()
    const harness = harnessRef.value
    if (!harness) throw new Error('跑分宿主未就绪')

    for (let round = 0; round < rounds.value; round++) {
      // 交替顺序：偶数轮 markstream 先跑，奇数轮反过来，抵消固定顺序带来的预热偏差
      const order = round % 2 === 0 ? RENDERERS : [...RENDERERS].reverse()
      for (const renderer of order) {
        const metrics = await harness.runRound(renderer, chunks, chunkSize.value, autoScroll.value)
        runs.value = [...runs.value, metrics]
      }
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  } finally {
    running.value = false
    progress.value = null
  }
}

function stop() {
  harnessRef.value?.cancel()
}

async function previewDoc(renderer: RendererKey) {
  if (!benchmarkDoc.value) return
  running.value = true
  try {
    await nextTick()
    await harnessRef.value?.preview(renderer, benchmarkDoc.value)
  } finally {
    running.value = false
  }
}

function clearResults() {
  runs.value = []
  errorMessage.value = ''
}

function buildReport(): BenchmarkReport {
  return {
    generatedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    documentChars: benchmarkDoc.value.length,
    documentBytes: utf8Bytes(benchmarkDoc.value),
    rounds: rounds.value,
    chunkSize: chunkSize.value,
    autoScroll: autoScroll.value,
    runs: runs.value
  }
}

function exportJson() {
  const data = JSON.stringify(buildReport(), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `markdown-benchmark-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/*
 * URL 参数入口，便于反复复现同一组参数（也供自动化脚本调用）：
 *   ?size=102400&chunk=2000&rounds=1&virtual=1&scroll=1&autorun=1
 * 用 hash 路由的 query 承载，因此只在 hash 参数变化时生效，不会在页面内切换时丢失。
 * autorun=1 时挂载后自动开始跑分。
 */
function applyQueryParams(query: LocationQuery): boolean {
  const size = Number(query.size)
  if (Number.isFinite(size) && size > 0) targetChars.value = size
  const chunk = Number(query.chunk)
  if (Number.isFinite(chunk) && chunk > 0) chunkSize.value = chunk
  const roundCount = Number(query.rounds)
  if (Number.isFinite(roundCount) && roundCount > 0) rounds.value = roundCount
  if (query.virtual !== undefined) virtualization.value = String(query.virtual) !== '0'
  if (query.scroll !== undefined) autoScroll.value = String(query.scroll) !== '0'
  return String(query.autorun ?? '') === '1'
}

const route = useRoute()

// 只比较参数序列化结果，避免同一个 query 对象引用变化导致重复跑分
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
</script>
