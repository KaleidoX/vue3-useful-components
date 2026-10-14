<template>
  <section class="grid grid-cols-1 gap-8 p-6 xl:grid-cols-2">
    <article class="space-y-4">
      <header>
        <h2 class="text-xl text-slate-900 font-semibold">完整模式 · 表格合并</h2>
        <p class="mt-2 text-sm text-slate-500 leading-6">
          在表格中拖动选中 A1:B2，使用浮动表格工具栏的“合并单元格”；选中合并后的单元格可再拆分。
        </p>
      </header>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-xl bg-primary px-3 py-2 text-sm text-white font-semibold"
          @click="loadFixture"
        >
          重置 3×3 表格
        </button>
        <button
          type="button"
          class="border border-slate-200 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 font-semibold"
          @click="rebuildEditor"
        >
          重建编辑器
        </button>
        <span class="text-xs text-slate-500" data-testid="tinymce-merge-status">
          {{ mergeStatus }}
        </span>
      </div>
      <EditorTinyMCE
        :key="fullEditorKey"
        ref="fullEditorRef"
        v-model="content1"
        :height="editorHeight"
      />
    </article>

    <article class="space-y-4">
      <header>
        <h2 class="text-xl text-slate-900 font-semibold">简洁模式 · 无表格入口</h2>
        <p class="mt-2 text-sm text-slate-500 leading-6">
          用于对照精简工具集；不会加载 table 插件，也不会出现合并或拆分按钮。
        </p>
      </header>
      <EditorTinyMCE v-model="content2" :height="editorHeight" simple />
    </article>
  </section>
</template>

<script lang="ts" setup>
import TestContent from '@/views/form/assets/test.html?raw'
import { tableMergeFixtureHtml } from './fixtures/tableMergeFixture'

defineOptions({
  name: 'EditorTinyMCEView'
})

interface TinyMCEExpose {
  getEditor: () => { getContent: () => string } | null
}

const fullEditorRef = ref<TinyMCEExpose>()
const fullEditorKey = ref(0)
const content1 = ref(tableMergeFixtureHtml)
const content2 = ref(TestContent)

const mergeStatus = computed(() =>
  /\b(?:rowspan|colspan)=["'](?:[2-9]|\d{2,})["']/i.test(content1.value)
    ? '输出已包含合并跨度；可点击“重建编辑器”验证回读。'
    : '当前输出为规则 3×3 表格。'
)

const loadFixture = () => {
  content1.value = tableMergeFixtureHtml
  fullEditorKey.value += 1
}

const rebuildEditor = () => {
  content1.value = fullEditorRef.value?.getEditor()?.getContent() ?? content1.value
  fullEditorKey.value += 1
}

const { width, height } = useWindowSize()

const safeAreaInsetTop = parseInt(
  document.documentElement.style.getPropertyValue('--safe-area-inset-top') || '0px'
)
const safeAreaInsetBottom = parseInt(
  document.documentElement.style.getPropertyValue('--safe-area-inset-bottom') || '0px'
)

const editorHeight = computed(() => {
  const fullHeight = height.value - (46 + 4 * 10 * 2 + safeAreaInsetTop + safeAreaInsetBottom)
  return width.value > 1280 ? fullHeight : Math.ceil((fullHeight - 4 * 10) / 2)
})
</script>
