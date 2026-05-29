<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'
import type { ITreeNode } from '../shared/types'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  nodes: ITreeNode[]
  contentType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggle': [id: number]
  'update:checked': [id: number, checked: boolean]
}>()

const scrollElementRef = ref<HTMLElement | null>(null)

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.nodes.length,
    getScrollElement: () => scrollElementRef.value,
    estimateSize: () => 50,
    overscan: 10,
  })),
)

function handleCheckedUpdate(id: number, checked: boolean) {
  emit('update:checked', id, checked)
}
</script>

<template>
  <div ref="scrollElementRef" class="h-128 overflow-y-auto border border-gray-200 rounded">
    <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()"
        :key="nodes[virtualRow.index].id"
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
        <div class="h-full flex items-center" :style="{ paddingLeft: `${nodes[virtualRow.index].level * 24}px` }">
          <button
            class="mr-1 h-5 w-5 flex cursor-pointer select-none items-center justify-center border-none bg-transparent p-0 text-xs leading-none"
            @click.stop.prevent="emit('toggle', nodes[virtualRow.index].id)"
          >
            <template v-if="nodes[virtualRow.index].hasChildren">{{ nodes[virtualRow.index].expanded ? '▼' : '▶' }}</template>
          </button>
          <ContentRendererDispatcher
            :item="nodes[virtualRow.index]"
            :content-type="contentType"
            @update:checked="handleCheckedUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>
