<script setup lang="ts">
import FlowVueFlow from '@/components/flow/FlowVueFlow.vue'
import EvaluationTable from '../form/components/EvaluationTable.vue'

const flowHeaders = ['工具', '渲染', '功能', '性能', '开发难度', '可扩展', '体积', '许可']

const evalRows = [['Vue Flow', 'SVG', '★★★★', '★★★★', '★★★★★', '★★★★', '★★★★', 'MIT']]
</script>

<template>
  <div class="space-y-8">
    <div class="h-[var(--preview-content-height)] overflow-hidden border rounded-lg">
      <FlowVueFlow />
    </div>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :headers="flowHeaders" :rows="evalRows" />
    </section>
  </div>
</template>
