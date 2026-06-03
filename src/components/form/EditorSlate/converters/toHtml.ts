import type { Descendant } from 'slate-vue3/core'

export function toHtml(nodes: Descendant[]): string {
  return nodes.map((node) => serializeNode(node)).join('')
}

function serializeNode(node: any): string {
  if (node.text !== undefined) {
    let text = escapeHtml(node.text)
    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.underline) text = `<u>${text}</u>`
    if (node.strikethrough) text = `<s>${text}</s>`
    if (node.code) text = `<code>${text}</code>`
    if (node.link) text = `<a href="${escapeAttr(node.url)}">${text}</a>`
    return text
  }

  const children = (node.children || []).map(serializeNode).join('')

  switch (node.type) {
    case 'heading':
      return `<h${node.level || 1}>${children}</h${node.level || 1}>`
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'numbered-list':
      return `<ol>${children}</ol>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'block-quote':
      return `<blockquote>${children}</blockquote>`
    case 'code-block':
      return `<pre><code${node.language ? ` class="language-${escapeAttr(node.language)}"` : ''}>${children}</code></pre>`
    case 'thematic-break':
      return '<hr>'
    case 'image':
      return `<img src="${escapeAttr(node.url)}" alt="${escapeAttr(node.alt || '')}">`
    case 'table':
      return `<table>${children}</table>`
    case 'table-row':
      return `<tr>${children}</tr>`
    case 'table-cell':
      return `<td>${children}</td>`
    case 'mention':
      return `<span data-mention="${escapeAttr(node.userId)}">@${escapeHtml(node.userName)}</span>`
    case 'paragraph':
    default:
      return `<p>${children}</p>`
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
