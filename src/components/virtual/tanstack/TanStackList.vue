<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'
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

const scrollElementRef = ref<HTMLElement | null>(null)

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.data.length,
    getScrollElement: () => scrollElementRef.value,
    estimateSize: () => (props.contentType === 'dynamic' ? 80 : 50),
    overscan: 10,
  })),
)

function handleCheckedUpdate(id: number, checked: boolean) {
  emit('update:checked', id, checked)
}
</script>

<template>
  <div ref="scrollElementRef" class="h-128 overflow-y-auto border border-gray-200 rounded">
    <div
      :style="{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }"
    >
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()"
        :key="data[virtualRow.index].id"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
        class="border-b border-gray-100 px-4"
      >
        <div class="h-full flex items-center">
          <ContentRendererDispatcher
            :item="data[virtualRow.index]"
            :content-type="contentType"
            @update:checked="handleCheckedUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>
