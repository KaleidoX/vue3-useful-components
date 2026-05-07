import type { Descendant } from 'slate'

export function fromHtml(html: string): Descendant[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes = Array.from(doc.body.childNodes)
    .map(node => domToSlate(node))
    .filter(Boolean) as Descendant[]
  return nodes.length > 0 ? nodes : [{ type: 'paragraph', children: [{ text: '' }] }]
}

function domToSlate(node: Node): Descendant | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    return { text }
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()

  switch (tag) {
    case 'p':
      return { type: 'paragraph', children: getChildren(el) }
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return { type: 'heading', level: parseInt(tag[1]), children: getChildren(el) }
    case 'ul':
      return { type: 'bulleted-list', children: getBlockChildren(el) }
    case 'ol':
      return { type: 'numbered-list', children: getBlockChildren(el) }
    case 'li':
      return { type: 'list-item', children: getChildren(el) }
    case 'blockquote':
      return { type: 'block-quote', children: getChildren(el) }
    case 'pre':
      return { type: 'code-block', language: el.querySelector('code')?.className.replace('language-', '') || '', children: getChildren(el) }
    case 'code':
      return { text: el.textContent || '', code: true }
    case 'strong': case 'b':
      return applyTextMark(el, 'bold')
    case 'em': case 'i':
      return applyTextMark(el, 'italic')
    case 'u':
      return applyTextMark(el, 'underline')
    case 's': case 'strike': case 'del':
      return applyTextMark(el, 'strikethrough')
    case 'a':
      return { text: el.textContent || '', link: true, url: el.getAttribute('href') || '#' }
    case 'img':
      return { type: 'image', url: el.getAttribute('src') || '', alt: el.getAttribute('alt') || '', children: [{ text: '' }] }
    case 'hr':
      return { type: 'thematic-break', children: [{ text: '' }] }
    case 'table':
      return { type: 'table', children: getBlockChildren(el) }
    case 'tr':
      return { type: 'table-row', children: getBlockChildren(el) }
    case 'td': case 'th':
      return { type: 'table-cell', children: getChildren(el) }
    case 'br':
      return { text: '\n' }
    default:
      return { text: el.textContent || '' }
  }
}

function getChildren(el: HTMLElement): any[] {
  return Array.from(el.childNodes).map(domToSlate).filter(Boolean)
}

function getBlockChildren(el: HTMLElement): any[] {
  return Array.from(el.childNodes)
    .filter(n => n.nodeType === Node.ELEMENT_NODE)
    .map(domToSlate)
    .filter(Boolean)
}

function applyTextMark(el: HTMLElement, mark: string): any {
  const text = el.textContent || ''
  return { text, [mark]: true }
}
