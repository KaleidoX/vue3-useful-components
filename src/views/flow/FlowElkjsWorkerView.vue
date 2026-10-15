<script lang="ts" setup>
import FlowElkjsWorker from '@/components/flow/FlowElkjsWorker.vue'

defineOptions({
  name: 'FlowElkjsWorkerView'
})
</script>

<template>
  <main class="space-y-4">
    <header>
      <p class="mt-1 text-sm text-slate-600">
        ELKJS 0.11.1 分层自动布局 · Web Worker 计算 · Vue Flow 渲染
      </p>
    </header>

    <div
      class="h-[var(--preview-content-height)] min-h-120 overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm"
    >
      <FlowElkjsWorker />
    </div>
  </main>
</template>
