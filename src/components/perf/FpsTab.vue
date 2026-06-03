<template>
  <div class="fps-tab">
    <div class="mb-2 flex items-center justify-between">
      <div class="fps-current" :style="{ color: fpsColorStr }">
        {{ store.currentFps }}
        <span class="fps-unit">fps</span>
      </div>
      <button class="perf-clear-btn" title="清空" @click="store.clearFpsMetrics()">
        <i class="i-mdi-delete-outline text-sm" />
      </button>
    </div>

    <div
      v-if="chartPoints.length > 1"
      class="fps-chart-wrap"
      @mousemove="onChartHover"
      @mouseleave="hoveredIndex = -1"
    >
      <svg class="fps-chart" viewBox="0 0 300 100" preserveAspectRatio="none">
        <polyline
          :points="chartPoints"
          fill="none"
          :stroke="fpsColorStr"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-if="hoveredSample"
          :cx="hoveredSample.cx"
          :cy="hoveredSample.cy"
          r="4"
          :fill="fpsColorStr"
          stroke="white"
          stroke-width="1.5"
        />
      </svg>
      <div
        v-if="hoveredSample"
        class="fps-tooltip"
        :style="{ left: hoveredSample.tooltipX + 'px', bottom: '100%' }"
      >
        FPS: {{ hoveredSample.value }} @ {{ hoveredSample.t }}
      </div>
    </div>
    <div v-else class="flex flex-1 items-center justify-center">
      <span class="text-[11px] text-white/30">采集 FPS 数据中...</span>
    </div>

    <div v-if="stats.count > 0" class="fps-stats">
      <span>min:{{ stats.min }}</span>
      <span>max:{{ stats.max }}</span>
      <span>avg:{{ stats.avg }}</span>
    </div>
    <div v-else class="fps-stats">
      <span class="text-white/20">等待数据...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePerfStore } from './store'
import { fpsColor, formatTime } from './utils'

defineOptions({ name: 'FpsTab' })

const store = usePerfStore()

const fpsColorStr = computed(() => fpsColor(store.currentFps))

const samplesForChart = computed(() => store.metrics.fps)

interface IChartSample {
  cx: number
  cy: number
  value: number
  t: string
  tooltipX: number
}

const hoveredIndex = ref(-1)

const hoveredSample = computed<IChartSample | null>(() => {
  const samples = samplesForChart.value
  const idx = hoveredIndex.value
  if (idx < 0 || idx >= samples.length) return null
  const s = samples[idx]
  const maxVal = Math.max(...samples.map((a) => a.value), 60)
  const minVal = Math.min(...samples.map((a) => a.value), 0)
  const range = maxVal - minVal || 1
  const x = (idx / Math.max(samples.length - 1, 1)) * 300
  const y = 100 - ((s.value - minVal) / range) * 90 - 5
  return {
    cx: x,
    cy: y,
    value: s.value,
    t: formatTime(s.time),
    tooltipX: x
  }
})

function onChartHover(e: MouseEvent) {
  const samples = samplesForChart.value
  if (samples.length < 2) return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const relX = ((e.clientX - rect.left) / rect.width) * 300
  const idx = Math.round((relX / 300) * (samples.length - 1))
  hoveredIndex.value = Math.max(0, Math.min(samples.length - 1, idx))
}

const chartPoints = computed(() => {
  const samples = samplesForChart.value
  if (samples.length < 2) return ''
  const maxVal = Math.max(...samples.map((s) => s.value), 60)
  const minVal = Math.min(...samples.map((s) => s.value), 0)
  const range = maxVal - minVal || 1

  return samples
    .map((s, i) => {
      const x = (i / (samples.length - 1)) * 300
      const y = 100 - ((s.value - minVal) / range) * 90 - 5
      return `${x},${y}`
    })
    .join(' ')
})

const stats = computed(() => {
  const samples = samplesForChart.value
  if (samples.length === 0) return { min: 0, max: 0, avg: 0, count: 0 }
  const values = samples.map((s) => s.value)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    count: values.length
  }
})
</script>

<style scoped lang="scss">
.fps-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.fps-current {
  font-size: 28px;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  line-height: 1;
}

.fps-unit {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.6;
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

.fps-chart-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
}

.fps-chart {
  width: 100%;
  height: 100%;
}

.fps-tooltip {
  position: absolute;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  margin-bottom: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.fps-stats {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  font-family: ui-monospace, monospace;
}
</style>
