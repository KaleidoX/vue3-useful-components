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
  },
)

function handleChange(val: string | number | boolean) {
  emit('update:checked', props.item.id, Boolean(val))
}
</script>

<template>
  <ElCheckbox :model-value="localChecked" @change="handleChange">
    <span class="truncate">{{ item.content }}</span>
  </ElCheckbox>
</template>
