<script setup lang="ts">
import type { IListItem } from '../types'

interface Props {
  item: IListItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:checked': [id: number, checked: boolean]
}>()

const localChecked = ref(props.item.checked)

watch(
  () => props.item.checked,
  (val) => {
    localChecked.value = val
  }
)

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:checked', props.item.id, target.checked)
}
</script>

<template>
  <label class="flex cursor-pointer items-center gap-2">
    <input type="checkbox" :checked="localChecked" class="h-4 w-4" @change="handleChange" />
    <span class="truncate">{{ item.content }}</span>
  </label>
</template>
