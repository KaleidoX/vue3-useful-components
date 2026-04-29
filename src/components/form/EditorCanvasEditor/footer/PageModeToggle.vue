<template>
  <div class="footer-btn" :title="pageState.isPaging.value ? '连页模式' : '分页模式'" @click="pageState.togglePageMode()">
    <i :class="pageState.isPaging.value ? 'i-lucide:stretch-vertical' : 'i-lucide:stretch-horizontal'" />
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'FooterPageModeToggle' })
import { useCanvasEditor } from '../injection'
const { pageState } = useCanvasEditor()
</script>

<style scoped>
.footer-btn { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 3px; cursor: pointer; }
.footer-btn:hover { background: #e8e8e8; }
.footer-btn i { font-size: 14px; }
</style>
