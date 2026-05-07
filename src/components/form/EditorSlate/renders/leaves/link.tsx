import type { Text } from 'slate'
import type { VNodeChild } from 'vue'

export const linkWrapper = (leaf: Text, content: VNodeChild) => {
  if (!(leaf as any).link) return content
  const url = (leaf as any).url || '#'
  return <a href={url} target="_blank" class="text-blue-600 underline">{content}</a>
}
