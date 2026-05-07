import type { VNode } from 'vue'
import type { RenderElementProps } from 'slate-vue3'
import type { ElementRendererRegistry } from './types'
import { renderParagraph } from './elements/paragraph'
import { renderHeading } from './elements/heading'
import { renderList } from './elements/list'
import { renderBlockquote } from './elements/blockquote'
import { renderCodeBlock } from './elements/code-block'
import { renderThematicBreak } from './elements/thematic-break'
import { renderImage } from './elements/image'
import { renderTable } from './elements/table'
import { renderMention } from './elements/mention'

/**
 * 元素渲染器策略注册表 — 按 element.type 映射到对应的渲染函数。
 * 新增元素类型只需在注册表中添加映射即可，无需修改调度逻辑。
 */
const elementRenderers: ElementRendererRegistry = {
  paragraph: renderParagraph,
  heading: renderHeading,
  'bulleted-list': renderList,
  'numbered-list': renderList,
  'list-item': renderList,
  'block-quote': renderBlockquote,
  'code-block': renderCodeBlock,
  'thematic-break': renderThematicBreak,
  image: renderImage,
  table: renderTable,
  'table-row': renderTable,
  'table-cell': renderTable,
  mention: renderMention
}

const fallbackRenderer = renderParagraph

export function renderElement(props: RenderElementProps): VNode {
  const type = (props.element as any).type || 'paragraph'
  const renderer = elementRenderers[type] ?? fallbackRenderer
  return renderer(props)
}
