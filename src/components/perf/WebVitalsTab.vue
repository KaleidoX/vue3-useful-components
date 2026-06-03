<template>
  <div class="wv-tab">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-[11px] text-white/60 font-semibold">核心指标</span>
      <button class="perf-clear-btn" title="清空" @click="store.clearWebVitalsMetrics()">
        <i class="i-mdi-delete-outline text-sm" />
      </button>
    </div>

    <div v-if="hasData" class="wv-list">
      <div v-for="vt in vitals" :key="vt.name" class="wv-card">
        <div class="wv-name">{{ vt.name }}</div>
        <div class="wv-value">{{ formatValue(vt) }}</div>
        <div class="wv-bar-bg">
          <div
            class="wv-bar-fill"
            :style="{
              width:
                vt.rating === 'good' ? '33%' : vt.rating === 'needs-improvement' ? '66%' : '100%',
              backgroundColor: ratingColor(vt.rating)
            }"
          />
        </div>
      </div>
    </div>

    <div v-else class="flex flex-1 items-center justify-center">
      <span class="text-[11px] text-white/20">等待指标数据...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePerfStore } from './store'
import { ratingColor, formatMs } from './utils'
import type { IWebVitalRecord } from './types'

defineOptions({ name: 'WebVitalsTab' })

const store = usePerfStore()

const vitalOrder = ['FCP', 'LCP', 'FID', 'CLS', 'TTFB']

const vitals = computed((): (IWebVitalRecord & { key: string })[] => {
  return vitalOrder
    .filter((name) => store.metrics.webVitals[name])
    .map((name) => ({ key: name, ...store.metrics.webVitals[name] }))
})

const hasData = computed(() => vitals.value.length > 0)

function formatValue(vt: IWebVitalRecord): string {
  if (vt.name === 'CLS') return vt.value.toFixed(3)
  return formatMs(vt.value)
}
</script>

<style scoped lang="scss">
.wv-tab {
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

.wv-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wv-card {
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.wv-name {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 2px;
}

.wv-value {
  font-size: 16px;
  font-weight: 600;
  font-family: ui-monospace, monospace;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 4px;
}

.wv-bar-bg {
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.wv-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s;
}
</style>
