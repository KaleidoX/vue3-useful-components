<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'
import type { ITableRow } from '../shared/types'

interface Props {
  data: ITableRow[]
  contentType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:cell': [rowId: number, col: string, value: string | boolean | number]
}>()

const dataRef = toRef(() => props.data)

const { list, containerProps, wrapperProps } = useVirtualList(dataRef, {
  itemHeight: props.contentType === 'dynamic' ? 80 : 45,
  overscan: 10
})
</script>

<template>
  <div v-bind="containerProps" class="h-128 overflow-y-auto border border-gray-200 rounded">
    <div
      class="sticky top-0 z-1 grid grid-cols-7 bg-gray-100 px-3 text-left text-sm text-gray-600 font-medium"
      style="height: 40px; align-items: center"
    >
      <span>#</span><span>名称</span><span>状态</span><span>类别</span
      ><span class="text-right">数值</span><span>标签</span><span>操作</span>
    </div>
    <div v-bind="wrapperProps">
      <div
        v-for="{ data: row } in list"
        :key="row.id"
        class="grid grid-cols-7 border-b border-gray-100 px-3 text-sm hover:bg-gray-50"
        :style="{
          height:
            contentType === 'dynamic'
              ? `${row.id % 3 === 0 ? '70' : row.id % 3 === 1 ? '45' : '90'}px`
              : '45px',
          alignItems: 'center'
        }"
      >
        <span>{{ row.id }}</span>

        <template v-if="contentType === 'editable'">
          <input
            class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-xs"
            :value="row.col0"
            @input="emit('update:cell', row.id, 'col0', ($event.target as HTMLInputElement).value)"
          />
        </template>
        <span v-else class="truncate">{{ row.col0 }}</span>

        <template v-if="contentType === 'el-checkbox'">
          <ElCheckbox
            :model-value="row.col1"
            size="small"
            @change="(v: string | number | boolean) => emit('update:cell', row.id, 'col1', v)"
          />
        </template>
        <template v-else-if="contentType === 'native-checkbox'">
          <input
            type="checkbox"
            :checked="row.col1"
            @change="
              emit('update:cell', row.id, 'col1', ($event.target as HTMLInputElement).checked)
            "
          />
        </template>
        <span v-else :class="row.col1 ? 'text-green-600' : 'text-red-500'">{{
          row.col1 ? '是' : '否'
        }}</span>

        <template v-if="contentType === 'editable'">
          <input
            class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-xs"
            :value="row.col2"
            @input="emit('update:cell', row.id, 'col2', ($event.target as HTMLInputElement).value)"
          />
        </template>
        <span v-else class="truncate">{{ row.col2 }}</span>

        <template v-if="contentType === 'editable'">
          <input
            class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-right text-xs"
            type="number"
            :value="row.col3"
            @input="
              emit('update:cell', row.id, 'col3', Number(($event.target as HTMLInputElement).value))
            "
          />
        </template>
        <span v-else class="text-right font-mono">{{ row.col3.toLocaleString() }}</span>

        <template v-if="contentType === 'editable'">
          <input
            class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-xs"
            :value="row.col4"
            @input="emit('update:cell', row.id, 'col4', ($event.target as HTMLInputElement).value)"
          />
        </template>
        <span v-else>{{ row.col4 }}</span>

        <div class="flex items-center gap-1">
          <template v-if="contentType === 'complex'">
            <span
              class="inline-block h-5 w-5 rounded-full bg-blue-200 text-center text-xs leading-5"
              >{{ row.id % 3 }}</span
            >
            <ElButton size="small" text>详情</ElButton>
          </template>
          <span v-else class="text-xs text-gray-400">—</span>
        </div>
      </div>
    </div>
  </div>
</template>
