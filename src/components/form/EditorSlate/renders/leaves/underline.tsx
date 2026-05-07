import type { Text } from 'slate'
import type { VNodeChild } from 'vue'

export const underlineWrapper = (leaf: Text, content: VNodeChild) => {
  if (!leaf.underline) return content
  return <u>{content}</u>
}
