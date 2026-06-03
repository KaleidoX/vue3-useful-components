import type { Descendant } from 'slate-vue3/core'

export function fromMarkdown(md: string): Descendant[] {
  const lines = md.split('\n')
  const nodes: Descendant[] = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // code block
    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      i++
      const codeLines: string[] = []
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```

      if (codeLines.length > 0) {
        nodes.push({
          type: 'code-block',
          language,
          children: codeLines.map((text, idx) => ({
            text: text + (idx < codeLines.length - 1 ? '\n' : '')
          }))
        } as any)
      }
      continue
    }

    // heading
    const headingMatch = line.match(/^(#{1,6})\s(.+)/)
    if (headingMatch) {
      nodes.push({
        type: 'heading',
        level: headingMatch[1].length,
        children: [{ text: headingMatch[2] }]
      } as any)
      i++
      continue
    }

    // thematic break
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      nodes.push({ type: 'thematic-break', children: [{ text: '' }] } as any)
      i++
      continue
    }

    // blockquote
    if (line.startsWith('> ')) {
      nodes.push({
        type: 'block-quote',
        children: [{ text: line.slice(2) }]
      } as any)
      i++
      continue
    }

    // unordered list
    if (/^[-*+]\s/.test(line)) {
      const listItems: any[] = []
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        listItems.push({
          type: 'list-item',
          children: [{ text: lines[i].replace(/^[-*+]\s/, '') }]
        })
        i++
      }
      nodes.push({ type: 'bulleted-list', children: listItems } as any)
      continue
    }

    // ordered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: any[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push({
          type: 'list-item',
          children: [{ text: lines[i].replace(/^\d+\.\s/, '') }]
        })
        i++
      }
      nodes.push({ type: 'numbered-list', children: listItems } as any)
      continue
    }

    // empty line (paragraph break)
    if (line.trim() === '') {
      i++
      continue
    }

    // image
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imageMatch) {
      nodes.push({
        type: 'image',
        url: imageMatch[2],
        alt: imageMatch[1],
        children: [{ text: '' }]
      } as any)
      i++
      continue
    }

    // paragraph (with inline formatting)
    nodes.push({
      type: 'paragraph',
      children: parseInlineMd(line)
    } as any)
    i++
  }

  if (nodes.length === 0) {
    nodes.push({ type: 'paragraph', children: [{ text: '' }] } as any)
  }

  return nodes
}

function parseInlineMd(text: string): any[] {
  const children: any[] = []
  const regex =
    /(\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|\x60(.+?)\x60|<u>(.+?)<\/u>|\[([^\]]+)\]\(([^)]+)\)|[^*~\x60<\[]+)/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      children.push({ text: match[2], bold: true })
    } else if (match[3]) {
      children.push({ text: match[3], italic: true })
    } else if (match[4]) {
      children.push({ text: match[4], strikethrough: true })
    } else if (match[5]) {
      children.push({ text: match[5], code: true })
    } else if (match[6]) {
      children.push({ text: match[6], underline: true })
    } else if (match[7]) {
      children.push({ text: match[7], link: true, url: match[8] })
    } else if (match[1]) {
      children.push({ text: match[1] })
    }
  }

  return children.length > 0 ? children : [{ text }]
}
