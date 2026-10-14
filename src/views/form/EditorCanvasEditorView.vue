<template>
  <div class="space-y-10">
    <section class="space-y-4">
      <header>
        <h2 class="text-2xl font-bold">Canvas Editor — 表格合并</h2>
        <p class="mt-2 text-sm text-slate-500 leading-6">
          在画布中拖动选中 A1:B2，再点击顶部“合并”；选中合并单元格后点击“拆分”。
        </p>
      </header>
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="rounded-xl bg-primary px-3 py-2 text-sm text-white font-semibold"
          @click="rebuildEditor"
        >
          导出并重建编辑器
        </button>
        <span class="text-xs text-slate-500">{{ mergeStatus }}</span>
      </div>
      <EditorCanvasEditor
        :key="editorKey"
        ref="editorRef"
        height="700px"
        :content="canvasContent"
      />
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import type { IElement } from '@hufe921/canvas-editor'

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
