import type { RenderElementProps } from 'slate-vue3'

export function renderThematicBreak({ attributes }: RenderElementProps) {
  return <hr {...attributes} class="my-4 border-gray-200" />
}
