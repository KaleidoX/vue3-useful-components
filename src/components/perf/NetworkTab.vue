<template>
  <div class="network-tab">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-[11px] text-white/60 font-semibold">请求统计</span>
      <button class="perf-clear-btn" title="清空" @click="store.clearNetworkMetrics()">
        <i class="i-mdi-delete-outline text-sm" />
      </button>
    </div>

    <div v-if="records.length > 0">
      <div class="net-summary">
        <span>共 {{ summary.count }} 次</span>
        <span>avg {{ summary.avg }}ms</span>
        <span :style="{ color: summary.errorRate > 0 ? 'var(--fps-poor, #ef4444)' : '' }">
          err {{ summary.errorRate }}%
        </span>
      </div>

      <div class="net-list">
        <div v-for="r in records" :key="r.id" class="net-item">
          <span class="net-method">{{ r.method }}</span>
          <span class="net-url" :title="r.url">{{ truncateUrl(r.url) }}</span>
          <span class="net-dur">{{ r.duration.toFixed(0) }}ms</span>
          <span class="net-status" :style="{ color: statusColor(r.status) }">
            {{ r.status || 'ERR' }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-1 items-center justify-center py-8">
      <span class="text-[11px] text-white/20">暂无机请求</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePerfStore } from './store'
import { statusColor } from './utils'

defineOptions({ name: 'NetworkTab' })

const store = usePerfStore()

const records = computed(() => {
  const list = store.metrics.network
  return [...list].reverse()
})

const summary = computed(() => {
  const list = store.metrics.network
  if (list.length === 0) return { count: 0, avg: 0, errorRate: 0 }
  const total = list.reduce((a, r) => a + r.duration, 0)
  const errors = list.filter((r) => r.status >= 400 || r.status === 0 || r.error).length
  return {
    count: list.length,
    avg: Math.round(total / list.length),
    errorRate: Math.round((errors / list.length) * 100)
  }
})

function truncateUrl(url: string): string {
  if (url.length <= 35) return url
  return url.slice(0, 30) + '...'
}
</script>

<style scoped lang="scss">
.network-tab {
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

.net-summary {
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

.net-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 260px;
  overflow-y: auto;
}

.net-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 6px;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  border-radius: 3px;
  transition: background 0.1s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

.net-method {
  color: rgba(255, 255, 255, 0.4);
  min-width: 28px;
  flex-shrink: 0;
}

.net-url {
  flex: 1;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.net-dur {
  min-width: 44px;
  text-align: right;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.net-status {
  min-width: 22px;
  text-align: right;
  flex-shrink: 0;
  font-weight: 600;
}
</style>
