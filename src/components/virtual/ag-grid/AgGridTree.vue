<script setup lang="ts">
import { h, defineComponent } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

import type { ITreeNode } from '../shared/types'
import ContentRendererDispatcher from '../shared/ContentRendererDispatcher.vue'

interface Props {
  nodes: ITreeNode[]
  contentType: string
}

const props = defineProps<Props>()

const CellRendererContent = defineComponent({
  props: ['params'],
  setup(compProps) {
    const node = computed(() => compProps.params.data as ITreeNode)
    const ct = computed(() => compProps.params.contentType as string)
    return () =>
      h(
        'div',
        { class: 'h-full flex items-center', style: { paddingLeft: `${node.value.level * 24}px` } },
        [
          h(
            'button',
            {
              class:
                'mr-1 w-5 h-5 flex items-center justify-center border-none bg-transparent cursor-pointer select-none text-xs leading-none p-0',
              onClick: () => compProps.params.toggleNode(node.value.id)
            },
            node.value.hasChildren ? (node.value.expanded ? '▼' : '▶') : ''
          ),
          h(ContentRendererDispatcher, {
            item: node.value,
            contentType: ct.value
          })
        ]
      )
  }
})

const components = { cellRendererContent: CellRendererContent }

const colDefs = computed(() => [
  {
    headerName: '内容',
    field: 'content',
    flex: 1,
    cellRenderer: 'cellRendererContent',
    cellRendererParams: {
      contentType: props.contentType,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toggleNode: (id: number) => {}
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
      :row-data="nodes"
      :column-defs="colDefs"
      :components="components"
      :default-col-def="defaultColDef"
      :row-height="50"
      :suppress-scroll-on-new-data="true"
      style="height: 100%"
    />
  </div>
</template>
