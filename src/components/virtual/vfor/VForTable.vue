<script setup lang="ts">
import type { ITableRow } from '../shared/types'

interface Props {
  data: ITableRow[]
  contentType: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:cell': [rowId: number, col: string, value: string | boolean | number]
}>()

function onEdit(rowId: number, col: string, event: Event) {
  const target = event.target as HTMLInputElement
  if (target.type === 'checkbox') {
    emit('update:cell', rowId, col, target.checked)
  } else {
    emit('update:cell', rowId, col, target.value)
  }
}

function getRowStyle(ct: string): Record<string, string> {
  if (ct === 'dynamic') {
    const h = 40 + Math.floor(Math.random() * 80)
    return { height: `${h}px`, minHeight: `${h}px` }
  }
  return { minHeight: '45px' }
}
</script>

<template>
  <div class="h-128 overflow-y-auto border border-gray-200 rounded">
    <table>
      <thead class="sticky top-0 z-1 bg-gray-100">
        <tr class="text-left text-sm text-gray-600 font-medium">
          <th class="w-16 px-3 py-2">#</th>
          <th class="w-36 px-3 py-2">名称</th>
          <th class="w-24 px-3 py-2">状态</th>
          <th class="w-28 px-3 py-2">类别</th>
          <th class="w-28 px-3 py-2">数值</th>
          <th class="w-24 px-3 py-2">标签</th>
          <th class="px-3 py-2">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in data"
          :key="row.id"
          class="border-b border-gray-100 text-sm hover:bg-gray-50"
          :style="getRowStyle(contentType)"
        >
          <td class="px-3">{{ row.id }}</td>

          <td class="px-3">
            <template v-if="contentType === 'editable'">
              <input
                class="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
                :value="row.col0"
                @input="onEdit(row.id, 'col0', $event)"
              />
            </template>
            <span v-else class="block truncate">{{ row.col0 }}</span>
          </td>

          <td class="px-3">
            <template v-if="contentType === 'el-checkbox'">
              <ElCheckbox
                :model-value="row.col1"
                size="small"
                @change="(v) => emit('update:cell', row.id, 'col1', v)"
              />
            </template>
            <template v-else-if="contentType === 'native-checkbox'">
              <input type="checkbox" :checked="row.col1" @change="onEdit(row.id, 'col1', $event)" />
            </template>
            <span v-else :class="row.col1 ? 'text-green-600' : 'text-red-500'">{{
              row.col1 ? '是' : '否'
            }}</span>
          </td>

          <td class="px-3">
            <template v-if="contentType === 'editable'">
              <input
                class="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
                :value="row.col2"
                @input="onEdit(row.id, 'col2', $event)"
              />
            </template>
            <span v-else class="block truncate">{{ row.col2 }}</span>
          </td>

          <td class="px-3 text-right font-mono">
            <template v-if="contentType === 'editable'">
              <input
                class="w-full border border-gray-300 rounded px-1 py-0.5 text-right text-sm"
                type="number"
                :value="row.col3"
                @input="onEdit(row.id, 'col3', $event)"
              />
            </template>
            <span v-else>{{ row.col3.toLocaleString() }}</span>
          </td>

          <td class="px-3">
            <template v-if="contentType === 'editable'">
              <input
                class="w-full border border-gray-300 rounded px-1 py-0.5 text-sm"
                :value="row.col4"
                @input="onEdit(row.id, 'col4', $event)"
              />
            </template>
            <span v-else>{{ row.col4 }}</span>
          </td>

          <td class="px-3">
            <div class="flex items-center gap-1">
              <template v-if="contentType === 'complex'">
                <span
                  class="inline-block h-6 w-6 rounded-full bg-blue-200 text-center text-xs leading-6"
                  >{{ row.id % 3 }}</span
                >
                <ElButton size="small" text>详情</ElButton>
              </template>
              <span v-else class="text-xs text-gray-400">—</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
</style>
