<template>
  <div ref="containerRef" class="stream-markdown-pane">
    <Markdown
      :content="content"
      :mode="mode"
      :enable-animate="false"
      :is-dark="false"
      :completion="false"
      :extensions="extensions"
      @end="onEnd"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ExtensionOverrides } from 'vue-stream-markdown'

import { Markdown } from 'vue-stream-markdown'
import 'vue-stream-markdown/index.css'
import 'vue-stream-markdown/theme.css'

import { vsmCodeExtension, warmupVsmHighlight } from './highlight'

/**
 * vue-stream-markdown 的统一封装。
 *
 * 与 markstream 对齐的口径：关闭进入动画。
 *
 * completion 关闭：该库默认会在流式模式下「补全」未闭合语法（自动补 `**`、`)`、代码围栏等），
 * 而 markstream 没有对应行为。保持开方会让两边解析的文本长度与结构不同，失去可比性，
 * 因此显式关闭，两边都按原始未完成文本解析。
 *
 * codeHighlight 决定代码块是否装 shiki 高亮扩展：该库的高亮不在主包内，
 * 由独立的 @stream-markdown/code 提供，通过 `extensions.code` 注入；
 * 不注入时渲染为纯文本 <pre>。两边必须同时开启才可比。
 *
 * 终态信号：该库的 `end` 事件只在 mode='static' 时触发，因此推流结束需要把 mode 切到 static，
 * 由父组件负责切换。
 */
defineOptions({
  name: 'MarkdownBenchmarkStreamMarkdownPane'
})

const props = withDefaults(
  defineProps<{
    content: string
    mode?: 'streaming' | 'static'
    /** 代码块是否使用 shiki 语法高亮（开启动态加载 @stream-markdown/code） */
    codeHighlight?: boolean
  }>(),
  {
    mode: 'streaming',
    codeHighlight: false
  }
)

const emit = defineEmits<{ settled: [] }>()

const containerRef = ref<HTMLElement | null>(null)

/**
 * 高亮扩展来自单例预热模块：加载与预热只做一次，多轮跑分不重复付费。
 * codeHighlight 关闭时不注入 extensions，库即退化为纯文本代码块。
 */
const extensions = computed<ExtensionOverrides | undefined>(() => {
  if (!props.codeHighlight || !vsmCodeExtension.value) return undefined
  return { code: vsmCodeExtension.value }
})

// 开启高亮时无需等待：跑分前由 harness 统一调用 warmupHighlightEngines()
watch(
  () => props.codeHighlight,
  (enabled) => {
    if (enabled) void warmupVsmHighlight()
  },
  { immediate: true }
)

function onEnd() {
  if (props.mode !== 'static') return
  emit('settled')
}

defineExpose({
  getContainer: () => containerRef.value
})
</script>

<style scoped>
.stream-markdown-pane {
  height: 100%;
  overflow: auto;
}
</style>
