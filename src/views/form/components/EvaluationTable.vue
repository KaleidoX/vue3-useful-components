<template>
  <div class="overflow-x-auto border rounded">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th
            v-for="(h, i) in headers"
            :key="i"
            :class="['border px-3 py-2', i === 0 ? 'text-left' : 'text-center']"
          >
            {{ h }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td
            v-for="(cell, j) in row"
            :key="j"
            :class="[
              'border px-3 py-2',
              j === 0 ? 'font-medium' : 'text-center',
              cell === 'MIT' || cell === 'Apache2' ? 'text-green-600' : ''
            ]"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    rows: string[][]
    headers?: string[]
  }>(),
  {
    headers: () => ['工具', '功能', '集成', '体积', '许可', '中文', '扩展', '体验']
  }
)
</script>
