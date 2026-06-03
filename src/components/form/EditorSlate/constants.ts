/** 块级元素标签映射 */
export const ELEMENT_TAG_MAP: Record<string, string> = {
  paragraph: 'p',
  heading: 'h',
  'bulleted-list': 'ul',
  'numbered-list': 'ol',
  'list-item': 'li',
  'block-quote': 'blockquote',
  'code-block': 'pre',
  'thematic-break': 'hr',
  image: 'img',
  table: 'table',
  'table-row': 'tr',
  'table-cell': 'td',
  mention: 'span'
}

/** 需要 void 的元素（无子节点编辑） */
export const VOID_ELEMENTS = new Set(['image', 'thematic-break', 'mention'])

/** 需要空子节点的内联 void 元素 */
export const INLINE_VOID_ELEMENTS = new Set(['mention'])

/** Markdown 快捷输入映射：行首模式 -> 转换目标 */
export const MARKDOWN_SHORTCUTS: Record<string, { type: string; level?: number }> = {
  '# ': { type: 'heading', level: 1 },
  '## ': { type: 'heading', level: 2 },
  '### ': { type: 'heading', level: 3 },
  '* ': { type: 'bulleted-list' },
  '- ': { type: 'bulleted-list' },
  '1. ': { type: 'numbered-list' },
  '> ': { type: 'block-quote' },
  '```': { type: 'code-block' },
  '---': { type: 'thematic-break' },
  '***': { type: 'thematic-break' }
}

/** 工具栏按钮配置 */
export const TOOLBAR_BUTTONS = {
  full: [
    [
      { icon: 'i-lucide:undo-2', title: '撤销', action: 'undo' },
      { icon: 'i-lucide:redo-2', title: '重做', action: 'redo' }
    ],
    [
      { icon: 'i-lucide:bold', title: '加粗', action: 'toggleMark', mark: 'bold' },
      { icon: 'i-lucide:italic', title: '斜体', action: 'toggleMark', mark: 'italic' },
      { icon: 'i-lucide:underline', title: '下划线', action: 'toggleMark', mark: 'underline' },
      {
        icon: 'i-lucide:strikethrough',
        title: '删除线',
        action: 'toggleMark',
        mark: 'strikethrough'
      },
      { icon: 'i-lucide:code-xml', title: '行内代码', action: 'toggleMark', mark: 'code' }
    ],
    [
      {
        icon: 'i-lucide:heading-1',
        title: '标题 1',
        action: 'toggleBlock',
        block: 'heading',
        level: 1
      },
      {
        icon: 'i-lucide:heading-2',
        title: '标题 2',
        action: 'toggleBlock',
        block: 'heading',
        level: 2
      },
      {
        icon: 'i-lucide:heading-3',
        title: '标题 3',
        action: 'toggleBlock',
        block: 'heading',
        level: 3
      }
    ],
    [
      { icon: 'i-lucide:list', title: '无序列表', action: 'toggleBlock', block: 'bulleted-list' },
      {
        icon: 'i-lucide:list-ordered',
        title: '有序列表',
        action: 'toggleBlock',
        block: 'numbered-list'
      },
      { icon: 'i-lucide:quote', title: '引用', action: 'toggleBlock', block: 'block-quote' },
      { icon: 'i-lucide:braces', title: '代码块', action: 'toggleBlock', block: 'code-block' }
    ],
    [
      { icon: 'i-lucide:image', title: '插入图片', action: 'insertImage' },
      { icon: 'i-lucide:link', title: '插入链接', action: 'insertLink' },
      { icon: 'i-lucide:table', title: '插入表格', action: 'insertTable' },
      { icon: 'i-lucide:minus', title: '分隔线', action: 'insertDivider' }
    ]
  ],
  simple: [
    [
      { icon: 'i-lucide:bold', title: '加粗', action: 'toggleMark', mark: 'bold' },
      { icon: 'i-lucide:italic', title: '斜体', action: 'toggleMark', mark: 'italic' },
      {
        icon: 'i-lucide:strikethrough',
        title: '删除线',
        action: 'toggleMark',
        mark: 'strikethrough'
      }
    ],
    [
      {
        icon: 'i-lucide:heading-2',
        title: '标题 2',
        action: 'toggleBlock',
        block: 'heading',
        level: 2
      },
      {
        icon: 'i-lucide:heading-3',
        title: '标题 3',
        action: 'toggleBlock',
        block: 'heading',
        level: 3
      }
    ],
    [
      { icon: 'i-lucide:list', title: '无序列表', action: 'toggleBlock', block: 'bulleted-list' },
      {
        icon: 'i-lucide:list-ordered',
        title: '有序列表',
        action: 'toggleBlock',
        block: 'numbered-list'
      }
    ]
  ]
}
