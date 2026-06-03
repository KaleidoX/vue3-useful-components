<template>
  <div class="menu-right">
    <div title="缩小" @click="exec('executePageScaleMinus')"><i class="i-lucide:zoom-out" /></div>
    <div class="page-scale-percentage" @click="exec('executePageScaleRecovery')">{{ scale }}%</div>
    <div title="放大" @click="exec('executePageScaleAdd')"><i class="i-lucide:zoom-in" /></div>
    <div class="editor-mode" title="切换模式" @click="cycleMode">{{ mode }}</div>
    <div title="页面模式" @click="toggleDropdown('pm')">
      <i class="i-lucide:layout-template" />
      <div v-show="ds.pm" class="menu-options" style="right: 0; left: auto" @click.stop>
        <li
          @click="
            exec('executePageMode', 'page')
            ds.pm = false
          "
        >
          分页模式
        </li>
        <li
          @click="
            exec('executePageMode', 'continuous')
            ds.pm = false
          "
        >
          连续模式
        </li>
      </div>
    </div>
    <div title="全屏" @click="toggleFullscreen"><i class="i-lucide:maximize" /></div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CanvasRightTools' })
import { useCanvasEditor } from '../injection'
const { exec } = useCanvasEditor()
const scale = ref(100)
const mode = ref('编辑模式')
const ds = reactive<Record<string, boolean>>({})

const modes = ['编辑模式', '清洁模式', '只读模式', '表单模式', '打印模式', '设计模式', '涂鸦模式']
const modeKeys = ['edit', 'clean', 'readonly', 'form', 'print', 'design', 'graffiti']
let modeIndex = 0

function toggleDropdown(k: string) {
  ds[k] = !ds[k]
}
function cycleMode() {
  modeIndex = (modeIndex + 1) % modes.length
  mode.value = modes[modeIndex]
  exec('executeMode', modeKeys[modeIndex])
}
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen()
}
</script>
