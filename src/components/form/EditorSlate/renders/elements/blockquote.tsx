import type { RenderElementProps } from 'slate-vue3'

export function renderBlockquote({ attributes, children }: RenderElementProps) {
  return (
    <blockquote {...attributes} class="my-2 border-l-4 border-gray-300 pl-4 text-gray-600 italic">
      {children}
    </blockquote>
  )
}
