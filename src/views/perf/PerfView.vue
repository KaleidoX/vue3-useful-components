<template>
  <div class="perf-view">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-slate-900 mb-2">性能监控面板</h2>
      <p class="text-sm text-slate-500 leading-6">
        右键点击页面，浮动性能监控面板会显示在右下角。<br />
        可拖拽、折叠、切换不同监控维度，支持 FPS、Web Vitals、网络请求、路由性能和自定义埋点。
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="border border-base-400/80 rounded-2xl bg-white p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">使用方式</h3>
        <div class="space-y-3">
          <div class="text-xs text-slate-500 leading-relaxed">
            <p class="font-medium text-slate-600 mb-1">1. 安装注册（main.ts）</p>
            <pre class="bg-slate-50 rounded-lg p-3 text-[11px] overflow-x-auto">{{ installCode }}</pre>
          </div>
          <div class="text-xs text-slate-500 leading-relaxed">
            <p class="font-medium text-slate-600 mb-1">2. 组件内埋点</p>
            <pre class="bg-slate-50 rounded-lg p-3 text-[11px] overflow-x-auto">{{ markCode }}</pre>
          </div>
        </div>
      </div>

      <div class="border border-base-400/80 rounded-2xl bg-white p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">自定义埋点测试</h3>
        <div class="space-y-3">
          <button
            v-for="test in tests"
            :key="test.label"
            class="w-full rounded-xl bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 hover:bg-primary-100 transition-colors"
            @click="runTest(test)"
          >
            <span class="font-medium">{{ test.label }}</span>
            <span class="text-xs text-slate-400 ml-2">+{{ test.delay.toFixed(0) }}ms 模拟</span>
          </button>
        </div>
        <p v-if="lastResult" class="mt-3 text-xs text-green-600">
          已记录: {{ lastResult }}
        </p>
      </div>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <div class="border border-base-400/80 rounded-2xl bg-white p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">网络请求测试</h3>
        <p class="text-xs text-slate-400 mb-3">发送真实请求以验证网络监控 tab</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="req in netTests"
            :key="req.label"
            class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-primary-100 transition-colors"
            :disabled="req.loading"
            @click="runNetTest(req)"
          >
            {{ req.loading ? '请求中...' : req.label }}
          </button>
        </div>
        <p v-if="netResult" class="mt-2 text-xs" :class="netError ? 'text-red-500' : 'text-green-600'">
          {{ netResult }}
        </p>
      </div>

      <div class="border border-base-400/80 rounded-2xl bg-white p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">axios 请求测试</h3>
        <p class="text-xs text-slate-400 mb-3">触发 axios 拦截器</p>
        <button
          class="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-primary-100 transition-colors"
          :disabled="axiosLoading"
          @click="runAxiosTest"
        >
          {{ axiosLoading ? '请求中...' : '发送请求' }}
        </button>
        <p v-if="axiosResult" class="mt-2 text-xs" :class="axiosError ? 'text-red-500' : 'text-green-600'">
          {{ axiosResult }}
        </p>
      </div>
    </div>

    <div class="mt-6 border border-base-400/80 rounded-2xl bg-white p-5">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">当前性能数据概览</h3>
      <div class="grid grid-cols-4 gap-4 text-center">
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-2xl font-bold font-mono" :style="{ color: fpsColor(store.currentFps) }">
            {{ store.switches.fps ? store.currentFps : '--' }}
          </div>
          <div class="text-[10px] text-slate-400 mt-1">FPS</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-2xl font-bold font-mono text-slate-700">
            {{ store.runtimeStats.networkCount }}
          </div>
          <div class="text-[10px] text-slate-400 mt-1">请求数</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-2xl font-bold font-mono text-slate-700">
            {{ store.runtimeStats.domNodes }}
          </div>
          <div class="text-[10px] text-slate-400 mt-1">DOM 节点</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-2xl font-bold font-mono text-slate-700">
            {{ store.runtimeStats.memoryMB }}MB
          </div>
          <div class="text-[10px] text-slate-400 mt-1">内存</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePerfStore } from '@/components/perf'
import { fpsColor } from '@/components/perf/utils'
import request from '@/utils/request'

defineOptions({ name: 'PerfView' })

const store = usePerfStore()
const lastResult = ref('')
const netResult = ref('')
const netError = ref(false)
const axiosResult = ref('')
const axiosError = ref(false)
const axiosLoading = ref(false)

const installCode = `import { installPerfMonitor } from '@/components/perf'
installPerfMonitor(app, { router, axios: request })`

const markCode = `import { usePerfStore } from '@/components/perf'
const perf = usePerfStore()

const start = performance.now()
doWork()
perf.customMark('数据计算', performance.now() - start)`

const tests = [
  { label: '模拟数据计算', delay: 50 },
  { label: '模拟 DOM 操作', delay: 120 },
  { label: '模拟网络延迟', delay: 300 },
  { label: '模拟大量渲染', delay: 500 }
]

const netTests = reactive([
  { label: 'GET /', url: '/', loading: false },
  { label: 'GET 404', url: '/nonexistent', loading: false },
  { label: 'GET favicon', url: '/favicon.ico', loading: false },
  { label: 'GET 慢速', url: '/?slow=1', loading: false }
])

function runTest(test: { label: string; delay: number }) {
  const start = performance.now()
  const delay = test.delay + Math.random() * test.delay * 0.5
  const end = start + delay
  while (performance.now() < end) {
    // burn CPU
  }
  const duration = performance.now() - start
  store.customMark(test.label, duration)
  lastResult.value = `${test.label}: ${duration.toFixed(1)}ms`
}

async function runNetTest(req: { url: string; loading: boolean; label: string }) {
  req.loading = true
  netError.value = false
  const start = performance.now()
  try {
    const res = await fetch(req.url)
    const dur = (performance.now() - start).toFixed(0)
    netResult.value = `${res.status} ${res.statusText} (${dur}ms)`
  } catch (e: unknown) {
    netError.value = true
    const dur = (performance.now() - start).toFixed(0)
    netResult.value = `请求失败 (${dur}ms)`
  }
  req.loading = false
}

async function runAxiosTest() {
  axiosLoading.value = true
  axiosError.value = false
  try {
    await request.get('/')
    axiosResult.value = '请求成功，查看网络 tab'
  } catch {
    axiosError.value = true
    axiosResult.value = '请求失败（跨域或网络不通）'
  }
  axiosLoading.value = false
}
</script>
