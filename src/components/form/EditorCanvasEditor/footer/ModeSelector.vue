<template>
  <div class="footer-mode" title="切换模式" @click="pageState.cycleMode()">{{ pageState.currentMode.value }}</div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'FooterModeSelector' })
import { useCanvasEditor } from '../injection'
const { pageState } = useCanvasEditor()
</script>

<style scoped>
.footer-mode { padding: 0 6px; height: 22px; line-height: 22px; border-radius: 3px; cursor: pointer; font-size: 11px; border: 1px solid #ddd; }
.footer-mode:hover { background: #e8e8e8; }
</style>
