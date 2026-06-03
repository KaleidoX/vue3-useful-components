<script setup lang="ts">
import { h } from 'vue'
import type { ITableRow } from '../shared/types'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  data: ITableRow[]
  contentType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:cell': [rowId: number, col: string, value: string | boolean | number]
}>()

const columns = computed(() => [
  { key: 'id', title: '#', dataKey: 'id', width: 70, align: 'center' as const },
  {
    key: 'col0',
    title: '名称',
    dataKey: 'col0',
    width: 160,
    cellRenderer: ({ rowData }: { rowData: ITableRow }) => {
      if (props.contentType === 'editable') {
        return h('input', {
          class: 'w-full border border-gray-300 rounded px-1 py-0.5 text-sm',
          value: rowData.col0,
          onInput: (e: Event) =>
            emit('update:cell', rowData.id, 'col0', (e.target as HTMLInputElement).value)
        })
      }
      return h('span', { class: 'truncate inline-block w-full' }, rowData.col0)
    }
  },
  {
    key: 'col1',
    title: '状态',
    dataKey: 'col1',
    width: 80,
    align: 'center' as const,
    cellRenderer: ({ rowData }: { rowData: ITableRow }) => {
      if (props.contentType === 'el-checkbox') {
        return h(ContentRendererDispatcher, {
          item: { id: rowData.id, content: '', checked: rowData.col1 },
          contentType: 'el-checkbox',
          'onUpdate:checked': (_id: number, checked: boolean) =>
            emit('update:cell', rowData.id, 'col1', checked)
        })
      }
      if (props.contentType === 'native-checkbox') {
        return h('input', {
          type: 'checkbox',
          checked: rowData.col1,
          onChange: (e: Event) =>
            emit('update:cell', rowData.id, 'col1', (e.target as HTMLInputElement).checked)
        })
      }
      return h(
        'span',
        { class: rowData.col1 ? 'text-green-600' : 'text-red-500' },
        rowData.col1 ? '是' : '否'
      )
    }
  },
  {
    key: 'col2',
    title: '类别',
    dataKey: 'col2',
    width: 120,
    cellRenderer: ({ rowData }: { rowData: ITableRow }) => {
      if (props.contentType === 'editable') {
        return h('input', {
          class: 'w-full border border-gray-300 rounded px-1 py-0.5 text-sm',
          value: rowData.col2,
          onInput: (e: Event) =>
            emit('update:cell', rowData.id, 'col2', (e.target as HTMLInputElement).value)
        })
      }
      return h('span', { class: 'truncate inline-block w-full' }, rowData.col2)
    }
  },
  {
    key: 'col3',
    title: '数值',
    dataKey: 'col3',
    width: 110,
    align: 'right' as const,
    cellRenderer: ({ rowData }: { rowData: ITableRow }) => {
      if (props.contentType === 'editable') {
        return h('input', {
          class: 'w-full text-right border border-gray-300 rounded px-1 py-0.5 text-sm',
          type: 'number',
          value: rowData.col3,
          onInput: (e: Event) =>
            emit('update:cell', rowData.id, 'col3', Number((e.target as HTMLInputElement).value))
        })
      }
      return h('span', { class: 'font-mono' }, rowData.col3.toLocaleString())
    }
  },
  {
    key: 'col4',
    title: '标签',
    dataKey: 'col4',
    width: 90,
    align: 'center' as const,
    cellRenderer: ({ rowData }: { rowData: ITableRow }) => {
      if (props.contentType === 'editable') {
        return h('input', {
          class: 'w-full border border-gray-300 rounded px-1 py-0.5 text-sm',
          value: rowData.col4,
          onInput: (e: Event) =>
            emit('update:cell', rowData.id, 'col4', (e.target as HTMLInputElement).value)
        })
      }
      return h('span', {}, rowData.col4)
    }
  },
  {
    key: 'actions',
    title: '操作',
    dataKey: 'id',
    width: 120,
    align: 'center' as const,
    cellRenderer: ({ rowData }: { rowData: ITableRow }) => {
      if (props.contentType === 'complex') {
        return h('div', { class: 'flex items-center gap-1' }, [
          h(
            'span',
            {
              class: 'w-5 h-5 rounded-full bg-blue-200 inline-block text-xs text-center leading-5'
            },
            String(rowData.id % 3)
          ),
          h('ElButton', { size: 'small', text: true }, { default: () => '详情' })
        ])
      }
      return h('span', { class: 'text-gray-400 text-xs' }, '—')
    }
  }
])

const rowHeight = computed(() => (props.contentType === 'dynamic' ? undefined : 45))
</script>

<template>
  <ElTableV2
    :columns="columns"
    :data="data"
    :width="800"
    :height="512"
    :row-height="rowHeight"
    class="border border-gray-200 rounded"
  />
</template>
