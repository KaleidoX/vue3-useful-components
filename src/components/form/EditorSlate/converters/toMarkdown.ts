import type { Descendant } from 'slate'

export function toMarkdown(nodes: Descendant[]): string {
  return nodes.map(node => serializeToMd(node, 0)).join('\n\n')
}

function serializeToMd(node: any, depth: number): string {
  if (node.text !== undefined) {
    let text = node.text
    if (node.bold) text = `**${text}**`
    if (node.italic) text = `*${text}*`
    if (node.strikethrough) text = `~~${text}~~`
    if (node.code) text = '`' + text + '`'
    if (node.underline) text = `<u>${text}</u>`
    if (node.link) text = `[${text}](${node.url})`
    return text
  }

  const children = (node.children || []).map((c: any) => serializeToMd(c, depth + 1)).join('')

  switch (node.type) {
    case 'heading':
      return `${'#'.repeat(node.level || 1)} ${children}`
    case 'bulleted-list':
      return children
    case 'numbered-list':
      return children
    case 'list-item': {
      const prefix = (node as any)._listType === 'numbered-list' ? '1.' : '-'
      return `${prefix} ${children}\n`
    }
    case 'block-quote':
      return children.split('\n').map((l: string) => `> ${l}`).join('\n')
    case 'code-block':
      return '```' + (node.language || '') + '\n' + children + '\n```'
    case 'thematic-break':
      return '---'
    case 'image':
      return `![${node.alt || ''}](${node.url})`
    case 'mention':
      return `@${node.userName}`
    case 'paragraph':
    default:
      return children
  }
}
