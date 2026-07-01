<script setup lang="ts">
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import type { ITableRow } from '../shared/types'

interface Props {
  data: ITableRow[]
  contentType: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:cell': [rowId: number, col: string, value: string | boolean | number]
}>()
</script>

<template>
  <div>
    <div
      class="grid grid-cols-7 bg-gray-100 px-3 text-left text-sm text-gray-600 font-medium"
      style="height: 40px; align-items: center"
    >
      <span>#</span><span>名称</span><span>状态</span><span>类别</span
      ><span class="text-right">数值</span><span>标签</span><span>操作</span>
    </div>

    <RecycleScroller
      v-if="contentType !== 'dynamic'"
      :items="data"
      :item-size="45"
      key-field="id"
      class="h-120 border border-gray-200 rounded-t-none"
      v-slot="{ item }"
    >
      <div
        class="grid grid-cols-7 border-b border-gray-100 px-3 text-sm hover:bg-gray-50"
        style="height: 45px; align-items: center"
      >
        <span>{{ (item as ITableRow).id }}</span>

        <template v-if="contentType === 'editable'">
          <input
            class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-xs"
            :value="(item as ITableRow).col0"
            @input="emit('update:cell', item.id, 'col0', ($event.target as HTMLInputElement).value)"
          />
        </template>
        <span v-else class="truncate">{{ (item as ITableRow).col0 }}</span>

        <template v-if="contentType === 'el-checkbox'">
          <ElCheckbox
            :model-value="(item as ITableRow).col1"
            size="small"
            @change="(v: string | number | boolean) => emit('update:cell', item.id, 'col1', v)"
          />
        </template>
        <template v-else-if="contentType === 'native-checkbox'">
          <input
            type="checkbox"
            :checked="(item as ITableRow).col1"
            @change="
              emit('update:cell', item.id, 'col1', ($event.target as HTMLInputElement).checked)
            "
          />
        </template>
        <span v-else :class="(item as ITableRow).col1 ? 'text-green-600' : 'text-red-500'">{{
          (item as ITableRow).col1 ? '是' : '否'
        }}</span>

        <template v-if="contentType === 'editable'">
          <input
            class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-xs"
            :value="(item as ITableRow).col2"
            @input="emit('update:cell', item.id, 'col2', ($event.target as HTMLInputElement).value)"
          />
        </template>
        <span v-else class="truncate">{{ (item as ITableRow).col2 }}</span>

        <template v-if="contentType === 'editable'">
          <input
            class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-right text-xs"
            type="number"
            :value="(item as ITableRow).col3"
            @input="
              emit(
                'update:cell',
                item.id,
                'col3',
                Number(($event.target as HTMLInputElement).value)
              )
            "
          />
        </template>
        <span v-else class="text-right font-mono">{{
          (item as ITableRow).col3.toLocaleString()
        }}</span>

        <template v-if="contentType === 'editable'">
          <input
            class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-xs"
            :value="(item as ITableRow).col4"
            @input="emit('update:cell', item.id, 'col4', ($event.target as HTMLInputElement).value)"
          />
        </template>
        <span v-else>{{ (item as ITableRow).col4 }}</span>

        <div class="flex items-center gap-1">
          <template v-if="contentType === 'complex'">
            <span
              class="inline-block h-5 w-5 rounded-full bg-blue-200 text-center text-xs leading-5"
              >{{ (item as ITableRow).id % 3 }}</span
            >
            <ElButton size="small" text>详情</ElButton>
          </template>
          <span v-else class="text-xs text-gray-400">—</span>
        </div>
      </div>
    </RecycleScroller>

    <DynamicScroller
      v-else
      :items="data"
      :min-item-size="45"
      key-field="id"
      class="h-120 border border-gray-200 rounded-t-none"
      v-slot="{ item, index, active }"
    >
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :data-index="index"
        :size-dependencies="[(item as ITableRow).col0]"
      >
        <div
          class="grid grid-cols-7 border-b border-gray-100 px-3 py-2 text-sm hover:bg-gray-50"
          style="align-items: center"
        >
          <span>{{ (item as ITableRow).id }}</span>
          <span class="truncate">{{ (item as ITableRow).col0 }}</span>
          <span :class="(item as ITableRow).col1 ? 'text-green-600' : 'text-red-500'">{{
            (item as ITableRow).col1 ? '是' : '否'
          }}</span>
          <span class="truncate">{{ (item as ITableRow).col2 }}</span>
          <span class="text-right font-mono">{{ (item as ITableRow).col3.toLocaleString() }}</span>
          <span>{{ (item as ITableRow).col4 }}</span>
          <span class="text-xs text-gray-400">—</span>
        </div>
      </DynamicScrollerItem>
    </DynamicScroller>
  </div>
</template>
