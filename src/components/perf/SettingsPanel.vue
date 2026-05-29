<template>
  <div class="settings-overlay">
    <div class="settings-panel">
      <div class="settings-title">监控开关</div>
      <div class="settings-list">
        <label v-for="item in switchItems" :key="item.key" class="settings-item">
          <span class="settings-label">{{ item.label }}</span>
          <button
            class="settings-toggle"
            :class="{ 'settings-toggle-on': item.value }"
            @click="store.setSwitches({ [item.key]: !item.value })"
          >
            <span class="settings-toggle-dot" />
          </button>
        </label>
      </div>
      <button class="settings-clear-all" @click="store.clearMetrics()">
        清空全部数据
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePerfStore } from './store'

defineOptions({ name: 'SettingsPanel' })

const store = usePerfStore()

const switchItems = computed(() => [
  { key: 'fps', label: 'FPS 帧率', value: store.switches.fps },
  { key: 'webVitals', label: 'Web Vitals', value: store.switches.webVitals },
  { key: 'network', label: '网络请求', value: store.switches.network },
  { key: 'route', label: '路由性能', value: store.switches.route },
  { key: 'custom', label: '自定义埋点', value: store.switches.custom }
])
</script>

<style scoped lang="scss">
.settings-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.settings-panel {
  width: 220px;
  background: rgba(30, 40, 60, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px;
}

.settings-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.settings-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.settings-toggle {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  padding: 0;
}

.settings-toggle-on {
  background: var(--fps-good, #22c55e);
}

.settings-toggle-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
}

.settings-toggle-on .settings-toggle-dot {
  transform: translateX(16px);
}

.settings-clear-all {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 5px 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(239, 68, 68, 0.25);
  }
}
</style>
