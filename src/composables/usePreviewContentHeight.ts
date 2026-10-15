import { useWindowSize } from '@vueuse/core'

/**
 * 消费布局骨架（LayoutMain）提供的统一满高基准 --preview-content-height。
 * 满高演示组件（编辑器、画布、iframe、查看器）应基于该基准计算自身高度，
 * 不再各自硬编码视口偏移常量；骨架调整（页头高度、内边距）时全站自动跟随。
 *
 * `reserve` 为组件自身额外占用的行高（工具按钮行、卡片间距等），
 * 在统一基准上再扣除；移动端窄屏列布局由各视图自行取半。
 */
export function usePreviewContentHeight(reserve = 0) {
  const { width, height } = useWindowSize()

  const parseVar = () => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(
      '--preview-content-height'
    )
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : Math.max(360, height.value - 140)
  }

  const contentHeight = computed(() => parseVar())

  const editorHeight = computed(() => Math.max(320, contentHeight.value - reserve))

  return { width, height, contentHeight, editorHeight }
}
