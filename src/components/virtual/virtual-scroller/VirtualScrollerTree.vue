<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import type { ITreeNode } from '../shared/types'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  nodes: ITreeNode[]
  contentType: string
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: [id: number]
  'update:checked': [id: number, checked: boolean]
}>()

function handleCheckedUpdate(id: number, checked: boolean) {
  emit('update:checked', id, checked)
}
</script>

<template>
  <RecycleScroller
    :items="nodes"
    :item-size="50"
    key-field="id"
    class="h-128 border border-gray-200 rounded"
    v-slot="{ item }"
  >
    <div
      class="h-full flex items-center border-b border-gray-100 px-4"
      :style="{ paddingLeft: `${(item as ITreeNode).level * 24 + 16}px` }"
    >
      <button
        class="mr-1 h-5 w-5 flex cursor-pointer select-none items-center justify-center border-none bg-transparent p-0 text-xs leading-none"
        @click.stop.prevent="emit('toggle', item.id)"
      >
        <template v-if="(item as ITreeNode).hasChildren">{{
          (item as ITreeNode).expanded ? '▼' : '▶'
        }}</template>
      </button>
      <ContentRendererDispatcher
        :item="item"
        :content-type="contentType"
        @update:checked="handleCheckedUpdate"
      />
    </div>
  </RecycleScroller>
</template>
