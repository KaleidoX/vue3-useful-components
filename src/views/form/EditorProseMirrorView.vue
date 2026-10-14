<template>
  <section class="p-10">
    <h2 class="mb-2 text-xl font-semibold">ProseMirror：原始表格基线</h2>
    <p class="mb-3 text-sm text-gray-600">
      直接组合 prosemirror-tables，不经过 Tiptap 等上层封装；合并后重建以验证 JSON 回读。
    </p>
    <div class="mb-3 flex items-center gap-2">
      <button type="button" class="rounded border border-gray-300 px-3 py-1.5 text-sm" @click="rebuild">
        重建编辑器
      </button>
      <span class="text-sm text-gray-500">{{ status }}</span>
    </div>
    <EditorProseMirror :key="editorKey" ref="editorRef" v-model="documentValue" />
  </section>
</template>

<script lang="ts" setup>
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
