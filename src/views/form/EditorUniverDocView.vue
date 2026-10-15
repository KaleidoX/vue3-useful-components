<template>
  <div class="space-y-8">
    <PreviewSection
      title="Univer — 文档"
      description="在线文档编辑器，支持协同编辑。需 react/react-dom 依赖。"
    >
      <EditorUniverDoc height="650px" />
    </PreviewSection>

    <section>
      <h3 class="mb-3 text-lg font-semibold">评估</h3>
      <EvaluationTable :rows="evalRows" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import PreviewSection from '@/views/components/PreviewSection.vue'
import EditorUniverDoc from '@/components/form/EditorUniverDoc/index.vue'
import EvaluationTable from './components/EvaluationTable.vue'

defineOptions({ name: 'EditorUniverDocView' })

const evalRows = [['Univer Doc', '★★★★', '★★★', '★', 'MIT', '★★★★★', '★★★★', '★★★★']]
</script>
