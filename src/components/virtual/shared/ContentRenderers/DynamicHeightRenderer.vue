<script setup lang="ts">
import type { IListItem } from '../types'

interface Props {
  item: IListItem
}
defineProps<Props>()
</script>

<template>
  <div class="whitespace-pre-wrap leading-relaxed">{{ item.content }}</div>
</template>
