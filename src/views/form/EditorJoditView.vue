<template>
  <section class="p-10">
    <h2 class="mb-2 text-xl font-semibold">Jodit Core：内置表格操作</h2>
    <p class="mb-3 text-sm text-gray-600">
      可拖选单元格使用 Jodit 原生浮动菜单，也可用下方按钮稳定演示 A1:B2 合并；重建编辑器验证 HTML 回读后再拆分。
    </p>
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        @click="editorRef?.mergeSampleCells()"
      >
        合并 A1:B2
      </button>
      <button
        type="button"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        @click="editorRef?.splitSampleCell()"
      >
        拆分合并单元格
      </button>
      <button
        type="button"
        class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        @click="rebuildEditor"
      >
        重建编辑器
      </button>
      <span class="text-sm text-gray-500">{{ mergeStatus }}</span>
    </div>
    <EditorJodit :key="editorKey" ref="editorRef" v-model="content" :height="editorHeight" />
  </section>
</template>

<script lang="ts" setup>
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

const { height } = useWindowSize()
const editorHeight = computed(() => Math.max(320, height.value - 240))

function rebuildEditor() {
  content.value = editorRef.value?.getValue() ?? content.value
  editorKey.value += 1
}
</script>
