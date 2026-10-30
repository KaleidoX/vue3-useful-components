<template>
  <div ref="containerRef" class="markstream-pane">
    <MarkdownRender
      :content="content"
      :final="final"
      :fade="false"
      :typewriter="false"
      :show-tooltips="false"
      :is-dark="false"
      :viewport-priority="virtualization"
      :defer-nodes-until-visible="virtualization"
      :batch-rendering="virtualization"
      :node-virtual="virtualization ? 'auto' : false"
      :render-code-blocks-as-pre="!codeHighlight"
      :smooth-streaming="false"
      @render-final="onRenderFinal"
    />
  </div>
</template>

<script lang="ts" setup>
import MarkdownRender from 'markstream-vue'
import 'markstream-vue/index.css'

/**
 * markstream-vue 的统一封装。
 *
 * 与对照库保持同等条件的部分：关闭淡入动画、打字机光标与悬浮提示。
 *
 * codeHighlight 决定代码块走哪条渲染路径：关闭时强制 `render-code-blocks-as-pre`，
 * 即无高亮的纯 <pre>；开启时交给库自带的 CodeBlockNode，其内部会动态
 * `import('stream-diffs/markstream')` 再 `import('@pierre/diffs')` 用 shiki 出 token。
 * 注意这条路径不是「同样内容换个颜色」，而是换成了 pierre 的虚拟化代码渲染器，
 * 节点数与布局成本都会随之变化，所以对照两边必须同时开启才有可比性。
 *
 * virtualization 开关控制该库自带的视口优先、延迟挂载、批处理渲染与节点虚拟化：
 * 默认开启（库的出厂行为），关闭后即为「一次性渲染全部节点」的基线口径。
 */
defineOptions({
  name: 'MarkdownBenchmarkMarkstreamPane'
})

const props = withDefaults(
  defineProps<{
    content: string
    final: boolean
    virtualization?: boolean
    /** 代码块是否使用 shiki 语法高亮（需 stream-diffs 已安装并预热） */
    codeHighlight?: boolean
  }>(),
  {
    virtualization: true,
    codeHighlight: false
  }
)

const emit = defineEmits<{ settled: [] }>()

const containerRef = ref<HTMLElement | null>(null)

function onRenderFinal() {
  if (!props.final) return
  emit('settled')
}

defineExpose({
  getContainer: () => containerRef.value
})
</script>

<style scoped>
/*
 * markstream 的 index.css 里有若干未限定作用域的选择器（.container / .dark 等），
 * 本页用独立类名承载容器，不复用这些通用类，避免与项目样式互相污染。
 */
.markstream-pane {
  height: 100%;
  overflow: auto;
}
</style>
