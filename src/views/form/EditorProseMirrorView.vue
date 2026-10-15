<template>
  <PreviewSection
    title="ProseMirror：原始表格基线"
    description="直接组合 prosemirror-tables，不经过 Tiptap 等上层封装；合并后重建以验证 JSON 回读。"
  >
    <div class="mb-3 flex items-center gap-2">
      <PreviewButton @click="rebuild">重建编辑器</PreviewButton>
      <span class="text-sm text-slate-500">{{ status }}</span>
    </div>
    <EditorProseMirror :key="editorKey" ref="editorRef" v-model="documentValue" />
  </PreviewSection>
</template>

<script lang="ts" setup>
import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
import EditorProseMirror from '@/components/form/EditorProseMirror/index.vue'
import { prosemirrorTableFixture } from '@/components/form/EditorProseMirror/prosemirrorTable'

defineOptions({ name: 'EditorProseMirrorView' })

const editorRef = ref<InstanceType<typeof EditorProseMirror>>()
const editorKey = ref(0)
const documentValue = ref(structuredClone(prosemirrorTableFixture) as Record<string, unknown>)
const status = computed(() =>
  JSON.stringify(documentValue.value).includes('"colspan":2')
    ? '当前 JSON 已包含 2×2 合并跨度'
    : '当前为 3×3 未合并表格'
)

function rebuild() {
  documentValue.value = structuredClone(editorRef.value?.getJSON() ?? documentValue.value)
  editorKey.value += 1
}
</script>
