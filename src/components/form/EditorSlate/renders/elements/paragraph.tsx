import type { RenderElementProps } from 'slate-vue3'

export function renderParagraph({ attributes, children }: RenderElementProps) {
  return (
    <p {...attributes} class="my-1">
      {children}
    </p>
  )
}
