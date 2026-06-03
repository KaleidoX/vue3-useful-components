<template>
  <div class="menu-item">
    <div class="menu-item__color" title="字体颜色" @click="colorShow = !colorShow">
      <span :style="{ borderColor: currentColor }" />
    </div>
    <div v-if="colorShow" class="color-picker-popover" @click.stop>
      <div class="color-presets">
        <div
          v-for="c in presetColors"
          :key="c"
          class="color-preset"
          :style="{ background: c }"
          :class="{ active: c === currentColor }"
          @click="applyColor(c)"
        />
      </div>
      <ElColorPicker v-model="currentColor" show-alpha @change="onColorChange" />
    </div>
    <div class="menu-item__highlight" title="背景色" @click="highlightShow = !highlightShow">
      <span :style="{ borderColor: currentHighlight }" />
    </div>
    <div v-if="highlightShow" class="color-picker-popover right" @click.stop>
      <div class="color-presets">
        <div
          v-for="c in highlightPresets"
          :key="c"
          class="color-preset"
          :style="{ background: c }"
          :class="{ active: c === currentHighlight }"
          @click="applyHighlight(c)"
        />
      </div>
      <ElColorPicker v-model="currentHighlight" show-alpha @change="onHighlightChange" />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CanvasColorTool' })
import { ElColorPicker } from 'element-plus'
import { useCanvasEditor } from '../injection'
const { exec } = useCanvasEditor()

const currentColor = ref('#000000')
const currentHighlight = ref('#ffff00')
const colorShow = ref(false)
const highlightShow = ref(false)

const presetColors = [
  '#000000',
  '#333333',
  '#666666',
  '#999999',
  '#CCCCCC',
  '#FFFFFF',
  '#FF0000',
  '#E74C3C',
  '#E67E22',
  '#F1C40F',
  '#2ECC71',
  '#1ABC9C',
  '#3498DB',
  '#9B59B6',
  '#8E44AD',
  '#1A5276',
  '#117A65',
  '#B9770E',
  '#C0392B',
  '#7F8C8D'
]
const highlightPresets = [
  '#ffff00',
  '#ff9900',
  '#ff0000',
  '#00ff00',
  '#00ffff',
  '#ff00ff',
  '#ffffcc',
  '#cce5ff',
  '#d4edda',
  '#f8d7da',
  '#fff3cd',
  '#e2e3e5',
  '#000000',
  '#ffffff'
]

function applyColor(c: string) {
  currentColor.value = c
  exec('executeColor', c)
  colorShow.value = false
}
function applyHighlight(c: string) {
  currentHighlight.value = c
  exec('executeHighlight', c)
  highlightShow.value = false
}
function onColorChange(v: string | null) {
  if (v) exec('executeColor', v)
}
function onHighlightChange(v: string | null) {
  if (v) exec('executeHighlight', v)
}
</script>

<style scoped>
.color-picker-popover {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 200;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 12px;
  min-width: 200px;
}
.color-picker-popover.right {
  left: auto;
  right: 0;
}
.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}
.color-preset {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #ddd;
  cursor: pointer;
}
.color-preset:hover {
  transform: scale(1.15);
}
.color-preset.active {
  border: 2px solid #1a73e8;
}
</style>
