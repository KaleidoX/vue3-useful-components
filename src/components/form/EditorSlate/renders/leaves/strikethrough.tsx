import type { Text } from 'slate'
import type { VNodeChild } from 'vue'

export const strikethroughWrapper = (leaf: Text, content: VNodeChild) => {
  if (!leaf.strikethrough) return content
  return <s>{content}</s>
}
