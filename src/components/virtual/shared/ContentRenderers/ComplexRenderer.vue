<script setup lang="ts">
import type { IListItem } from '../types'

interface Props {
  item: IListItem
}
defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-3">
    <img
      :src="item.avatar"
      :alt="`avatar-${item.id}`"
      class="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200"
    />
    <div class="min-w-0 flex-1">
      <div class="truncate text-sm font-medium">{{ item.content }}</div>
      <div class="truncate text-xs text-gray-500">{{ item.description }}</div>
    </div>
    <ElButton size="small" class="flex-shrink-0">操作</ElButton>
  </div>
</template>
