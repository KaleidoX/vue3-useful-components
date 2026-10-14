<template>
  <section class="p-10">
    <h2 class="mb-2 text-xl font-semibold">Lexical：原生表格节点</h2>
    <p class="mb-3 text-sm text-gray-600">
      直接封装 Lexical 内核与 @lexical/table；合并结果保存在 Lexical EditorState JSON 中。
    </p>
    <div class="mb-3 flex items-center gap-2">
      <button type="button" class="rounded border border-gray-300 px-3 py-1.5 text-sm" @click="rebuild">
        重建编辑器
      </button>
      <span class="text-sm text-gray-500">{{ status }}</span>
    </div>
    <EditorLexical :key="editorKey" ref="editorRef" v-model="serializedState" />
  </section>
</template>

<script lang="ts" setup>
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
