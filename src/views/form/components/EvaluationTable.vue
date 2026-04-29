<template>
  <div class="overflow-x-auto border rounded">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-3 py-2 text-left">工具</th>
          <th class="border px-3 py-2 text-center">功能</th>
          <th class="border px-3 py-2 text-center">集成</th>
          <th class="border px-3 py-2 text-center">体积</th>
          <th class="border px-3 py-2 text-center">许可</th>
          <th class="border px-3 py-2 text-center">中文</th>
          <th class="border px-3 py-2 text-center">扩展</th>
          <th class="border px-3 py-2 text-center">体验</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td v-for="(cell, j) in row" :key="j"
            :class="['border px-3 py-2', j === 0 ? 'font-medium' : 'text-center', cell === 'MIT' || cell === 'Apache2' ? 'text-green-600' : '']">
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  rows: string[][]
}>()
</script>
