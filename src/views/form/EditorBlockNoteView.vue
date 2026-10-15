<template>
  <PreviewSection
    title="BlockNote：React 子树桥接"
    description="BlockNote 原生面向 React，本页在 Vue 中挂载独立 React 子树；按钮调用公开 TableHandles 扩展，浮动菜单仍可正常使用。"
  >
    <div class="mb-3 flex items-center gap-2">
      <PreviewButton @click="rebuild">重建编辑器</PreviewButton>
      <span class="text-sm text-slate-500">{{ status }}</span>
    </div>
    <EditorBlockNote :key="editorKey" ref="editorRef" v-model="documentValue" />
  </PreviewSection>
</template>

<script lang="ts" setup>
import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
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
