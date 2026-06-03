<template>
  <div class="menu-item">
    <div title="加粗" @click="exec('executeBold')"><i class="i-lucide:bold" /></div>
    <div title="斜体" @click="exec('executeItalic')"><i class="i-lucide:italic" /></div>
    <div class="item-underline" title="下划线">
      <i class="i-lucide:underline" @click.stop="exec('executeUnderline')" />
      <span class="dropdown-trigger" @click.stop="toggleDropdown('underline')" />
      <div v-show="ds.underline" class="menu-options" @click.stop>
        <li
          @click="
            exec('executeUnderline')
            ds.underline = false
          "
        >
          单线
        </li>
        <li
          @click="
            exec('executeUnderline', { style: 'dashed' })
            ds.underline = false
          "
        >
          虚线
        </li>
        <li
          @click="
            exec('executeUnderline', { style: 'dotted' })
            ds.underline = false
          "
        >
          点线
        </li>
        <li
          @click="
            exec('executeUnderline', { style: 'wavy' })
            ds.underline = false
          "
        >
          波浪线
        </li>
      </div>
    </div>
    <div title="删除线" @click="exec('executeStrikeout')"><i class="i-lucide:strikethrough" /></div>
    <div title="上标" @click="exec('executeSuperscript')"><i class="i-lucide:superscript" /></div>
    <div title="下标" @click="exec('executeSubscript')"><i class="i-lucide:subscript" /></div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CanvasFormatTool' })
import { useCanvasEditor } from '../injection'
const { exec } = useCanvasEditor()
const ds = reactive<Record<string, boolean>>({})
function toggleDropdown(k: string) {
  ds[k] = !ds[k]
}
</script>

<style scoped>
.item-underline {
  position: relative;
}
.dropdown-trigger {
  display: inline-block;
  width: 12px;
  height: 100%;
  cursor: pointer;
}
</style>
