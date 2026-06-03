<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'
import type { IListItem } from '../shared/types'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  data: IListItem[]
  contentType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:checked': [id: number, checked: boolean]
}>()

const dataRef = toRef(() => props.data)

const { list, containerProps, wrapperProps } = useVirtualList(dataRef, {
  itemHeight: 50,
  overscan: 10
})

function handleCheckedUpdate(id: number, checked: boolean) {
  emit('update:checked', id, checked)
}
</script>

<template>
  <div v-bind="containerProps" class="h-128 overflow-y-auto border border-gray-200 rounded">
    <div v-bind="wrapperProps">
      <div
        v-for="{ data: item } in list"
        :key="item.id"
        class="border-b border-gray-100 px-4"
        :style="{
          height:
            props.contentType === 'dynamic' ? (item.height ? `${item.height}px` : '50px') : '50px'
        }"
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
  </div>
</template>
