import type { RenderElementProps } from 'slate-vue3'

export function renderImage({ element, attributes }: RenderElementProps) {
  const url = (element as any).url || ''
  const alt = (element as any).alt || ''
  return <img {...attributes} src={url} alt={alt} class="h-auto max-w-full rounded" />
}
