import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { TableKit } from '@tiptap/extension-table'
import StarterKit from '@tiptap/starter-kit'

export function createTiptapExtensions(options: { simple: boolean; placeholder: string }) {
  const extensions = [
    StarterKit.configure(),
    Image.configure({ inline: true }),
    Placeholder.configure({ placeholder: options.placeholder })
  ]

  return options.simple ? extensions : [...extensions, TableKit]
}
