<template>
  <div class="p-6 space-y-10">
    <section>
      <h2 class="mb-4 text-2xl font-bold">SheetJS — 电子表格</h2>
      <p class="mb-4 text-gray-500">轻量级电子表格读写库，支持 xlsx/csv 等格式导入导出。</p>
      <EditorSheetJS />
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorSheetJS from '@/components/form/EditorSheetJS.vue'
import EvaluationTable from './components/EvaluationTable.vue'

defineOptions({ name: 'EditorSheetJSView' })

const evalRows = [['SheetJS', '★★★', '★★★★', '★★★★★', 'Apache2', '★★★', '★★★★★', '★★★']]
</script>
