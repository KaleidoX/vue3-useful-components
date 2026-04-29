declare module '@umoteam/editor' {
  import type { DefineComponent } from 'vue'
  export const UmoEditor: DefineComponent<{
    modelValue?: string
    config?: Record<string, unknown>
    [key: string]: unknown
  }>
}
declare module '@umoteam/editor/style'
