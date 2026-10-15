<template>
  <PreviewSection
    title="Lexical：原生表格节点"
    description="直接封装 Lexical 内核与 @lexical/table；合并结果保存在 Lexical EditorState JSON 中。"
  >
    <div class="mb-3 flex items-center gap-2">
      <PreviewButton @click="rebuild">重建编辑器</PreviewButton>
      <span class="text-sm text-slate-500">{{ status }}</span>
    </div>
    <EditorLexical :key="editorKey" ref="editorRef" v-model="serializedState" />
  </PreviewSection>
</template>

<script lang="ts" setup>
import PreviewSection from '@/views/components/PreviewSection.vue'
import PreviewButton from '@/views/components/PreviewButton.vue'
import EditorLexical from '@/components/form/EditorLexical/index.vue'

defineOptions({ name: 'EditorLexicalView' })

const editorRef = ref<InstanceType<typeof EditorLexical>>()
const editorKey = ref(0)
const serializedState = ref('')
const status = computed(() =>
  /"colSpan":2/.test(serializedState.value)
    ? '当前 JSON 已包含 2×2 合并跨度'
    : '当前为 3×3 未合并表格'
)

function rebuild() {
  serializedState.value = editorRef.value?.getJSON() ?? serializedState.value
  editorKey.value += 1
}
</script>
