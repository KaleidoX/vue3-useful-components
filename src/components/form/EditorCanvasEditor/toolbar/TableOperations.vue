<template>
  <div class="menu-item" aria-label="表格单元格操作">
    <button type="button" title="合并所选单元格" @click="exec('executeMergeTableCell')">
      <i class="i-lucide:combine" />
      <span>合并</span>
    </button>
    <button type="button" title="取消合并单元格" @click="exec('executeCancelMergeTableCell')">
      <i class="i-lucide:split" />
      <span>拆分</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useCanvasEditor } from '../injection'

defineOptions({ name: 'CanvasTableOperations' })

const { exec } = useCanvasEditor()
</script>

<style scoped>
button {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 4px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  padding: 0 7px;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
}

button:hover {
  background: #e8e8e8;
}
</style>
