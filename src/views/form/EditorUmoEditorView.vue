<template>
  <div class="p-6 space-y-10">
    <section>
      <h2 class="mb-4 text-2xl font-bold">Umo Editor — 文档编辑器</h2>
      <p class="mb-4 text-gray-500">基于 Vue3 + Tiptap3 的文档编辑器，类 Word 体验。MIT 开源。</p>
      <div class="mb-2 flex gap-2">
        <SealTool @insert="onSealInsert" />
      </div>
      <EditorUmoEditor ref="editorRef" v-model="content" height="calc(100vh - 250px)" />
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorUmoEditor from '@/components/form/EditorUmoEditor.vue'
import EvaluationTable from './components/EvaluationTable.vue'
import SealTool from '@/components/form/SealTool.vue'
import TestMd from './assets/test.md?raw'

defineOptions({ name: 'EditorUmoEditorView' })

const editorRef = ref<InstanceType<typeof EditorUmoEditor>>()
const content = ref(TestMd)

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
