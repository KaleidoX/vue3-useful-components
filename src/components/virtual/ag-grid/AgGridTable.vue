<script setup lang="ts">
import { h, defineComponent } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

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

const CellRendererName = defineComponent({
  props: ['params'],
  setup(compProps) {
    const ct = computed(() => compProps.params.contentType as string)
    const row = computed(() => compProps.params.data as ITableRow)
    return () => {
      if (ct.value === 'editable') {
        return h('input', {
          class: 'w-full border border-gray-300 rounded px-1 py-0.5 text-xs',
          value: row.value.col0,
          onInput: (e: Event) =>
            compProps.params.onCellUpdate(
              row.value.id,
              'col0',
              (e.target as HTMLInputElement).value
            )
        })
      }
      return h('span', { class: 'truncate' }, row.value.col0)
    }
  }
})

const CellRendererStatus = defineComponent({
  props: ['params'],
  setup(compProps) {
    const ct = computed(() => compProps.params.contentType as string)
    const row = computed(() => compProps.params.data as ITableRow)
    return () => {
      if (ct.value === 'el-checkbox') {
        return h(ContentRendererDispatcher, {
          item: { id: row.value.id, content: '', checked: row.value.col1 },
          contentType: 'el-checkbox',
          'onUpdate:checked': (_id: number, checked: boolean) =>
            compProps.params.onCellUpdate(row.value.id, 'col1', checked)
        })
      }
      if (ct.value === 'native-checkbox') {
        return h('input', {
          type: 'checkbox',
          checked: row.value.col1,
          onChange: (e: Event) =>
            compProps.params.onCellUpdate(
              row.value.id,
              'col1',
              (e.target as HTMLInputElement).checked
            )
        })
      }
      return h(
        'span',
        { class: row.value.col1 ? 'text-green-600' : 'text-red-500' },
        row.value.col1 ? '是' : '否'
      )
    }
  }
})

const CellRendererCategory = defineComponent({
  props: ['params'],
  setup(compProps) {
    const ct = computed(() => compProps.params.contentType as string)
    const row = computed(() => compProps.params.data as ITableRow)
    return () => {
      if (ct.value === 'editable') {
        return h('input', {
          class: 'w-full border border-gray-300 rounded px-1 py-0.5 text-xs',
          value: row.value.col2,
          onInput: (e: Event) =>
            compProps.params.onCellUpdate(
              row.value.id,
              'col2',
              (e.target as HTMLInputElement).value
            )
        })
      }
      return h('span', { class: 'truncate' }, row.value.col2)
    }
  }
})

const CellRendererNumber = defineComponent({
  props: ['params'],
  setup(compProps) {
    const ct = computed(() => compProps.params.contentType as string)
    const row = computed(() => compProps.params.data as ITableRow)
    return () => {
      if (ct.value === 'editable') {
        return h('input', {
          class: 'w-full text-right border border-gray-300 rounded px-1 py-0.5 text-xs',
          type: 'number',
          value: row.value.col3,
          onInput: (e: Event) =>
            compProps.params.onCellUpdate(
              row.value.id,
              'col3',
              Number((e.target as HTMLInputElement).value)
            )
        })
      }
      return h('span', { class: 'font-mono' }, row.value.col3.toLocaleString())
    }
  }
})

const CellRendererTag = defineComponent({
  props: ['params'],
  setup(compProps) {
    const ct = computed(() => compProps.params.contentType as string)
    const row = computed(() => compProps.params.data as ITableRow)
    return () => {
      if (ct.value === 'editable') {
        return h('input', {
          class: 'w-full border border-gray-300 rounded px-1 py-0.5 text-xs',
          value: row.value.col4,
          onInput: (e: Event) =>
            compProps.params.onCellUpdate(
              row.value.id,
              'col4',
              (e.target as HTMLInputElement).value
            )
        })
      }
      return h('span', {}, row.value.col4)
    }
  }
})

const CellRendererAction = defineComponent({
  props: ['params'],
  setup(compProps) {
    const ct = computed(() => compProps.params.contentType as string)
    const row = computed(() => compProps.params.data as ITableRow)
    return () => {
      if (ct.value === 'complex') {
        return h('div', { class: 'flex items-center gap-1' }, [
          h(
            'span',
            {
              class: 'w-5 h-5 rounded-full bg-blue-200 inline-block text-xs text-center leading-5'
            },
            String(row.value.id % 3)
          ),
          h('ElButton', { size: 'small', text: true }, { default: () => '详情' })
        ])
      }
      return h('span', { class: 'text-gray-400 text-xs' }, '—')
    }
  }
})

const components = {
  nameRenderer: CellRendererName,
  statusRenderer: CellRendererStatus,
  categoryRenderer: CellRendererCategory,
  numberRenderer: CellRendererNumber,
  tagRenderer: CellRendererTag,
  actionRenderer: CellRendererAction
}

function cellParams() {
  return {
    contentType: props.contentType,
    onCellUpdate: (rowId: number, col2: string, val: string | boolean | number) =>
      emit('update:cell', rowId, col2, val)
  }
}

const colDefs = computed(() => [
  { headerName: '#', field: 'id', width: 70, suppressSizeToFit: true },
  {
    headerName: '名称',
    field: 'col0',
    flex: 1,
    cellRenderer: 'nameRenderer',
    cellRendererParams: cellParams()
  },
  {
    headerName: '状态',
    field: 'col1',
    width: 80,
    cellRenderer: 'statusRenderer',
    cellRendererParams: cellParams()
  },
  {
    headerName: '类别',
    field: 'col2',
    width: 110,
    cellRenderer: 'categoryRenderer',
    cellRendererParams: cellParams()
  },
  {
    headerName: '数值',
    field: 'col3',
    width: 110,
    cellRenderer: 'numberRenderer',
    cellRendererParams: cellParams()
  },
  {
    headerName: '标签',
    field: 'col4',
    width: 80,
    cellRenderer: 'tagRenderer',
    cellRendererParams: cellParams()
  },
  {
    headerName: '操作',
    field: 'id',
    width: 110,
    cellRenderer: 'actionRenderer',
    cellRendererParams: cellParams()
  }
])

const defaultColDef = { resizable: true, sortable: false }
const myTheme = themeQuartz
</script>

<template>
  <div class="h-128 border border-gray-200 rounded">
    <AgGridVue
      :key="contentType"
      :theme="myTheme"
      :row-data="data"
      :column-defs="colDefs"
      :components="components"
      :default-col-def="defaultColDef"
      :row-height="contentType === 'dynamic' ? undefined : 45"
      :suppress-scroll-on-new-data="true"
      style="height: 100%"
    />
  </div>
</template>
