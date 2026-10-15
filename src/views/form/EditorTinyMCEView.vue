<template>
  <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
    <PreviewSection
      title="完整模式 · 表格合并"
      description="在表格中拖动选中 A1:B2，使用浮动表格工具栏的“合并单元格”；选中合并后的单元格可再拆分。"
    >
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <PreviewButton variant="primary" @click="loadFixture">重置 3×3 表格</PreviewButton>
        <PreviewButton @click="rebuildEditor">重建编辑器</PreviewButton>
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
    </PreviewSection>

    <PreviewSection
      title="简洁模式 · 无表格入口"
      description="用于对照精简工具集；不会加载 table 插件，也不会出现合并或拆分按钮。"
    >
      <EditorTinyMCE v-model="content2" :height="editorHeight" simple />
    </PreviewSection>
  </section>
</template>

<script lang="ts" setup>
import { usePreviewContentHeight } from '@/composables/usePreviewContentHeight'
import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
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

const { width, contentHeight } = usePreviewContentHeight()

const editorHeight = computed(() => {
  const fullHeight = contentHeight.value - 60
  return width.value > 1280 ? fullHeight : Math.ceil((fullHeight - 4 * 10) / 2)
})
</script>
