<template>
  <div class="space-y-8">
    <PreviewSection
      title="自定义 JSON 表格模型"
      description="拖选 A1:B2 后点击工具栏“合并单元格”；合并跨度写入主格，被覆盖单元格仍保留在 JSON，拆分后可原样恢复。"
    >
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <PreviewButton @click="rebuildEditor">重建编辑器</PreviewButton>
        <span class="text-sm text-slate-500">{{ mergeStatus }}</span>
      </div>
      <EditorSlate :key="editorKey" ref="editorRef" v-model="content" height="400px" />
    </PreviewSection>

    <section v-if="content.length > 0" class="border rounded bg-gray-50 p-4">
      <h3 class="mb-2 text-sm font-semibold">输出 (JSON)</h3>
      <pre class="whitespace-pre-wrap text-xs">{{ JSON.stringify(content, null, 2) }}</pre>
    </section>

    <section class="border rounded bg-gray-50 p-4">
      <h3 class="mb-2 text-sm font-semibold">输出 (HTML)</h3>
      <pre class="whitespace-pre-wrap text-xs">{{ htmlOutput }}</pre>
    </section>

    <section class="border rounded bg-gray-50 p-4">
      <h3 class="mb-2 text-sm font-semibold">输出 (Markdown)</h3>
      <pre class="whitespace-pre-wrap text-xs">{{ mdOutput }}</pre>
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
import EditorSlate from '@/components/form/EditorSlate/index.vue'
import { createTableFromRows } from '@/components/form/EditorSlate/plugins/withTables'
import EvaluationTable from './components/EvaluationTable.vue'
import { tableMergeFixture } from './fixtures/tableMergeFixture'

defineOptions({ name: 'EditorSlateView' })

const editorKey = ref(0)
const content = ref<any[]>([createTableFromRows(tableMergeFixture.rows)])
const editorRef = ref<InstanceType<typeof EditorSlate>>()
const mergeStatus = computed(() => {
  const firstCell = content.value[0]?.children?.[0]?.children?.[0]
  return firstCell?.rowspan === 2 && firstCell?.colspan === 2
    ? '当前 JSON 已包含 2×2 合并跨度'
    : '当前为 3×3 未合并表格'
})

async function rebuildEditor() {
  content.value = JSON.parse(JSON.stringify(content.value))
  editorRef.value?.prepareForRemount()
  await nextTick()
  editorKey.value += 1
}

const htmlOutput = computed(() => editorRef.value?.getHTML?.() ?? '')
const mdOutput = computed(() => editorRef.value?.getMarkdown?.() ?? '')

const evalRows = [['Slate.js', '★★★★', '★★', '★★★★', 'MIT', '★★★', '★★★★★', '★★★']]
</script>
