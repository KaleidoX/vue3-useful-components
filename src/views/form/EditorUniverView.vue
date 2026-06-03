<template>
  <div class="p-6 space-y-10">
    <section>
      <h2 class="mb-4 text-2xl font-bold">Univer — 电子表格</h2>
      <p class="mb-4 text-gray-500">
        完整在线电子表格，支持公式、图表、条件格式等。需 react/react-dom 依赖。
      </p>
      <EditorUniverSheet height="650px" />
    </section>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import EditorUniverSheet from '@/components/form/EditorUniverSheet.vue'
import EvaluationTable from './components/EvaluationTable.vue'

defineOptions({ name: 'EditorUniverView' })

const evalRows = [['Univer Sheet', '★★★★★', '★★★', '★', 'MIT', '★★★★★', '★★★★', '★★★★']]
</script>
