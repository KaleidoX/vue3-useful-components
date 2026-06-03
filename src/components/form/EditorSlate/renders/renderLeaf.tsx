 
import type { VNodeChild } from 'vue'
import type { RenderLeafProps } from 'slate-vue3'
import type { LeafWrapperRegistry } from './types'
import { boldWrapper } from './leaves/bold'
import { italicWrapper } from './leaves/italic'
import { underlineWrapper } from './leaves/underline'
import { strikethroughWrapper } from './leaves/strikethrough'
import { codeWrapper } from './leaves/code'
import { linkWrapper } from './leaves/link'

/**
 * Leaf wrapper 注册表 — 按 leaf 属性名映射到对应的包裹函数。
 * 新增文本样式只需添加新的 wrapper 文件并在此注册。
 */
const leafWrappers: LeafWrapperRegistry = {
  bold: boldWrapper,
  italic: italicWrapper,
  underline: underlineWrapper,
  strikethrough: strikethroughWrapper,
  code: codeWrapper,
  link: linkWrapper
}

/** 包裹顺序：先外层标记，后内层标记 */
const wrapperOrder: (keyof typeof leafWrappers)[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'code',
  'link'
]

export function renderLeaf({ leaf, children, attributes }: RenderLeafProps) {
  let content: VNodeChild = <>{children}</>

  for (const key of wrapperOrder) {
    const wrapper = leafWrappers[key]
    if (wrapper) {
      content = wrapper(leaf, content)
    }
  }

  return <span {...attributes}>{content}</span>
}
