import { describe, it, expect } from 'vitest'
import { toHtml } from '../converters/toHtml'
import { toMarkdown } from '../converters/toMarkdown'
import { fromHtml } from '../converters/fromHtml'
import { fromMarkdown } from '../converters/fromMarkdown'
import type { Descendant } from 'slate'

const testNodes: Descendant[] = [
  { type: 'heading', level: 1, children: [{ text: '标题' }] },
  { type: 'paragraph', children: [{ text: '普通文本', bold: true }, { text: '和斜体', italic: true }] }
]

describe('toHtml', () => {
  it('converts Slate nodes to HTML', () => {
    const html = toHtml(testNodes)
    expect(html).toContain('<h1>标题</h1>')
    expect(html).toContain('<strong>普通文本</strong>')
    expect(html).toContain('<em>和斜体</em>')
  })

  it('handles empty array', () => {
    expect(toHtml([])).toBe('')
  })

  it('escapes HTML in text', () => {
    const html = toHtml([{ type: 'paragraph', children: [{ text: '<script>alert("xss")</script>' }] }])
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('converts headings', () => {
    const html = toHtml([{ type: 'heading', level: 2, children: [{ text: 'Sub' }] }])
    expect(html).toBe('<h2>Sub</h2>')
  })

  it('converts links', () => {
    const html = toHtml([{ type: 'paragraph', children: [{ text: 'click', link: true, url: 'https://example.com' }] }])
    expect(html).toContain('href="https://example.com"')
  })
})

describe('toMarkdown', () => {
  it('converts Slate nodes to Markdown', () => {
    const md = toMarkdown(testNodes)
    expect(md).toContain('# 标题')
    expect(md).toContain('**普通文本**')
    expect(md).toContain('*和斜体*')
  })

  it('converts code blocks', () => {
    const md = toMarkdown([{ type: 'code-block', language: 'ts', children: [{ text: 'const x = 1' }] }])
    expect(md).toContain('```ts')
    expect(md).toContain('const x = 1')
    expect(md).toContain('```')
  })
})

describe('fromHtml', () => {
  it('converts HTML to Slate nodes', () => {
    const nodes = fromHtml('<h1>标题</h1><p>正文</p>')
    expect(nodes).toHaveLength(2)
    expect((nodes[0] as any).type).toBe('heading')
    expect((nodes[0] as any).level).toBe(1)
    expect((nodes[1] as any).type).toBe('paragraph')
  })

  it('handles empty HTML', () => {
    const nodes = fromHtml('')
    expect(nodes).toHaveLength(1)
    expect((nodes[0] as any).type).toBe('paragraph')
  })
})

describe('fromMarkdown', () => {
  it('converts Markdown to Slate nodes', () => {
    const nodes = fromMarkdown('# 标题\n\n正文')
    expect(nodes).toHaveLength(2)
    expect((nodes[0] as any).type).toBe('heading')
    expect((nodes[1] as any).type).toBe('paragraph')
  })

  it('converts bold and italic', () => {
    const nodes = fromMarkdown('**bold** and *italic*')
    expect(nodes).toHaveLength(1)
    const children = (nodes[0] as any).children
    expect(children[0].bold).toBe(true)
    expect(children[2].italic).toBe(true)
  })

  it('handles empty input', () => {
    const nodes = fromMarkdown('')
    expect(nodes).toHaveLength(1)
    expect((nodes[0] as any).type).toBe('paragraph')
  })
})

describe('round-trip conversions', () => {
  it('JSON -> HTML -> JSON preserves structure', () => {
    const original = [{ type: 'paragraph', children: [{ text: 'Hello', bold: true }] }] as Descendant[]
    const html = toHtml(original)
    const parsed = fromHtml(html)
    expect(parsed).toHaveLength(1)
    expect((parsed[0] as any).type).toBe('paragraph')
  })

  it('JSON -> Markdown -> JSON preserves structure', () => {
    const original = [{ type: 'heading', level: 1, children: [{ text: 'Title' }] }] as Descendant[]
    const md = toMarkdown(original)
    const parsed = fromMarkdown(md)
    expect(parsed).toHaveLength(1)
    expect((parsed[0] as any).type).toBe('heading')
  })
})
