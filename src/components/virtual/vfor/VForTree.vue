<script setup lang="ts">
import type { ITreeNode } from '../shared/types'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  nodes: ITreeNode[]
  contentType: string
}

defineProps<Props>()

const emit = defineEmits<{
  'toggle': [id: number]
  'update:checked': [id: number, checked: boolean]
}>()

function handleCheckedUpdate(id: number, checked: boolean) {
  emit('update:checked', id, checked)
}
</script>

<template>
  <div ref="containerRef" class="h-128 overflow-y-auto border border-gray-200 rounded">
    <div
      v-for="node in nodes"
      :key="node.id"
      class="border-b border-gray-100 px-4"
      style="min-height: 50px"
    >
      <div class="h-full flex items-center" :style="{ paddingLeft: `${node.level * 24}px` }">
        <button
          class="mr-1 h-5 w-5 flex cursor-pointer select-none items-center justify-center border-none bg-transparent p-0 text-xs leading-none"
          @click.stop.prevent="emit('toggle', node.id)"
        >
          <template v-if="node.hasChildren">{{ node.expanded ? '▼' : '▶' }}</template>
        </button>
        <ContentRendererDispatcher
          :item="node"
          :content-type="contentType"
          @update:checked="handleCheckedUpdate"
        />
      </div>
    </div>
  </div>
</template>
