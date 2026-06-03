import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Router } from 'vue-router'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  IPerfSwitches,
  IFpsSample,
  IWebVitalRecord,
  INetworkRecord,
  IRouteRecord,
  ICustomRecord,
  IPerfMetrics,
  IRuntimeStats,
  PerfTab
} from './types'
import { fpsColor, nextId, getWebVitalRating, loadPosition } from './utils'

const FPS_MAX_SAMPLES = 60
const NETWORK_MAX_RECORDS = 100
const ROUTE_MAX_RECORDS = 20
const CUSTOM_MAX_RECORDS = 50

export const usePerfStore = defineStore('perf', () => {
  const visible = ref(true)
  const collapsed = ref(false)
  const switches = ref<IPerfSwitches>({
    fps: true,
    webVitals: true,
    network: true,
    route: true,
    custom: true
  })
  const activeTab = ref<PerfTab>('fps')
  const settingsOpen = ref(false)

  const savedPos = loadPosition()
  const posX = ref(savedPos?.x ?? 0)
  const posY = ref(savedPos?.y ?? 0)

  const metrics = ref<IPerfMetrics>({
    fps: [],
    webVitals: {},
    network: [],
    route: [],
    custom: []
  })

  let _router: Router | null = null
  let _axios: AxiosInstance | null = null
  let _rafId: number | null = null
  let _observer: PerformanceObserver | null = null
  let _routeStartTime = 0
  const _interceptorsRemoved = false
  let _nativeNetworkHooked = false
  let _origFetch: typeof window.fetch | null = null
  const _origXHROpen: typeof XMLHttpRequest.prototype.open | null = null
  const _origXHRSend: typeof XMLHttpRequest.prototype.send | null = null

  const currentFps = ref(0)

  const runtimeStats = computed<IRuntimeStats>(() => {
    const fps = currentFps.value
    let memoryMB = 0
    const perf = (performance as unknown) as Record<string, unknown>
    if (perf.memory && typeof (perf.memory as { usedJSHeapSize: number }).usedJSHeapSize === 'number') {
      memoryMB = (perf.memory as { usedJSHeapSize: number }).usedJSHeapSize / 1024 / 1024
    }
    const domNodes = document.querySelectorAll('*').length
    const networkCount = metrics.value.network.length
    return { fps, memoryMB: Math.round(memoryMB), domNodes, networkCount }
  })

  const fpsColorValue = computed(() => fpsColor(currentFps.value))

  function setSwitches(partial: Partial<IPerfSwitches>) {
    Object.assign(switches.value, partial)
    applySwitches()
  }

  function applySwitches() {
    const s = switches.value
    if (s.fps && visible.value) startFps()
    else stopFps()

    if (s.webVitals && visible.value) startWebVitals()
    else stopWebVitals()

    if (s.network) startNetwork()
    else stopNetwork()

    if (s.route) startRoute()
    else stopRoute()
  }

  function setPosition(x: number, y: number) {
    posX.value = x
    posY.value = y
  }

  function setActiveTab(tab: PerfTab) {
    activeTab.value = tab
  }

  function toggleVisible() {
    visible.value = !visible.value
    applySwitches()
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  function toggleSettings() {
    settingsOpen.value = !settingsOpen.value
  }

  // --- FPS ---
  let _lastFrameTime = 0
  let _frameCount = 0
  let _fpsTickAccum = 0

  function startFps() {
    if (_rafId !== null) return
    _lastFrameTime = performance.now()
    _frameCount = 0
    _fpsTickAccum = 0

    function tick() {
      const now = performance.now()
      _frameCount++
      _fpsTickAccum += now - _lastFrameTime
      _lastFrameTime = now

      if (_fpsTickAccum >= 1000) {
        const fps = Math.round((_frameCount * 1000) / _fpsTickAccum)
        currentFps.value = fps
        const sample: IFpsSample = { time: now, value: fps }
        metrics.value.fps.push(sample)
        if (metrics.value.fps.length > FPS_MAX_SAMPLES) {
          metrics.value.fps.shift()
        }
        _frameCount = 0
        _fpsTickAccum = 0
      }
      _rafId = requestAnimationFrame(tick)
    }
    _rafId = requestAnimationFrame(tick)
  }

  function stopFps() {
    if (_rafId !== null) {
      cancelAnimationFrame(_rafId)
      _rafId = null
    }
  }

  // --- Web Vitals ---
  function startWebVitals() {
    if (_observer) return
    try {
      _observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const name = entry.name
          let value: number
          let vitalName: string

          switch (entry.entryType) {
            case 'largest-contentful-paint':
              vitalName = 'LCP'
              value = entry.startTime
              break
            case 'first-input':
              vitalName = 'FID'
              value = (entry as PerformanceEventTiming).processingStart - entry.startTime
              break
            case 'layout-shift':
              vitalName = 'CLS'
              value = ((entry as unknown) as { value: number }).value ?? 0
              break
            case 'paint': {
              const paintEntry = entry as PerformancePaintTiming
              if (paintEntry.name === 'first-contentful-paint') {
                vitalName = 'FCP'
                value = paintEntry.startTime
              } else {
                continue
              }
              break
            }
            default:
              continue
          }

          const rating = getWebVitalRating(vitalName, value)
          metrics.value.webVitals[vitalName] = {
            name: vitalName,
            value: Math.round(value * 100) / 100,
            rating,
            timestamp: Date.now()
          }
        }
      })

      _observer.observe({ type: 'largest-contentful-paint', buffered: true })
      _observer.observe({ type: 'first-input', buffered: true })
      _observer.observe({ type: 'layout-shift', buffered: true })
      _observer.observe({ type: 'paint', buffered: true })

      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navEntry?.responseStart !== undefined) {
        const ttfb = navEntry.responseStart
        const rating = getWebVitalRating('TTFB', ttfb)
        metrics.value.webVitals['TTFB'] = {
          name: 'TTFB',
          value: Math.round(ttfb * 100) / 100,
          rating,
          timestamp: Date.now()
        }
      }
    } catch {
      // PerformanceObserver not supported
    }
  }

  function stopWebVitals() {
    if (_observer) {
      _observer.disconnect()
      _observer = null
    }
  }

  // --- Network ---
  function startNetwork() {
    if (!_axios || _interceptorsRemoved) return
    // Interceptors are installed once at init time - they check switches.value.network
  }

  function stopNetwork() {
    // Interceptors stay installed; they check switches.value.network before recording
  }

  function addNetworkRecord(record: INetworkRecord) {
    if (!switches.value.network) return
    metrics.value.network.push(record)
    if (metrics.value.network.length > NETWORK_MAX_RECORDS) {
      metrics.value.network.shift()
    }
  }

  function installInterceptor(axios: AxiosInstance) {
    _axios = axios

    axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (switches.value.network) {
        ((config as unknown) as Record<string, unknown>).__perfStartTime = performance.now()
      }
      return config
    })

    axios.interceptors.response.use(
      (res: AxiosResponse) => {
        if (switches.value.network) {
          const startTime = ((res.config as unknown) as Record<string, unknown>).__perfStartTime as number
          if (startTime) {
            const duration = performance.now() - startTime
            addNetworkRecord({
              id: nextId(),
              method: res.config.method?.toUpperCase() ?? 'GET',
              url: res.config.url ?? '',
              status: res.status,
              duration: Math.round(duration * 100) / 100,
              startTime
            })
          }
        }
        return res
      },
      (err: { config?: Record<string, unknown>; response?: { status: number }; message?: string }) => {
        if (switches.value.network) {
          const startTime = err.config?.__perfStartTime as number | undefined
          if (startTime) {
            const duration = performance.now() - startTime
            addNetworkRecord({
              id: nextId(),
              method: (err.config?.method as string)?.toUpperCase() ?? 'GET',
              url: (err.config?.url as string) ?? '',
              status: err.response?.status ?? 0,
              duration: Math.round(duration * 100) / 100,
              startTime,
              error: err.message
            })
          }
        }
        return Promise.reject(err)
      }
    )
  }

  function installNativeNetworkHooks() {
    if (_nativeNetworkHooked) return
    _nativeNetworkHooked = true

    _origFetch = window.fetch
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      if (!switches.value.network) {
        return (_origFetch as typeof fetch)(input, init)
      }
      const startTime = performance.now()
      const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : String(input))
      const method = (init?.method ?? 'GET').toUpperCase()

      return (_origFetch as typeof fetch)(input, init)
        .then((res) => {
          const duration = performance.now() - startTime
          addNetworkRecord({
            id: nextId(),
            method,
            url,
            status: res.status,
            duration: Math.round(duration * 100) / 100,
            startTime
          })
          return res
        })
        .catch((err) => {
          const duration = performance.now() - startTime
          addNetworkRecord({
            id: nextId(),
            method,
            url,
            status: 0,
            duration: Math.round(duration * 100) / 100,
            startTime,
            error: String(err)
          })
          throw err
        })
    }
  }

  function uninstallNativeNetworkHooks() {
    if (_origFetch) {
      window.fetch = _origFetch
      _origFetch = null
    }
    _nativeNetworkHooked = false
  }

  // --- Route ---
  function startRoute() {
    // Hooks are installed once - they check switches
  }

  function stopRoute() {
    // Hooks stay installed; they check switches
  }

  function addRouteRecord(record: IRouteRecord) {
    if (!switches.value.route) return
    metrics.value.route.push(record)
    if (metrics.value.route.length > ROUTE_MAX_RECORDS) {
      metrics.value.route.shift()
    }
  }

  function installRouterHook(router: Router) {
    _router = router
    router.beforeEach((_to, _from) => {
      if (switches.value.route) {
        _routeStartTime = performance.now()
      }
      return true
    })
    router.afterEach((to, from) => {
      if (switches.value.route && _routeStartTime > 0) {
        const duration = performance.now() - _routeStartTime
        addRouteRecord({
          from: (from?.fullPath as string) ?? '/',
          to: (to?.fullPath as string) ?? '/',
          duration: Math.round(duration * 100) / 100,
          timestamp: Date.now()
        })
        _routeStartTime = 0
      }
    })
  }

  // --- Custom ---
  function customMark(name: string, duration: number, meta?: Record<string, unknown>) {
    if (!switches.value.custom) return
    const record: ICustomRecord = {
      name,
      duration: Math.round(duration * 100) / 100,
      timestamp: Date.now(),
      meta
    }
    metrics.value.custom.push(record)
    if (metrics.value.custom.length > CUSTOM_MAX_RECORDS) {
      metrics.value.custom.shift()
    }
  }

  // --- Clear ---
  function clearMetrics() {
    metrics.value.fps = []
    metrics.value.webVitals = {}
    metrics.value.network = []
    metrics.value.route = []
    metrics.value.custom = []
  }

  function clearFpsMetrics() {
    metrics.value.fps = []
  }

  function clearWebVitalsMetrics() {
    metrics.value.webVitals = {}
  }

  function clearNetworkMetrics() {
    metrics.value.network = []
  }

  function clearRouteMetrics() {
    metrics.value.route = []
  }

  function clearCustomMetrics() {
    metrics.value.custom = []
  }

  // --- Init ---
  function init() {
    installNativeNetworkHooks()
    applySwitches()
  }

  return {
    visible,
    collapsed,
    switches,
    activeTab,
    settingsOpen,
    posX,
    posY,
    metrics,
    currentFps,
    runtimeStats,
    fpsColorValue,
    setSwitches,
    setPosition,
    setActiveTab,
    toggleVisible,
    toggleCollapsed,
    toggleSettings,
    installInterceptor,
    installRouterHook,
    customMark,
    clearMetrics,
    clearFpsMetrics,
    clearWebVitalsMetrics,
    clearNetworkMetrics,
    clearRouteMetrics,
    clearCustomMetrics,
    init
  }
})
