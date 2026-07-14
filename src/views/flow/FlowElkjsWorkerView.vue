<script lang="ts" setup>
import FlowElkjsWorker from '@/components/flow/FlowElkjsWorker.vue'

defineOptions({
  name: 'FlowElkjsWorkerView'
})
</script>

<template>
  <main class="p-4 space-y-4 sm:p-6">
    <header>
      <h2 class="text-xl text-slate-900 font-bold">ELKJS Worker</h2>
      <p class="mt-1 text-sm text-slate-600">
        ELKJS 0.11.1 分层自动布局 · Web Worker 计算 · Vue Flow 渲染
      </p>
    </header>

    <div
      class="h-[calc(100dvh-210px)] min-h-120 overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm"
    >
      <FlowElkjsWorker />
    </div>
  </main>
</template>
