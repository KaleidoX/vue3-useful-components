<template>
  <div
    class="flex items-center gap-3 border border-gray-200 rounded-lg bg-white px-4 py-3 shadow-sm"
  >
    <div
      :class="[
        'h-3 w-3 rounded-full flex-shrink-0',
        status === 'success'
          ? 'bg-green-500'
          : status === 'warning'
            ? 'bg-yellow-500'
            : 'bg-red-500'
      ]"
    />
    <div class="min-w-0 flex-1">
      <div class="truncate text-sm text-gray-900 font-semibold">{{ title }}</div>
      <div class="truncate text-xs text-gray-500">{{ subtitle }}</div>
    </div>
    <span
      :class="[
        'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
        status === 'success'
          ? 'bg-green-100 text-green-700'
          : status === 'warning'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
      ]"
    >
      {{ statusLabel }}
    </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  subtitle: string
  status: 'success' | 'warning' | 'danger'
  statusLabel: string
}>()
</script>
