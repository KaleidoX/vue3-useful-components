import type { RenderElementProps } from 'slate-vue3'

export function renderTable({ element, attributes, children }: RenderElementProps) {
  const tableElement = element as any
  const type = tableElement.type
  if (type === 'table') {
    return (
      <table {...attributes} class="my-2 w-full border-collapse border border-gray-300">
        {children}
      </table>
    )
  }
  if (type === 'table-row') {
    return <tr {...attributes}>{children}</tr>
  }
  if (tableElement.hiddenBy) {
    return (
      <td {...attributes} style={{ display: 'none' }}>
        {children}
      </td>
    )
  }
  return (
    <td
      {...attributes}
      rowspan={tableElement.rowspan ?? 1}
      colspan={tableElement.colspan ?? 1}
      class="border border-gray-300 px-2 py-1"
    >
      {children}
    </td>
  )
}
