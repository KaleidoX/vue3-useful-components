<script setup lang="ts">
import FlowKonva from '@/components/flow/FlowKonva.vue'
import EvaluationTable from '@/views/form/components/EvaluationTable.vue'

const flowHeaders = ['工具', '渲染', '功能', '性能', '开发难度', '可扩展', '体积', '许可']
const evalRows = [['Konva.js', 'Canvas 2D', '★★', '★★', '★★', '★★★★★', '★★★★★', 'MIT']]
</script>

<template>
  <div class="p-4 space-y-8">
    <div>
      <h2 class="mb-4 text-xl font-bold">Konva.js — Canvas 引擎（声明式图层 · 自建编辑器）</h2>
      <div class="h-[calc(100vh-300px)] overflow-hidden border rounded-lg">
        <FlowKonva />
      </div>
    </div>
    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :headers="flowHeaders" :rows="evalRows" />
    </section>
  </div>
</template>
