import type { RenderPlaceholderProps } from 'slate-vue3'
import { renderDefaultPlaceholder } from './placeholders/default'

/**
 * 占位符渲染器注册表 — 后续可扩展多种占位符策略（如按父元素类型切换样式）。
 */
const placeholderRenderers: Record<string, (props: RenderPlaceholderProps) => ReturnType<typeof renderDefaultPlaceholder>> = {
  default: renderDefaultPlaceholder
}

export function renderPlaceholder(props: RenderPlaceholderProps) {
  const renderer = placeholderRenderers.default
  return renderer(props)
}
