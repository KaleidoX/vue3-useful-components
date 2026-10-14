<template>
  <section class="p-10">
    <h2 class="mb-2 text-xl font-semibold">BlockNote：React 子树桥接</h2>
    <p class="mb-3 text-sm text-gray-600">
      BlockNote 原生面向 React，本页在 Vue 中挂载独立 React 子树；按钮调用公开 TableHandles 扩展，浮动菜单仍可正常使用。
    </p>
    <div class="mb-3 flex items-center gap-2">
      <button type="button" class="rounded border border-gray-300 px-3 py-1.5 text-sm" @click="rebuild">
        重建编辑器
      </button>
      <span class="text-sm text-gray-500">{{ status }}</span>
    </div>
    <EditorBlockNote :key="editorKey" ref="editorRef" v-model="documentValue" />
  </section>
</template>

<script lang="ts" setup>
import EditorBlockNote from '@/components/form/EditorBlockNote/index.vue'
import { blockNoteTableFixture } from '@/components/form/EditorBlockNote/blockNoteTableFixture'

defineOptions({ name: 'EditorBlockNoteView' })

const editorRef = ref<InstanceType<typeof EditorBlockNote>>()
const editorKey = ref(0)
const documentValue = ref(structuredClone(blockNoteTableFixture) as unknown[])
const status = computed(() =>
  /"colspan":2|"rowspan":2/.test(JSON.stringify(documentValue.value))
    ? '当前 BlockNote JSON 已包含合并跨度'
    : '当前为 3×3 未合并表格'
)

function rebuild() {
  documentValue.value = structuredClone(editorRef.value?.getDocument() ?? documentValue.value)
  editorKey.value += 1
}
</script>
