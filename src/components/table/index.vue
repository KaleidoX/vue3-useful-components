<template>
  <el-table
    ref="ElTableRef"
    class="w-full"
    v-bind="{ ...$attrs, ...restProps }"
    @selection-change="handleSelectionChange"
  >
    <el-table-column v-if="props.selection" type="selection" width="55" />
    <TableRenderColumns v-if="props.columns && props.columns.length" :columns="props.columns" />
  </el-table>
</template>

<script lang="ts" setup>
import { ElTable, ElTableColumn } from 'element-plus'
import TableRenderColumns from './columns.vue'
import type { ITableRender } from './type'
import { computed, ref, type PropType } from 'vue'

defineOptions({
  inheritAttrs: false,
  name: 'TableRender'
})

const emits = defineEmits(['update:modelValue'])

/**
 * 默认配置
 * @see https://element-plus.org/zh-CN/component/table
 * @see https://element-plus.org/zh-CN/component/table#table-%E5%B1%9E%E6%80%A7
 */
// const defaultOptions: TableProps = {
//   stripe: true,
//   border: true,
//   highlightCurrentRow: true,
//   showOverflowTooltip: true
// }

const props = defineProps({
  ...ElTable.props,
  stripe: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: true
  },
  highlightCurrentRow: {
    type: Boolean,
    default: true
  },
  showOverflowTooltip: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: [Array, String] as PropType<ITableRender['modelValue']>,
    default: () => []
  },
  selection: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array as PropType<ITableRender['columns']>,
    default: () => []
  }
})

// Create restProps by removing modelValue and columns from props
const restProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { modelValue, selection, columns, ...rest } = props
  return rest
})

const ElTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<any[]>([])

const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
  emits('update:modelValue', val)
}
</script>
