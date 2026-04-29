<template>
  <div class="footer-btn" :class="{ active: visible }" title="目录" @click="visible = !visible">
    <i class="i-lucide:book-open" />
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'FooterCatalogToggle' })
const visible = defineModel<boolean>('visible', { default: false })
</script>

<style scoped>
.footer-btn { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 3px; cursor: pointer; }
.footer-btn:hover { background: #e8e8e8; }
.footer-btn.active { background: #d4e4ff; color: #1a73e8; }
.footer-btn i { font-size: 14px; }
</style>
