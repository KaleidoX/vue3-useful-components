<template>
  <div class="w-[200px] border border-gray-200 rounded-lg bg-white shadow-sm">
    <div class="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
      <span class="text-sm">📋</span>
      <span class="text-xs text-gray-900 font-semibold">{{ title }}</span>
    </div>
    <div class="px-3 py-2 space-y-2">
      <input
        :value="inputValue"
        class="w-full border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
        placeholder="输入内容"
        @input="$emit('update:inputValue', ($event.target as HTMLInputElement).value)"
      />
      <div class="flex items-center justify-between">
        <select
          :value="selectValue"
          class="border border-gray-300 rounded px-1 py-0.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
          @change="$emit('update:selectValue', ($event.target as HTMLSelectElement).value)"
        >
          <option value="option1">选项一</option>
          <option value="option2">选项二</option>
          <option value="option3">选项三</option>
        </select>
        <button
          :class="[
            'relative h-5 w-9 rounded-full transition-colors',
            toggleValue ? 'bg-blue-500' : 'bg-gray-300'
          ]"
          @click="$emit('update:toggleValue', !toggleValue)"
        >
          <span
            :class="[
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
              toggleValue ? 'left-[18px]' : 'left-0.5'
            ]"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  inputValue: string
  selectValue: string
  toggleValue: boolean
}>()

defineEmits<{
  'update:inputValue': [value: string]
  'update:selectValue': [value: string]
  'update:toggleValue': [value: boolean]
}>()
</script>
