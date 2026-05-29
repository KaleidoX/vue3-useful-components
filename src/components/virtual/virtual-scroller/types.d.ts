declare module 'vue-virtual-scroller' {
  import type { DefineComponent } from 'vue'

  interface RecycleScrollerProps {
    items: unknown[]
    itemSize: number | null
    keyField?: string
    direction?: 'vertical' | 'horizontal'
    prerender?: number
    buffer?: number
    pageMode?: boolean
    emitUpdate?: boolean
    listTag?: string
    itemTag?: string
    class?: string
    style?: Record<string, string>
    onScroll?: (event: Event) => void
    onResize?: () => void
    onVisible?: () => void
    onHidden?: () => void
    onUpdate?: (startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) => void
  }

  interface DynamicScrollerProps {
    items: unknown[]
    minItemSize: number
    keyField?: string
    direction?: 'vertical' | 'horizontal'
    prerender?: number
    buffer?: number
    pageMode?: boolean
    listTag?: string
    itemTag?: string
  }

  export const RecycleScroller: DefineComponent<RecycleScrollerProps>
  export const DynamicScroller: DefineComponent<DynamicScrollerProps>
  export const DynamicScrollerItem: DefineComponent<{
    item: unknown
    active: boolean
    sizeDependencies: unknown[]
    dataIndex: number
    watchData?: boolean
    tag?: string
    onResize?: () => void
    'on-size-change'?: (size: number) => void
  }>
}

declare module 'vue-virtual-scroller/dist/vue-virtual-scroller.css' {
  const css: string
  export default css
}
