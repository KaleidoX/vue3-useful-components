<template>
  <div class="custom-tab">
    <div class="flex items-center justify-between mb-2">
      <span class="text-[11px] font-semibold text-white/60">自定义埋点</span>
      <button class="perf-clear-btn" title="清空" @click="store.clearCustomMetrics()">
        <i class="i-mdi-delete-outline text-sm" />
      </button>
    </div>

    <div v-if="records.length > 0">
      <div class="custom-summary">
        <span>共 {{ summary.count }} 个</span>
        <span>avg {{ summary.avg }}ms</span>
        <span>max {{ summary.max }}ms</span>
      </div>

      <div class="custom-list">
        <div v-for="r in records" :key="r.timestamp" class="custom-item">
          <span class="custom-time">{{ formatTime(r.timestamp) }}</span>
          <span class="custom-name">{{ r.name }}</span>
          <span class="custom-dur" :style="{ color: durationColor(r.duration) }">
            {{ r.duration.toFixed(0) }}ms
          </span>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center py-8">
      <span class="text-[11px] text-white/20">
        调用 <code class="text-white/30">usePerfStore().customMark()</code> 添加埋点
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePerfStore } from './store'
import { formatTime } from './utils'

defineOptions({ name: 'CustomTab' })

const store = usePerfStore()

const records = computed(() => {
  return [...store.metrics.custom].reverse()
})

const summary = computed(() => {
  const list = store.metrics.custom
  if (list.length === 0) return { count: 0, avg: 0, max: 0 }
  const values = list.map((r) => r.duration)
  return {
    count: list.length,
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    max: Math.max(...values)
  }
})

function durationColor(dur: number): string {
  if (dur < 16) return 'var(--fps-good, #22c55e)'
  if (dur < 100) return 'var(--fps-warn, #eab308)'
  return 'var(--fps-poor, #ef4444)'
}
</script>

<style scoped lang="scss">
.custom-tab {
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

.custom-summary {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  font-family: ui-monospace, monospace;
  margin-bottom: 6px;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.custom-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
}

.custom-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  border-radius: 3px;
  transition: background 0.1s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

.custom-time {
  color: rgba(255, 255, 255, 0.3);
  min-width: 48px;
  flex-shrink: 0;
}

.custom-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-dur {
  min-width: 40px;
  text-align: right;
  flex-shrink: 0;
  font-weight: 600;
}
</style>
