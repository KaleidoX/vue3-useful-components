<script setup lang="ts">
import FlowLogicFlow from '@/components/flow/FlowLogicFlow.vue'
import EvaluationTable from '../form/components/EvaluationTable.vue'

const flowHeaders = ['工具', '渲染', '功能', '性能', '开发难度', '可扩展', '体积', '许可']

const evalRows = [['LogicFlow', 'SVG', '★★★★', '★★★', '★★★', '★★★★', '★★★', 'Apache-2.0']]
</script>

<template>
  <div class="p-4 space-y-8">
    <h2 class="text-xl font-bold">LogicFlow — SVG 编辑器（自执行引擎 · BPMN）</h2>
    <div class="h-[calc(100vh-300px)] overflow-hidden border rounded-lg">
      <FlowLogicFlow />
    </div>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :headers="flowHeaders" :rows="evalRows" />
    </section>
  </div>
</template>
