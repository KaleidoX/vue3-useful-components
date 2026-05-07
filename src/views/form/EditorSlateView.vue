<template>
  <div class="space-y-10">
    <section>
      <EditorSlate ref="editorRef" v-model="content" height="400px" />
    </section>

    <section v-if="content.length > 0" class="border rounded bg-gray-50 p-4">
      <h3 class="mb-2 text-sm font-semibold">输出 (JSON)</h3>
      <pre class="whitespace-pre-wrap text-xs">{{ JSON.stringify(content, null, 2) }}</pre>
    </section>

    <section class="border rounded bg-gray-50 p-4">
      <h3 class="mb-2 text-sm font-semibold">输出 (HTML)</h3>
      <pre class="whitespace-pre-wrap text-xs">{{ htmlOutput }}</pre>
    </section>

    <section class="border rounded bg-gray-50 p-4">
      <h3 class="mb-2 text-sm font-semibold">输出 (Markdown)</h3>
      <pre class="whitespace-pre-wrap text-xs">{{ mdOutput }}</pre>
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorSlate from '@/components/form/EditorSlate.vue'
import EvaluationTable from './components/EvaluationTable.vue'
import TestHtml from './assets/test.html?raw'

defineOptions({ name: 'EditorSlateView' })

const slateInitial = TestHtml.split(/\n\s*\n/).filter(s => s.trim()).slice(1, 6).map(text => ({
  type: 'paragraph' as const,
  children: [{ text: text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 200) }]
}))

const content = ref<any[]>(slateInitial)
const editorRef = ref<InstanceType<typeof EditorSlate>>()

const htmlOutput = computed(() => editorRef.value?.getHTML?.() ?? '')
const mdOutput = computed(() => editorRef.value?.getMarkdown?.() ?? '')

const evalRows = [
  ['Slate.js', '★★★★', '★★', '★★★★', 'MIT', '★★★', '★★★★★', '★★★'],
]
</script>
