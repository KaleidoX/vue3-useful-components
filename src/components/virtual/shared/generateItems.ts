import type { IListItem } from './types'

let nextId = 1

function createBaseItem(id: number): IListItem {
  return {
    id,
    content: `条目 #${id} — 这是一段示例文本内容`,
    checked: id % 3 === 0
  }
}

function createComplexItem(id: number): IListItem {
  return {
    ...createBaseItem(id),
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=item-${id}`,
    description: `这是条目 ${id} 的补充描述信息，用于展示复杂组件的渲染效果`
  }
}

function createDynamicItem(id: number): IListItem {
  const lines = 1 + (id % 3)
  let content = ''
  for (let i = 0; i < lines; i++) {
    content += (i > 0 ? '\n' : '') + `条目 #${id} 第 ${i + 1} 行内容：动态高度的演示文本。`
  }
  return {
    ...createBaseItem(id),
    content,
    height: 40 + (lines - 1) * 28
  }
}

export function generateItems(count: number, contentType: string): IListItem[] {
  const items: IListItem[] = []
  nextId = 1

  for (let i = 0; i < count; i++) {
    const id = nextId++
    switch (contentType) {
      case 'complex':
        items.push(createComplexItem(id))
        break
      case 'dynamic':
        items.push(createDynamicItem(id))
        break
      default:
        items.push(createBaseItem(id))
    }
  }

  return items
}
