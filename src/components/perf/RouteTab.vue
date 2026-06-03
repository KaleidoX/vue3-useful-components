<template>
  <div class="route-tab">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-[11px] text-white/60 font-semibold">路由切换耗时</span>
      <button class="perf-clear-btn" title="清空" @click="store.clearRouteMetrics()">
        <i class="i-mdi-delete-outline text-sm" />
      </button>
    </div>

    <div v-if="records.length > 0" class="route-list">
      <div v-for="r in records" :key="r.timestamp" class="route-item">
        <span class="route-time">{{ formatTime(r.timestamp) }}</span>
        <span class="route-path">{{ truncate(r.from) }}</span>
        <span class="i-mdi-arrow-right text-[10px] text-white/20" />
        <span class="route-path">{{ truncate(r.to) }}</span>
        <span class="route-dur" :style="{ color: durationColor(r.duration) }">
          {{ r.duration.toFixed(0) }}ms
        </span>
      </div>
    </div>

    <div v-else class="flex flex-1 items-center justify-center py-8">
      <span class="text-[11px] text-white/20">暂无路由切换记录</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePerfStore } from './store'
import { formatTime } from './utils'

defineOptions({ name: 'RouteTab' })

const store = usePerfStore()

const records = computed(() => {
  return [...store.metrics.route].reverse()
})

function truncate(path: string): string {
  if (path.length <= 18) return path
  return '...' + path.slice(-15)
}

function durationColor(dur: number): string {
  if (dur < 100) return 'var(--fps-good, #22c55e)'
  if (dur < 300) return 'var(--fps-warn, #eab308)'
  return 'var(--fps-poor, #ef4444)'
}
</script>

<style scoped lang="scss">
.route-tab {
  display: flex;
  flex-direction: column;
}

.perf-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: rgba(239, 68, 68, 0.7);
  }
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
}

.route-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  border-radius: 3px;
  transition: background 0.1s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

.route-time {
  color: rgba(255, 255, 255, 0.3);
  min-width: 48px;
  flex-shrink: 0;
}

.route-path {
  color: rgba(255, 255, 255, 0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-dur {
  min-width: 40px;
  text-align: right;
  flex-shrink: 0;
  font-weight: 600;
}
</style>
