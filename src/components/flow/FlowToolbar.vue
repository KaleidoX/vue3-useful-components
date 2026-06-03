<template>
  <div class="absolute left-2 top-2 z-20 flex items-center gap-1 rounded bg-white/90 px-2 py-1 shadow">
    <button
      :class="[
        'px-2 py-0.5 text-xs rounded transition-colors',
        mode === 'simple' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
      ]"
      @click="$emit('update:mode', 'simple')"
    >
      简单节点
    </button>
    <button
      :class="[
        'px-2 py-0.5 text-xs rounded transition-colors',
        mode === 'complex' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
      ]"
      @click="$emit('update:mode', 'complex')"
    >
      复杂节点
    </button>
    <template v-if="mode === 'simple'">
      <span class="mx-1 text-xs text-gray-300">|</span>
      <button
        v-for="n in counts"
        :key="n"
        :class="[
          'px-2 py-0.5 text-xs rounded transition-colors',
          nodeCount === n ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
        ]"
        @click="$emit('update:nodeCount', n)"
      >
        {{ n }}
      </button>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { FlowMode } from './composables/useFlowData'

withDefaults(
  defineProps<{
    mode: FlowMode
    nodeCount: number
    counts?: number[]
  }>(),
  {
    counts: () => [10, 50, 100, 500],
  }
)

defineEmits<{
  'update:mode': [value: FlowMode]
  'update:nodeCount': [value: number]
}>()
</script>
