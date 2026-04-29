<template>
  <div class="search-panel">
    <input v-model="searchText" class="search-input" placeholder="搜索..." />
    <input v-model="replaceText" class="search-input" placeholder="替换为..." />
    <button class="search-btn" @click="doReplace">替换</button>
    <span class="search-result">{{ result }}</span>
    <span class="search-close" @click="emit('close')">✕</span>
  </div>
</template>

<script lang="ts" setup>
import { useCanvasEditor } from '../injection'
const { exec } = useCanvasEditor()
const searchText = ref('')
const replaceText = ref('')
const result = ref('')
const emit = defineEmits<{ close: [] }>()

function doReplace() {
  if (searchText.value && searchText.value !== replaceText.value) {
    exec('executeReplace', replaceText.value)
  }
}
</script>
