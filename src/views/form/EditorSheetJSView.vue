<template>
  <div class="space-y-8">
    <PreviewSection
      title="SheetJS — 电子表格"
      description="轻量级电子表格读写库，支持 xlsx/csv 等格式导入导出。"
    >
      <EditorSheetJS />
    </PreviewSection>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import PreviewSection from '@/views/components/PreviewSection.vue'
import EditorSheetJS from '@/components/form/EditorSheetJS/index.vue'
import EvaluationTable from './components/EvaluationTable.vue'

defineOptions({ name: 'EditorSheetJSView' })

const evalRows = [['SheetJS', '★★★', '★★★★', '★★★★★', 'Apache2', '★★★', '★★★★★', '★★★']]
</script>
