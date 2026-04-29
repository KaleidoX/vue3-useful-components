<template>
  <div class="menu-item">
    <div title="搜索与替换" @click="emit('toggleSearch')"><i class="i-lucide:search" /></div>
    <div title="打印" @click="exec('executePrint')"><i class="i-lucide:printer" /></div>
  </div>
</template>

<script lang="ts" setup>
import { useCanvasEditor } from '../injection'
const { exec } = useCanvasEditor()
const emit = defineEmits<{ toggleSearch: [] }>()
</script>
