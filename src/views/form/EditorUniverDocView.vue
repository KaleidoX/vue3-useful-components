<template>
  <div class="p-6 space-y-10">
    <section>
      <h2 class="mb-4 text-2xl font-bold">Univer — 文档</h2>
      <p class="mb-4 text-gray-500">在线文档编辑器，支持协同编辑。需 react/react-dom 依赖。</p>
      <EditorUniverDoc height="650px" />
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorUniverDoc from '@/components/form/EditorUniverDoc.vue'
import EvaluationTable from './components/EvaluationTable.vue'

defineOptions({ name: 'EditorUniverDocView' })

const evalRows = [['Univer Doc', '★★★★', '★★★', '★', 'MIT', '★★★★★', '★★★★', '★★★★']]
</script>
