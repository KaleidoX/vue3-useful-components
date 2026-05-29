<script setup lang="ts">
import type { IListItem } from '../types'

interface Props {
  item: IListItem
}
defineProps<Props>()
</script>

<template>
  <span class="block truncate">{{ item.content }}</span>
</template>
