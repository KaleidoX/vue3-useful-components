import type { RenderElementProps } from 'slate-vue3'

export function renderList({ element, attributes, children }: RenderElementProps) {
  const type = (element as any).type
  if (type === 'bulleted-list') {
    return (
      <ul {...attributes} class="list-disc pl-6">
        {children}
      </ul>
    )
  }
  if (type === 'numbered-list') {
    return (
      <ol {...attributes} class="list-decimal pl-6">
        {children}
      </ol>
    )
  }
  return <li {...attributes}>{children}</li>
}
