<template>
  <div class="benchmark-harness">
    <div
      ref="viewportRef"
      class="h-[var(--preview-content-height,420px)] min-h-[320px] overflow-hidden border border-base-400 rounded-xl border-solid bg-white p-3"
    >
      <!-- 被测渲染器同时只挂载一个：两个库并存时主线程耗时无法归因 -->
      <MarkstreamPane
        v-if="activeKey === 'markstream-vue'"
        ref="markstreamRef"
        :content="content"
        :final="final"
        :virtualization="virtualization"
        class="h-full"
      />
      <StreamMarkdownPane
        v-else-if="activeKey === 'vue-stream-markdown'"
        ref="streamMarkdownRef"
        :content="content"
        :mode="vsmMode"
        class="h-full"
      />
      <div v-else class="h-full flex items-center justify-center text-sm text-slate-400">
        {{ idleHint }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import MarkstreamPane from './MarkstreamPane.vue'
import StreamMarkdownPane from './StreamMarkdownPane.vue'
import { runBenchmarkRound } from './runner'
import type { RendererKey, RunMetrics } from './metrics'
import { afterPaint } from './metrics'

/**
 * 基准跑分的挂载宿主：负责按库切换被测渲染器，并把「挂载 / 推流 / 终态 / 卸载」
 * 这组动作翻译成引擎需要的回调。指标计算、轮次调度与结果展示都不在这里。
 */
defineOptions({
  name: 'MarkdownBenchmarkHarness'
})

withDefaults(
  defineProps<{
    idleHint?: string
    /** 传给 markstream 的虚拟化开关；关闭即为一次性渲染全部节点的基线口径 */
    virtualization?: boolean
  }>(),
  {
    idleHint: '点击「开始跑分」后，流式渲染将在此处逐片推进',
    virtualization: true
  }
)

const emit = defineEmits<{
  progress: [payload: { renderer: RendererKey; done: number; total: number }]
  sample: [payload: { renderer: RendererKey; metrics: Partial<RunMetrics> }]
}>()

const activeKey = ref<RendererKey | null>(null)
const content = ref('')
const final = ref(false)
const vsmMode = ref<'streaming' | 'static'>('streaming')

const markstreamRef = ref<InstanceType<typeof MarkstreamPane> | null>(null)
const streamMarkdownRef = ref<InstanceType<typeof StreamMarkdownPane> | null>(null)
const viewportRef = ref<HTMLElement | null>(null)

let abortController: AbortController | null = null

async function runRound(
  renderer: RendererKey,
  chunks: string[],
  chunkSize: number,
  autoScroll = false
): Promise<RunMetrics> {
  abortController = new AbortController()
  const { signal } = abortController

  const getContainer = (): HTMLElement | null | undefined => {
    if (renderer === 'markstream-vue') return markstreamRef.value?.getContainer()
    return streamMarkdownRef.value?.getContainer()
  }

  try {
    return await runBenchmarkRound({
      renderer,
      chunks,
      chunkSize,
      autoScroll,
      signal,
      mount: async () => {
        // 每轮从空内容、非终态开始，保证两库起点一致
        content.value = ''
        final.value = false
        vsmMode.value = 'streaming'
        activeKey.value = renderer
        await nextTick()
        return { getContainer }
      },
      update: async (next: string) => {
        content.value = next
        await nextTick()
      },
      applyFinal: async () => {
        if (renderer === 'markstream-vue') {
          final.value = true
        } else {
          vsmMode.value = 'static'
        }
        await nextTick()
      },
      unmount: async () => {
        activeKey.value = null
        await nextTick()
        await afterPaint()
      },
      onProgress: (done, total) => emit('progress', { renderer, done, total }),
      onSample: (metrics) => emit('sample', { renderer, metrics })
    })
  } finally {
    abortController = null
  }
}

function cancel() {
  abortController?.abort()
}
/** 跑完后把某库的完整文档留在页面上，便于肉眼检查渲染结果 */
async function preview(renderer: RendererKey, document: string) {
  content.value = document
  final.value = renderer === 'markstream-vue'
  vsmMode.value = renderer === 'vue-stream-markdown' ? 'static' : 'streaming'
  activeKey.value = renderer
  await nextTick()
}

async function clear() {
  activeKey.value = null
  await nextTick()
}

defineExpose({ runRound, preview, clear, cancel })
</script>
