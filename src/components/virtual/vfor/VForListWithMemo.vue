<script setup lang="ts">
import type { IListItem } from '../shared/types'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  data: IListItem[]
  contentType: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:checked': [id: number, checked: boolean]
}>()

function handleCheckedUpdate(id: number, checked: boolean) {
  emit('update:checked', id, checked)
}
</script>

<template>
  <div ref="containerRef" class="h-128 overflow-y-auto border border-gray-200 rounded">
    <div
      v-for="item in data"
      :key="item.id"
      v-memo="[item.content, item.checked]"
      class="border-b border-gray-100 px-4"
      :style="{ height: contentType === 'dynamic' ? (item.height ? `${item.height}px` : 'auto') : '50px' }"
    >
      <div class="h-full flex items-center">
        <ContentRendererDispatcher
          :item="item"
          :content-type="contentType"
          @update:checked="handleCheckedUpdate"
        />
      </div>
    </div>
  </div>
</template>
