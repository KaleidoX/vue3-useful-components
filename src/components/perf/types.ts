export interface IPerfSwitches {
  fps: boolean
  webVitals: boolean
  network: boolean
  route: boolean
  custom: boolean
}

export interface IFpsSample {
  time: number
  value: number
}

export interface IWebVitalRecord {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export interface INetworkRecord {
  id: string
  method: string
  url: string
  status: number
  duration: number
  startTime: number
  error?: string
}

export interface IRouteRecord {
  from: string
  to: string
  duration: number
  timestamp: number
}

export interface ICustomRecord {
  name: string
  duration: number
  timestamp: number
  meta?: Record<string, unknown>
}

export interface IPerfMetrics {
  fps: IFpsSample[]
  webVitals: Record<string, IWebVitalRecord>
  network: INetworkRecord[]
  route: IRouteRecord[]
  custom: ICustomRecord[]
}

export interface IRuntimeStats {
  fps: number
  memoryMB: number
  domNodes: number
  networkCount: number
}

export type PerfTab = 'fps' | 'webVitals' | 'network' | 'route' | 'custom'
