<template>
  <div class="footer-center">
    <span>可见页码：{{ pageState.currentPage.value }}</span>
    <span>|</span>
    <span>页面：{{ pageState.currentPage.value }} / {{ pageState.totalPages.value }}</span>
    <span>|</span>
    <span>字数：{{ pageState.wordCount.value }}</span>
    <span>|</span>
    <span>行：{{ pageState.lineCount.value }}</span>
    <span>|</span>
    <span>列：{{ pageState.colCount.value }}</span>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'FooterPageInfo' })
import { useCanvasEditor } from '../injection'
const { pageState } = useCanvasEditor()
</script>

<style scoped>
.footer-center {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  white-space: nowrap;
}
.footer-center span {
  flex-shrink: 0;
}
</style>
