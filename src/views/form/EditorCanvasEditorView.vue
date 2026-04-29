<template>
  <div class="space-y-10">
    <section>
      <EditorCanvasEditor height="700px" :content="canvasContent" />
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorCanvasEditor from '@/components/form/EditorCanvasEditor/index.vue'
import EvaluationTable from './components/EvaluationTable.vue'
import TestHtml from './assets/test.html?raw'

defineOptions({ name: 'EditorCanvasEditorView' })

const canvasContent = TestHtml.split('\n').filter(l => l.trim()).slice(0, 10).map(line => ({
  value: line.replace(/<[^>]+>/g, '') || line
}))

const evalRows = [
  ['canvas-editor', '★★★★', '★★★', '★★★', 'MIT', '★★★★', '★★★', '★★★'],
]
</script>
