<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <PreviewSection
      title="完整模式：官方 Table 插件"
      description="在表格中选中 A1:B2，通过浮动表格工具栏的“合并单元格”操作；随后重建编辑器验证 HTML 回读，并可从同一按钮拆分。"
    >
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <PreviewButton @click="rebuildEditor">重建编辑器</PreviewButton>
        <span class="text-sm text-slate-500">{{ mergeStatus }}</span>
      </div>
      <EditorCKEditor5
        :key="editorKey"
        ref="editorRef"
        v-model="content1"
        :height="editorHeight"
      />
    </PreviewSection>
    <PreviewSection title="简洁模式：保持无表格入口">
      <EditorCKEditor5 v-model="content2" :height="editorHeight" simple />
    </PreviewSection>
  </div>
</template>

<script lang="ts" setup>
import { usePreviewContentHeight } from '@/composables/usePreviewContentHeight'
import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
import EditorCKEditor5 from '@/components/form/EditorCKEditor5/index.vue'
import TestContent from '@/views/form/assets/test.html?raw'
import { tableMergeFixtureHtml } from './fixtures/tableMergeFixture'

defineOptions({
  name: 'EditorCKEditor5View'
})
const editorRef = ref<InstanceType<typeof EditorCKEditor5>>()
const editorKey = ref(0)
const content1 = ref(tableMergeFixtureHtml)
const content2 = ref(TestContent)
const mergeStatus = computed(() =>
  /(?:rowspan|colspan)=["']2["']/.test(content1.value)
    ? '当前 HTML 已包含合并跨度'
    : '当前为 3×3 未合并表格'
)

function rebuildEditor() {
  content1.value = editorRef.value?.getEditor()?.getData() ?? content1.value
  editorKey.value += 1
}

const { width, contentHeight } = usePreviewContentHeight()

const editorHeight = computed(() => {
  const fullHeight = contentHeight.value - 60
  return width.value > 1024 ? fullHeight : Math.ceil((fullHeight - 4 * 10) / 2)
})
</script>
