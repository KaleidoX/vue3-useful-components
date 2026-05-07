import type { RenderElementProps } from 'slate-vue3'

export function renderMention({ element, attributes }: RenderElementProps) {
  const userName = (element as any).userName || 'unknown'
  return (
    <span {...attributes} class="inline-flex cursor-default items-center rounded bg-blue-100 px-1 text-blue-700 font-medium">
      @{userName}
    </span>
  )
}
