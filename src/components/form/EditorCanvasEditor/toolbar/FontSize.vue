<template>
  <div class="menu-item">
    <div class="menu-item__font" @click="toggleDropdown('font')">
      <span>{{ currentFont }}</span>
      <div v-show="ds.font" class="menu-options" @click.stop>
        <li
          v-for="f in fontList"
          :key="f"
          :class="{ active: currentFont === f }"
          @click="applyFont(f)"
        >
          {{ f }}
        </li>
      </div>
    </div>
    <div class="menu-item__size" @click="toggleDropdown('size')">
      <span>{{ currentSize }}</span>
      <div v-show="ds.size" class="menu-options" @click.stop>
        <li
          v-for="s in sizeList"
          :key="s"
          :class="{ active: currentSize === s }"
          @click="applySize(s)"
        >
          {{ s }}
        </li>
      </div>
    </div>
    <div title="增大字号" @click="exec('executeSizeAdd')"><i class="i-lucide:plus" /></div>
    <div title="减小字号" @click="exec('executeSizeMinus')"><i class="i-lucide:minus" /></div>
  </div>
</template>

<script lang="ts" setup>
import { useCanvasEditor } from '../injection'
const { exec } = useCanvasEditor()

const ds = reactive<Record<string, boolean>>({})
const currentFont = ref('微软雅黑')
const currentSize = ref(16)
const fontList = [
  '微软雅黑',
  '宋体',
  '楷体',
  '仿宋',
  '黑体',
  'Arial',
  'Times New Roman',
  'Courier New'
]
const sizeList = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72]

function toggleDropdown(k: string) {
  ds[k] = !ds[k]
}
function applyFont(f: string) {
  exec('executeFont', f)
  currentFont.value = f
  ds.font = false
}
function applySize(s: number) {
  exec('executeSize', s)
  currentSize.value = s
  ds.size = false
}
</script>
