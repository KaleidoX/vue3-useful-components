import type { Text } from 'slate-vue3/core'
import type { VNodeChild } from 'vue'

export const italicWrapper = (leaf: Text, content: VNodeChild) => {
  if (!leaf.italic) return content
  return <em>{content}</em>
}
