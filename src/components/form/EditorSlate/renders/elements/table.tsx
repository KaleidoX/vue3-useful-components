import type { RenderElementProps } from 'slate-vue3'

export function renderTable({ element, attributes, children }: RenderElementProps) {
  const type = (element as any).type
  if (type === 'table') {
    return <table {...attributes} class="my-2 w-full border-collapse border border-gray-300">{children}</table>
  }
  if (type === 'table-row') {
    return <tr {...attributes}>{children}</tr>
  }
  return <td {...attributes} class="border border-gray-300 px-2 py-1">{children}</td>
}
