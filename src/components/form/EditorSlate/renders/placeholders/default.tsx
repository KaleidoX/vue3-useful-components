import type { RenderPlaceholderProps } from 'slate-vue3'

export function renderDefaultPlaceholder({ attributes, children }: RenderPlaceholderProps) {
  return (
    <span {...attributes} class="pointer-events-none select-none text-gray-400">
      {children}
    </span>
  )
}
