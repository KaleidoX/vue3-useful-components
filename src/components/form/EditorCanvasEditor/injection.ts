import type { InjectionKey, Ref, ShallowRef } from 'vue'

export interface RangeStylePayload {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikeout?: boolean
  font?: string
  size?: number
  type?: string
}

export interface PageState {
  currentPage: Ref<number>
  totalPages: Ref<number>
  wordCount: Ref<number>
  lineCount: Ref<number>
  colCount: Ref<number>
  currentMode: Ref<string>
  isPaging: Ref<boolean>
  cycleMode: () => void
  togglePageMode: () => void
}

export interface CanvasEditorContext {
  editor: ShallowRef<any>
  exec: (name: string, ...args: any[]) => any
  rangeStyle: Readonly<RangeStylePayload>
  pageState: PageState
}

export const CANVAS_EDITOR_KEY: InjectionKey<CanvasEditorContext> = Symbol('canvas-editor')

export function useCanvasEditor() {
  const ctx = inject(CANVAS_EDITOR_KEY)
  if (!ctx) throw new Error('useCanvasEditor() must be used inside <EditorCanvasEditor>')
  return ctx
}
