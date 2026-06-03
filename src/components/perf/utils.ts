const STORAGE_KEY = '__perf_panel_pos__'

export function loadPosition(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return null
}

export function savePosition(x: number, y: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }))
  } catch {
    // ignore
  }
}

export function formatMs(value: number): string {
  if (value < 1) return `${(value * 1000).toFixed(0)}μs`
  if (value < 1000) return `${value.toFixed(1)}ms`
  return `${(value / 1000).toFixed(2)}s`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function fpsColor(fps: number): string {
  if (fps >= 55) return 'var(--fps-good, #22c55e)'
  if (fps >= 30) return 'var(--fps-warn, #eab308)'
  return 'var(--fps-poor, #ef4444)'
}

export function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'var(--fps-good, #22c55e)'
  if (status >= 300 && status < 400) return '#3b82f6'
  if (status >= 400 && status < 500) return 'var(--fps-warn, #eab308)'
  return 'var(--fps-poor, #ef4444)'
}

export function ratingColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return 'var(--fps-good, #22c55e)'
    case 'needs-improvement':
      return 'var(--fps-warn, #eab308)'
    case 'poor':
      return 'var(--fps-poor, #ef4444)'
  }
}

let _idCounter = 0

export function nextId(): string {
  _idCounter++
  return `${Date.now()}-${_idCounter}`
}

const WEB_VITALS_THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
}

export function getWebVitalRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name]
  if (!thresholds) return 'good'
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}
