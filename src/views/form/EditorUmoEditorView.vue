<template>
  <div class="p-6 space-y-10">
    <section>
      <h2 class="mb-4 text-2xl font-bold">Umo Editor — 文档编辑器</h2>
      <p class="mb-4 text-gray-500">基于 Vue3 + Tiptap3 的文档编辑器，类 Word 体验。MIT 开源。</p>
      <p class="mb-3 text-sm text-gray-600">
        在表格中选中 A1:B2，通过原生表格浮动菜单执行“合并单元格”；再重建编辑器验证 HTML
        回读，最后可执行“拆分单元格”。
      </p>
      <div class="mb-2 flex flex-wrap items-center gap-2">
        <SealTool @insert="onSealInsert" />
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          @click="rebuildEditor"
        >
          重建编辑器
        </button>
        <span class="text-sm text-gray-500">{{ mergeStatus }}</span>
      </div>
      <EditorUmoEditor
        :key="editorKey"
        ref="editorRef"
        v-model="content"
        height="calc(100vh - 250px)"
      />
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorUmoEditor from '@/components/form/EditorUmoEditor/index.vue'
import EvaluationTable from './components/EvaluationTable.vue'
import SealTool from '@/components/form/SealTool.vue'
import { tableMergeFixtureHtml } from './fixtures/tableMergeFixture'

defineOptions({ name: 'EditorUmoEditorView' })

const editorRef = ref<InstanceType<typeof EditorUmoEditor>>()
const content = ref(tableMergeFixtureHtml)
const editorKey = ref(0)
const mergeStatus = computed(() =>
  /(?:rowspan|colspan)=["']2["']/.test(content.value)
    ? '当前 HTML 已包含合并跨度'
    : '当前为 3×3 未合并表格'
)

function rebuildEditor() {
  content.value = editorRef.value?.getContent() ?? content.value
  editorKey.value += 1
}

function onSealInsert(data: { id: string; src: string; name: string; size: number }) {
  const editor = editorRef.value?.getEditor() as any
  if (!editor?.chain) return
  editor
    .chain()
    .focus()
    .setImage({
      id: data.id,
      type: 'seal',
      name: data.name,
      size: data.size,
      src: data.src,
      width: 150,
      draggable: true,
      rotatable: true,
      previewType: null
    })
    .run()
}

const evalRows = [['Umo Editor', '★★★★★', '★★★★★', '★★★', 'MIT', '★★★★★', '★★★★', '★★★★★']]
</script>
