<script setup lang="ts">
import { h } from 'vue'
import type { IListItem } from '../shared/types'
import type { Column } from 'element-plus'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  data: IListItem[]
  contentType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:checked': [id: number, checked: boolean]
}>()

const columns = computed(() => {
  const cols: Column<IListItem>[] = [
    {
      key: 'id',
      title: '#',
      dataKey: 'id',
      width: 80,
      align: 'center',
    },
    {
      key: 'content',
      title: '内容',
      dataKey: 'content',
      width: 600,
      cellRenderer: ({ rowData }: { rowData: IListItem }) => {
        return h(ContentRendererDispatcher, {
          item: rowData,
          contentType: props.contentType,
          'onUpdate:checked': (id: number, checked: boolean) =>
            emit('update:checked', id, checked),
        })
      },
    },
  ]
  return cols
})
</script>

<template>
  <ElTableV2
    :columns="columns"
    :data="data"
    :width="800"
    :height="512"
    :row-height="50"
    class="border border-gray-200 rounded"
  />
</template>
