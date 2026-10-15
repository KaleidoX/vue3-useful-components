<template>
  <PreviewSection
    title="Jodit Core：内置表格操作"
    description="可拖选单元格使用 Jodit 原生浮动菜单，也可用下方按钮稳定演示 A1:B2 合并；重建编辑器验证 HTML 回读后再拆分。"
  >
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <PreviewButton @click="editorRef?.mergeSampleCells()">合并 A1:B2</PreviewButton>
      <PreviewButton @click="editorRef?.splitSampleCell()">拆分合并单元格</PreviewButton>
      <PreviewButton @click="rebuildEditor">重建编辑器</PreviewButton>
      <span class="text-sm text-slate-500">{{ mergeStatus }}</span>
    </div>
    <EditorJodit :key="editorKey" ref="editorRef" v-model="content" :height="editorHeight" />
  </PreviewSection>
</template>

<script lang="ts" setup>
import { usePreviewContentHeight } from '@/composables/usePreviewContentHeight'
import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
import EditorJodit from '@/components/form/EditorJodit/index.vue'
import { tableMergeFixtureHtml } from './fixtures/tableMergeFixture'

defineOptions({ name: 'EditorJoditView' })

const editorRef = ref<InstanceType<typeof EditorJodit>>()
const editorKey = ref(0)
const content = ref(tableMergeFixtureHtml)
const mergeStatus = computed(() =>
  /(?:rowspan|colspan)=["']2["']/.test(content.value)
    ? '当前 HTML 已包含合并跨度'
    : '当前为 3×3 未合并表格'
)

const { editorHeight } = usePreviewContentHeight(100)

function rebuildEditor() {
  content.value = editorRef.value?.getValue() ?? content.value
  editorKey.value += 1
}
</script>
