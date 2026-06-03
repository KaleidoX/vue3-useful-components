<template>
  <div class="menu-item">
    <div title="撤销" @click="exec('executeUndo')"><i class="i-lucide:undo-2" /></div>
    <div title="重做" @click="exec('executeRedo')"><i class="i-lucide:redo-2" /></div>
    <div title="格式刷" @click="exec('executePainter', { isDblclick: false })">
      <i class="i-lucide:paintbrush" />
    </div>
    <div title="清除格式" @click="exec('executeFormat')">
      <i class="i-lucide:remove-formatting" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCanvasEditor } from '../injection'
const { exec } = useCanvasEditor()
</script>
