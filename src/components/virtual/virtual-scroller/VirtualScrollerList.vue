<script setup lang="ts">
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
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
  <RecycleScroller
    v-if="contentType !== 'dynamic'"
    :items="data"
    :item-size="50"
    key-field="id"
    class="h-128 border border-gray-200 rounded"
    v-slot="{ item }"
  >
    <div class="h-full flex items-center border-b border-gray-100 px-4">
      <ContentRendererDispatcher
        :item="item"
        :content-type="contentType"
        @update:checked="handleCheckedUpdate"
      />
    </div>
  </RecycleScroller>

  <DynamicScroller
    v-else
    :items="data"
    :min-item-size="40"
    key-field="id"
    class="h-128 border border-gray-200 rounded"
    v-slot="{ item, index, active }"
  >
    <DynamicScrollerItem
      :item="item"
      :active="active"
      :size-dependencies="[item.content]"
      :data-index="index"
    >
      <div class="flex items-center border-b border-gray-100 px-4 py-2">
        <ContentRendererDispatcher
          :item="item"
          :content-type="contentType"
          @update:checked="handleCheckedUpdate"
        />
      </div>
    </DynamicScrollerItem>
  </DynamicScroller>
</template>
