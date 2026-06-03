<script setup lang="ts">
import { h, defineComponent } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

import type { IListItem } from '../shared/types'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  data: IListItem[]
  contentType: string
}

const props = defineProps<Props>()

const CellRendererContent = defineComponent({
  props: ['params'],
  setup(compProps) {
    const item = computed(() => compProps.params.data as IListItem)
    const contentType = computed(() => compProps.params.contentType as string)
    return () =>
      h('div', { class: 'h-full flex items-center' }, [
        h(ContentRendererDispatcher, {
          item: item.value,
          contentType: contentType.value
        })
      ])
  }
})

const components = {
  cellRendererContent: CellRendererContent
}

const colDefs = computed(() => [
  {
    headerName: '#',
    field: 'id',
    width: 80,
    suppressSizeToFit: true
  },
  {
    headerName: '内容',
    field: 'content',
    flex: 1,
    cellRenderer: 'cellRendererContent',
    cellRendererParams: {
      contentType: props.contentType
    }
  }
])

const defaultColDef = {
  resizable: true,
  sortable: false
}

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
      :row-height="50"
      :suppress-scroll-on-new-data="true"
      style="height: 100%"
    />
  </div>
</template>
