<template>
  <div v-if="store.visible" class="perf-panel-container" :style="containerStyle">
    <div
      v-if="store.collapsed"
      class="perf-float-circle cursor-pointer select-none"
      :style="{ '--fps-color': store.fpsColorValue }"
      @dblclick="store.toggleCollapsed()"
    >
      <template v-if="store.switches.fps">
        <span class="text-lg font-bold" :style="{ color: store.fpsColorValue }">
          {{ store.currentFps }}
        </span>
        <span class="text-[10px] text-gray-400">FPS</span>
      </template>
      <span v-else class="text-[10px] text-gray-400">PERF</span>
    </div>

    <div
      v-else
      ref="panelEl"
      class="perf-panel"
      :class="{ 'perf-panel-active': isHovering }"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <div ref="headerEl" class="perf-header cursor-move select-none" @mousedown="onHeaderMouseDown">
        <span class="text-xs font-semibold text-white/90">⚡ 性能监控</span>
        <div class="flex items-center gap-1">
          <span
            class="text-[11px] font-mono text-white/80"
            :style="{ color: store.fpsColorValue }"
          >
            FPS:{{ store.switches.fps ? store.currentFps : '--' }}
          </span>
          <button class="perf-btn" title="设置" @click="store.toggleSettings()">
            <i class="i-mdi-cog text-sm" />
          </button>
          <button class="perf-btn" title="折叠" @click="store.toggleCollapsed()">
            <i class="i-mdi-minus text-sm" />
          </button>
          <button class="perf-btn" title="关闭" @click="store.toggleVisible()">
            <i class="i-mdi-close text-sm" />
          </button>
        </div>
      </div>

      <div class="perf-tabs">
        <div class="perf-tabs-scroll">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="perf-tab-btn"
            :class="{ 'perf-tab-active': store.activeTab === tab.key }"
            @click="store.setActiveTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="perf-content" :class="{ 'perf-content-overlay': store.settingsOpen }">
        <SettingsPanel v-if="store.settingsOpen" />
        <template v-if="!store.settingsOpen">
          <FpsTab v-if="store.activeTab === 'fps'" />
          <WebVitalsTab v-else-if="store.activeTab === 'webVitals'" />
          <NetworkTab v-else-if="store.activeTab === 'network'" />
          <RouteTab v-else-if="store.activeTab === 'route'" />
          <CustomTab v-else-if="store.activeTab === 'custom'" />
        </template>
      </div>

      <div class="perf-footer">
        <span class="perf-stat">
          <span class="i-mdi-routes text-xs text-blue-400" /> R:{{ store.runtimeStats.networkCount }}
        </span>
        <span class="perf-stat">
          <span class="i-mdi-code-tags text-xs text-purple-400" /> D:{{ store.runtimeStats.domNodes }}
        </span>
        <span class="perf-stat">
          <span class="i-mdi-memory text-xs text-green-400" /> {{ store.runtimeStats.memoryMB }}MB
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watchEffect } from 'vue'
import { usePerfStore } from './store'
import SettingsPanel from './SettingsPanel.vue'
import FpsTab from './FpsTab.vue'
import WebVitalsTab from './WebVitalsTab.vue'
import NetworkTab from './NetworkTab.vue'
import RouteTab from './RouteTab.vue'
import CustomTab from './CustomTab.vue'
import { savePosition } from './utils'
import type { PerfTab } from './types'

defineOptions({ name: 'PerfPanel' })

const store = usePerfStore()
const isHovering = ref(false)

const panelEl = ref<HTMLElement | null>(null)
const headerEl = ref<HTMLElement | null>(null)

const tabs: { key: PerfTab; label: string }[] = [
  { key: 'fps', label: 'FPS' },
  { key: 'webVitals', label: 'Web Vitals' },
  { key: 'network', label: '网络' },
  { key: 'route', label: '路由' },
  { key: 'custom', label: '自定义' }
]

const pos = reactive({ x: store.posX, y: store.posY })

const containerStyle = reactive<Record<string, string>>({
  position: 'fixed',
  zIndex: '9999',
  left: '0px',
  top: '0px'
})

watchEffect(() => {
  containerStyle.left = `${pos.x}px`
  containerStyle.top = `${pos.y}px`
})

let dragging = false
let dragStartX = 0
let dragStartY = 0
let dragOrigX = 0
let dragOrigY = 0

function onHeaderMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement)?.closest('button')) return
  dragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragOrigX = pos.x
  dragOrigY = pos.y
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!dragging) return
  pos.x = Math.max(0, dragOrigX + e.clientX - dragStartX)
  pos.y = Math.max(0, dragOrigY + e.clientY - dragStartY)
}

function onMouseUp() {
  if (!dragging) return
  dragging = false
  store.setPosition(pos.x, pos.y)
  savePosition(pos.x, pos.y)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})
</script>

<style scoped lang="scss">
.perf-panel-container {
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.perf-float-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid var(--fps-color, #22c55e);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
}

.perf-panel {
  width: 380px;
  max-height: min(520px, 80vh);
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0.85;
  transition: opacity 0.15s;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.perf-panel-active {
  opacity: 1;
}

.perf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.perf-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
}

.perf-tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.perf-tabs-scroll {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.perf-tab-btn {
  flex-shrink: 0;
  padding: 5px 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
}

.perf-tab-active {
  color: white;
  border-bottom-color: var(--fps-good, #22c55e);
}

.perf-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  position: relative;
}

.perf-content-overlay {
  overflow: hidden;
  padding: 8px;
}

.perf-content:not(.perf-content-overlay) {
  padding: 8px;
}

.perf-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}

.perf-stat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-family: ui-monospace, monospace;
}
</style>
