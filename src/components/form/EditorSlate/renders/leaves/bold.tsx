import type { Text } from 'slate'
import type { VNodeChild } from 'vue'

export const boldWrapper = (leaf: Text, content: VNodeChild) => {
  if (!leaf.bold) return content
  return <strong>{content}</strong>
}
