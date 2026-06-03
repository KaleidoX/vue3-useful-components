<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'
import type { ITableRow } from '../shared/types'

interface Props {
  data: ITableRow[]
  contentType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:cell': [rowId: number, col: string, value: string | boolean | number]
}>()

const scrollElementRef = ref<HTMLElement | null>(null)

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.data.length,
    getScrollElement: () => scrollElementRef.value,
    estimateSize: () => (props.contentType === 'dynamic' ? 80 : 45),
    overscan: 10
  }))
)
</script>

<template>
  <div>
    <div
      class="grid grid-cols-7 bg-gray-100 px-3 text-left text-sm text-gray-600 font-medium"
      style="
        grid-template-columns: 2rem 8rem 4rem 5rem 5rem 4rem 4rem;
        height: 40px;
        align-items: center;
      "
    >
      <span>#</span><span>名称</span><span>状态</span><span>类别</span
      ><span class="text-right">数值</span><span>标签</span><span>操作</span>
    </div>
    <div ref="scrollElementRef" class="h-120 overflow-y-auto border border-gray-200 rounded-t-none">
      <div
        :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }"
      >
        <div
          v-for="virtualRow in virtualizer.getVirtualItems()"
          :key="data[virtualRow.index].id"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`
          }"
          class="grid grid-cols-7 border-b border-gray-100 px-3 text-sm hover:bg-gray-50"
          style="align-items: center"
        >
          <span>{{ data[virtualRow.index].id }}</span>

          <template v-if="contentType === 'editable'">
            <input
              class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-xs"
              :value="data[virtualRow.index].col0"
              @input="
                emit(
                  'update:cell',
                  data[virtualRow.index].id,
                  'col0',
                  ($event.target as HTMLInputElement).value
                )
              "
            />
          </template>
          <span v-else class="truncate">{{ data[virtualRow.index].col0 }}</span>

          <template v-if="contentType === 'el-checkbox'">
            <ElCheckbox
              :model-value="data[virtualRow.index].col1"
              size="small"
              @change="(v) => emit('update:cell', data[virtualRow.index].id, 'col1', v)"
            />
          </template>
          <template v-else-if="contentType === 'native-checkbox'">
            <input
              type="checkbox"
              :checked="data[virtualRow.index].col1"
              @change="
                emit(
                  'update:cell',
                  data[virtualRow.index].id,
                  'col1',
                  ($event.target as HTMLInputElement).checked
                )
              "
            />
          </template>
          <span v-else :class="data[virtualRow.index].col1 ? 'text-green-600' : 'text-red-500'">{{
            data[virtualRow.index].col1 ? '是' : '否'
          }}</span>

          <template v-if="contentType === 'editable'">
            <input
              class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-xs"
              :value="data[virtualRow.index].col2"
              @input="
                emit(
                  'update:cell',
                  data[virtualRow.index].id,
                  'col2',
                  ($event.target as HTMLInputElement).value
                )
              "
            />
          </template>
          <span v-else class="truncate">{{ data[virtualRow.index].col2 }}</span>

          <template v-if="contentType === 'editable'">
            <input
              class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-right text-xs"
              type="number"
              :value="data[virtualRow.index].col3"
              @input="
                emit(
                  'update:cell',
                  data[virtualRow.index].id,
                  'col3',
                  Number(($event.target as HTMLInputElement).value)
                )
              "
            />
          </template>
          <span v-else class="text-right font-mono">{{
            data[virtualRow.index].col3.toLocaleString()
          }}</span>

          <template v-if="contentType === 'editable'">
            <input
              class="w-4/5 border border-gray-300 rounded px-1 py-0.5 text-xs"
              :value="data[virtualRow.index].col4"
              @input="
                emit(
                  'update:cell',
                  data[virtualRow.index].id,
                  'col4',
                  ($event.target as HTMLInputElement).value
                )
              "
            />
          </template>
          <span v-else>{{ data[virtualRow.index].col4 }}</span>

          <div class="flex items-center gap-1">
            <template v-if="contentType === 'complex'">
              <span
                class="inline-block h-5 w-5 rounded-full bg-blue-200 text-center text-xs leading-5"
                >{{ data[virtualRow.index].id % 3 }}</span
              >
              <ElButton size="small" text>详情</ElButton>
            </template>
            <span v-else class="text-xs text-gray-400">—</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
