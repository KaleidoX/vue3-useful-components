<template>
  <div class="p-6 space-y-10">
    <section>
      <h2 class="mb-4 text-2xl font-bold">格式转换/生成工具</h2>
      <p class="mb-4 text-gray-500">mammoth.js — .docx 导入预览；docx — 内容导出为 .docx。</p>

      <div class="grid gap-8 lg:grid-cols-2">
        <div class="border rounded p-4">
          <h3 class="mb-3 text-lg font-semibold">.docx → HTML</h3>
          <input type="file" accept=".docx" class="mb-3 block" @change="handleDocxImport" />
          <div v-if="loading" class="text-gray-400">转换中...</div>
          <div v-if="error" class="text-red-500">{{ error }}</div>
          <div v-if="htmlResult" class="prose max-w-none border-t pt-3" v-html="htmlResult" />
        </div>
        <div class="border rounded p-4">
          <h3 class="mb-3 text-lg font-semibold">内容 → .docx</h3>
          <textarea v-model="exportText" class="mb-3 w-full border rounded p-2" rows="6" placeholder="输入文本，每行一个段落" />
          <button class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" @click="handleDocxExport">
            生成并下载 .docx
          </button>
        </div>
      </div>
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import { convertDocxToHtml } from '@/utils/mammoth'
import { generateDocx } from '@/utils/docx'
import TestHtml from './assets/test.html?raw'
import EvaluationTable from './components/EvaluationTable.vue'

defineOptions({ name: 'EditorConversionView' })

const htmlResult = ref('')
const loading = ref(false)
const error = ref('')
const exportText = ref(TestHtml)

const evalRows = [
  ['mammoth.js', '★★★', '★★★★★', '★★★★★', 'MIT', '★★★', '★★', '★★★★'],
  ['docx', '★★★★', '★★★★★', '★★★★', 'MIT', '★★★★', '★★★', '★★★★'],
]

async function handleDocxImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  loading.value = true
  error.value = ''
  htmlResult.value = ''
  try {
    htmlResult.value = await convertDocxToHtml(file)
  } catch (err) {
    error.value = `转换失败: ${(err as Error).message}`
  } finally {
    loading.value = false
  }
}

async function handleDocxExport() {
  await generateDocx(exportText.value, 'document.docx')
}
</script>
