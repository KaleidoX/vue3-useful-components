<template>
  <div ref="containerRef" class="stream-markdown-pane">
    <Markdown
      :content="content"
      :mode="mode"
      :enable-animate="false"
      :is-dark="false"
      :completion="false"
      @end="onEnd"
    />
  </div>
</template>

<script lang="ts" setup>
import { Markdown } from 'vue-stream-markdown'
import 'vue-stream-markdown/index.css'
import 'vue-stream-markdown/theme.css'

/**
 * vue-stream-markdown 的统一封装。
 *
 * 与 markstream 对齐的口径：关闭进入动画。
 *
 * completion 关闭：该库默认会在流式模式下「补全」未闭合语法（自动补 `**`、`)`、代码围栏等），
 * 而 markstream 没有对应行为。保持开方会让两边解析的文本长度与结构不同，失去可比性，
 * 因此显式关闭，两边都按原始未完成文本解析。
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
  }>(),
  {
    mode: 'streaming'
  }
)

const emit = defineEmits<{ settled: [] }>()

const containerRef = ref<HTMLElement | null>(null)

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
