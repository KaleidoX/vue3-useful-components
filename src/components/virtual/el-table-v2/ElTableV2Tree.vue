<script setup lang="ts">
import { h } from 'vue'
import type { Column } from 'element-plus'
import type { ITreeNode } from '../shared/types'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  nodes: ITreeNode[]
  contentType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [id: number]
  'update:checked': [id: number, checked: boolean]
}>()

const columns = computed<Column<ITreeNode>[]>(() => [
  {
    key: 'content',
    title: '内容',
    dataKey: 'content',
    width: 700,
    cellRenderer: ({ rowData }: { rowData: ITreeNode }) => {
      return h(
        'div',
        { class: 'h-full flex items-center', style: { paddingLeft: `${rowData.level * 24}px` } },
        [
          h(
            'button',
            {
              class:
                'mr-1 w-5 h-5 flex items-center justify-center border-none bg-transparent cursor-pointer select-none text-xs leading-none p-0',
              onClick: () => emit('toggle', rowData.id)
            },
            rowData.hasChildren ? (rowData.expanded ? '▼' : '▶') : ''
          ),
          h(ContentRendererDispatcher, {
            item: rowData,
            contentType: props.contentType,
            'onUpdate:checked': (id: number, checked: boolean) =>
              emit('update:checked', id, checked)
          })
        ]
      )
    }
  }
])
</script>

<template>
  <ElTableV2
    :columns="columns"
    :data="nodes"
    :width="800"
    :height="512"
    :row-height="50"
    class="border border-gray-200 rounded"
  />
</template>
