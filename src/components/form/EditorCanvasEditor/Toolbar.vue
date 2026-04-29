<template>
  <div class="menu">
    <slot name="undo-redo"><UndoRedo /></slot>
    <div class="menu-divider" />
    <slot name="font-size"><FontSize /></slot>
    <slot name="format"><Format /></slot>
    <slot name="color"><Color /></slot>
    <div class="menu-divider" />
    <slot name="paragraph"><Paragraph /></slot>
    <div class="menu-divider" />
    <slot name="insert"><Insert /></slot>
    <div class="menu-divider" />
    <slot name="search-print"><SearchPrint @toggle-search="showSearch = !showSearch" /></slot>
    <slot name="right"><RightTools /></slot>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CanvasToolbar' })
import UndoRedo from './toolbar/UndoRedo.vue'
import FontSize from './toolbar/FontSize.vue'
import Format from './toolbar/Format.vue'
import Color from './toolbar/Color.vue'
import Paragraph from './toolbar/Paragraph.vue'
import Insert from './toolbar/Insert.vue'
import SearchPrint from './toolbar/SearchPrint.vue'
import RightTools from './toolbar/RightTools.vue'

const showSearch = defineModel<boolean>('showSearch', { default: false })
</script>
