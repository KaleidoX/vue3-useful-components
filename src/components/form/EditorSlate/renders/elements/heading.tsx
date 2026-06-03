import type { RenderElementProps } from 'slate-vue3'

export function renderHeading({ element, attributes, children }: RenderElementProps) {
  const level = Math.min(Math.max((element as any).level || 1, 1), 3) as 1 | 2 | 3
  const sizeMap = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-medium'
  } as const
  const Tag = `h${level}` as keyof HTMLElementTagNameMap
  return (
    <Tag {...attributes} class={`${sizeMap[level]} my-2`}>
      {children}
    </Tag>
  )
}
