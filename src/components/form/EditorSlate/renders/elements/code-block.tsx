import type { RenderElementProps } from 'slate-vue3'

export function renderCodeBlock({ element, attributes, children }: RenderElementProps) {
  const lang = (element as any).language || ''
  return (
    <pre {...attributes} class="my-2 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
      <code class={lang ? `language-${lang}` : ''}>{children}</code>
    </pre>
  )
}
