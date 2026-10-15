<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <PreviewSection title="完整模式：当前 Markdown 契约受限">
      <p class="mb-3 text-sm text-amber-700">底层 ProseMirror 表格能在运行时合并单元格，但 GFM Markdown 不保存 rowspan/colspan；销毁重建会丢失合并语义，因此本页不会开放合并按钮。</p>
      <EditorMilkdown v-model="content1" :height="editorHeight" />
    </PreviewSection>
    <PreviewSection title="简洁模式：CommonMark">
      <EditorMilkdown v-model="content2" :height="editorHeight" simple />
    </PreviewSection>
  </div>
</template>

<script lang="ts" setup>
import { usePreviewContentHeight } from '@/composables/usePreviewContentHeight'
import PreviewSection from '@/views/components/PreviewSection.vue'
import EditorMilkdown from '@/components/form/EditorMilkdown/index.vue'

import TestContent from '@/views/form/assets/test.md?raw'
import { tableMergeFixtureMarkdown } from './fixtures/tableMergeFixture'

defineOptions({
  name: 'EditorMilkdownView'
})
const content1 = ref(tableMergeFixtureMarkdown)
const content2 = ref(TestContent)

const { width, contentHeight } = usePreviewContentHeight()

const editorHeight = computed(() => {
  const fullHeight = contentHeight.value - 60
  return width.value > 1024 ? fullHeight : Math.ceil((fullHeight - 4 * 10) / 2)
})
</script>
