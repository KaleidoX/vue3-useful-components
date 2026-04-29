import 'vue-router'

declare module 'vue-router' {
  export interface RouteMeta {
    title?: string
    description?: string
    inHomeLayout?: boolean
    groupKey?: string
    groupLabel?: string
    groupDescription?: string
    fullPath?: string
  }
}
