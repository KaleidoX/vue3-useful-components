import type { Text } from 'slate'
import type { VNodeChild } from 'vue'

export const codeWrapper = (leaf: Text, content: VNodeChild) => {
  if (!leaf.code) return content
  return <code class="rounded bg-gray-100 px-1 text-sm text-red-500 font-mono">{content}</code>
}
