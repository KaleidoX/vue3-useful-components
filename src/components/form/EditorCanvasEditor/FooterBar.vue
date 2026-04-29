<template>
  <div class="canvas-footer">
    <div class="footer-left">
      <slot name="catalog-toggle"><CatalogToggle v-model:visible="showCatalog" /></slot>
      <slot name="page-mode"><PageModeToggle /></slot>
    </div>
    <slot name="page-info"><PageInfo /></slot>
    <div class="footer-right">
      <slot name="mode-selector"><ModeSelector /></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CanvasFooterBar' })
import CatalogToggle from './footer/CatalogToggle.vue'
import PageModeToggle from './footer/PageModeToggle.vue'
import PageInfo from './footer/PageInfo.vue'
import ModeSelector from './footer/ModeSelector.vue'

const showCatalog = defineModel<boolean>('showCatalog', { default: false })
</script>

<style scoped>
.canvas-footer { display: flex; align-items: center; justify-content: space-between; padding: 0 8px; height: 28px; background: #fafafa; border-top: 1px solid #e2e2e2; font-size: 11px; color: #777; flex-shrink: 0; gap: 8px; }
.footer-left { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.footer-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
</style>
