<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <PreviewSection
      title="完整模式：Quill Table Up"
      description="框选 A1:B2 后右键打开表格菜单，选择“合并单元格”；重建编辑器验证 HTML 回读后，可右键拆分。"
    >
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <PreviewButton @click="rebuildEditor">重建编辑器</PreviewButton>
        <span class="text-sm text-slate-500">{{ mergeStatus }}</span>
      </div>
      <EditorQuill
        :key="editorKey"
        ref="editorRef"
        v-model="content1"
        :height="editorHeight"
      />
    </PreviewSection>
    <PreviewSection title="简洁模式：保持无表格入口">
      <EditorQuill v-model="content2" :height="editorHeight" simple />
    </PreviewSection>
  </div>
</template>

<script lang="ts" setup>
import { usePreviewContentHeight } from '@/composables/usePreviewContentHeight'
import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
import EditorQuill from '@/components/form/EditorQuill/index.vue'
import TestContent from '@/views/form/assets/test.html?raw'
import { tableMergeFixtureHtml } from './fixtures/tableMergeFixture'

defineOptions({
  name: 'EditorQuillView'
})
const editorRef = ref<InstanceType<typeof EditorQuill>>()
const editorKey = ref(0)
const content1 = ref(tableMergeFixtureHtml)
const content2 = ref(TestContent)
const mergeStatus = computed(() =>
  /(?:rowspan|colspan)=["']2["']/.test(content1.value)
    ? '当前 HTML 已包含合并跨度'
    : '当前为 3×3 未合并表格'
)

function rebuildEditor() {
  content1.value = editorRef.value?.getContents() ?? content1.value
  editorKey.value += 1
}

const { width, contentHeight } = usePreviewContentHeight()

const editorHeight = computed(() => {
  const fullHeight = contentHeight.value - 60
  return width.value > 1024 ? fullHeight : Math.ceil((fullHeight - 4 * 10) / 2)
})
</script>
