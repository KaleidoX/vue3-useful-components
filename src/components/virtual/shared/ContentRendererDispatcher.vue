<script setup lang="ts">
import type { IListItem } from './types'
import PlainTextRenderer from './ContentRenderers/PlainTextRenderer.vue'
import ElCheckboxRenderer from './ContentRenderers/ElCheckboxRenderer.vue'
import NativeCheckboxRenderer from './ContentRenderers/NativeCheckboxRenderer.vue'
import ComplexRenderer from './ContentRenderers/ComplexRenderer.vue'
import DynamicHeightRenderer from './ContentRenderers/DynamicHeightRenderer.vue'

interface Props {
  item: IListItem
  contentType: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:checked': [id: number, checked: boolean]
}>()

function onCheckedUpdate(id: number, checked: boolean) {
  emit('update:checked', id, checked)
}
</script>

<template>
  <PlainTextRenderer v-if="contentType === 'plain'" :item="item" />
  <ElCheckboxRenderer
    v-else-if="contentType === 'el-checkbox'"
    :item="item"
    @update:checked="onCheckedUpdate"
  />
  <NativeCheckboxRenderer
    v-else-if="contentType === 'native-checkbox'"
    :item="item"
    @update:checked="onCheckedUpdate"
  />
  <ComplexRenderer v-else-if="contentType === 'complex'" :item="item" />
  <DynamicHeightRenderer v-else :item="item" />
</template>
