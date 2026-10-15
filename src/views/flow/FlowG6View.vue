<script setup lang="ts">
import FlowG6 from '@/components/flow/FlowG6.vue'
import EvaluationTable from '@/views/form/components/EvaluationTable.vue'

const flowHeaders = ['工具', '渲染', '功能', '性能', '开发难度', '可扩展', '体积', '许可']
const evalRows = [['G6 v5', 'Canvas·SVG·WebGL', '★★★', '★', '★★★', '★★★', '★★★', 'MIT']]
</script>

<template>
  <div class="space-y-8">
    <div>
      <div class="h-[var(--preview-content-height)] overflow-hidden border rounded-lg">
        <FlowG6 />
      </div>
    </div>
    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :headers="flowHeaders" :rows="evalRows" />
    </section>
  </div>
</template>
