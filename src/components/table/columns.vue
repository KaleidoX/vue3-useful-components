<template>
  <el-table-column
    v-for="(column, index) in props.columns"
    :key="index"
    v-bind="{ ...$attrs, ...margeOptions(column) }"
  >
    <template #header="scope">
      <!-- 你可以在这里使用 column.renderHeader 来指定自定义的 header 插槽 -->
      <component v-if="column.renderHeader" :is="column.renderHeader" v-bind="scope"></component>
    </template>
    <template #default="scope">
      <!-- 使用 column.renderDefault 作为动态组件，并传入 scope 对象 -->
      <component v-if="column.renderDefault" :is="column.renderDefault" v-bind="scope"></component>
      <TableRenderColumns
        v-if="column.children && column.children.length"
        v-bind="$attrs"
        :columns="column.children"
      />
    </template>
  </el-table-column>
</template>
<script setup lang="ts">
import { ElTableColumn } from 'element-plus'
import type { ITableRenderColumn, TableColumnProps } from './type'
import TableRenderColumns from './columns.vue'
import type { PropType } from 'vue'

defineOptions({
  inheritAttrs: false,
  name: 'TableRenderColumns'
})

const props = defineProps({
  columns: {
    type: Array as PropType<ITableRenderColumn[]>,
    default: () => []
  }
})

const defaultOptions: TableColumnProps = {
  align: 'center',
  headerAlign: 'center',
  showOverflowTooltip: true
}

const margeOptions = (column: ITableRenderColumn): TableColumnProps => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { renderDefault, renderHeader, children, ...reset } = column

  return {
    ...defaultOptions,
    ...reset
  }
}
</script>
