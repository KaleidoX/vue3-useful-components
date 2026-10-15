<template>
  <div class="space-y-8">
    <PreviewSection
      title="Canvas Editor — 表格合并"
      description="在画布中拖动选中 A1:B2，再点击顶部“合并”；选中合并单元格后点击“拆分”。"
    >
      <div class="mb-3 flex flex-wrap items-center gap-3">
        <PreviewButton variant="primary" @click="rebuildEditor">导出并重建编辑器</PreviewButton>
        <span class="text-xs text-slate-500">{{ mergeStatus }}</span>
      </div>
      <EditorCanvasEditor
        :key="editorKey"
        ref="editorRef"
        height="700px"
        :content="canvasContent"
      />
    </PreviewSection>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import type { IElement } from '@hufe921/canvas-editor'

import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
import EditorCanvasEditor from '@/components/form/EditorCanvasEditor/index.vue'
import { createCanvasTableMergeFixture } from '@/components/form/EditorCanvasEditor/canvasTableMergeFixture'
import EvaluationTable from './components/EvaluationTable.vue'

defineOptions({ name: 'EditorCanvasEditorView' })

interface CanvasEditorExpose {
  getEditor: () => {
    command: { getValue: () => { data: { main: IElement[] } } }
  } | null
}

const editorRef = ref<CanvasEditorExpose>()
const editorKey = ref(0)
const canvasContent = ref<IElement[]>(createCanvasTableMergeFixture())

const mergeStatus = computed(() => {
  const cells = canvasContent.value.flatMap(
    (element) => element.trList?.flatMap((row) => row.tdList) ?? []
  )
  return cells.some((cell) => cell.rowspan > 1 || cell.colspan > 1)
    ? '导出的原生 JSON 已保留合并跨度。'
    : '当前导出基线为规则 3×3 表格。'
})

const rebuildEditor = () => {
  const result = editorRef.value?.getEditor()?.command.getValue()
  if (!result) return
  canvasContent.value = structuredClone(result.data.main)
  editorKey.value += 1
}

const evalRows = [['canvas-editor', '★★★★', '★★★', '★★★', 'MIT', '★★★★', '★★★', '★★★']]
</script>
