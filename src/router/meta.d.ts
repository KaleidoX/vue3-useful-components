import 'vue-router'

import type { EditorCapabilityMeta } from './editorCapabilities'

declare module 'vue-router' {
  export interface RouteMeta {
    title?: string
    description?: string
    inHomeLayout?: boolean
    groupKey?: string
    groupLabel?: string
    groupDescription?: string
    fullPath?: string
    editorCapability?: EditorCapabilityMeta
  }
}
