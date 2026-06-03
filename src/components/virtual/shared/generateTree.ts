import type { ITreeNode } from './types'

let treeNextId = 1

function createTreeNode(
  id: number,
  level: number,
  parentId: number | null,
  hasChildren: boolean
): ITreeNode {
  return {
    id,
    content: `节点 #${id} — level ${level}`,
    checked: id % 3 === 0,
    level,
    parentId,
    hasChildren,
    expanded: false
  }
}

const CHILDREN_PER_NODE = 3

export function generateTreeRoots(count: number): ITreeNode[] {
  treeNextId = 1
  const roots: ITreeNode[] = []
  for (let i = 0; i < count && treeNextId <= count + 1; i++) {
    roots.push(createTreeNode(treeNextId++, 0, null, true))
  }
  return roots
}

export function generateChildren(
  parentId: number,
  parentLevel: number,
  maxCount: number
): ITreeNode[] {
  const children: ITreeNode[] = []
  for (let i = 0; i < CHILDREN_PER_NODE && treeNextId <= maxCount; i++) {
    const id = treeNextId++
    const hasChild = parentLevel < 2
    children.push(createTreeNode(id, parentLevel + 1, parentId, hasChild))
  }
  return children
}

export function expandNode(allNodes: ITreeNode[], nodeId: number, maxCount: number): ITreeNode[] {
  const idx = allNodes.findIndex((n) => n.id === nodeId)
  if (idx === -1 || allNodes[idx].expanded) return allNodes

  const node = allNodes[idx]
  const children = generateChildren(node.id, node.level, maxCount)

  // TODO: @owner wheat 按需加载子节点，仅在节点展开时动态生成
  const before = allNodes.slice(0, idx + 1)
  const after = allNodes.slice(idx + 1)
  return [
    ...before.map((n) => (n.id === nodeId ? { ...n, expanded: true } : n)),
    ...children,
    ...after
  ]
}

export function collapseNode(allNodes: ITreeNode[], nodeId: number): ITreeNode[] {
  const idx = allNodes.findIndex((n) => n.id === nodeId)
  if (idx === -1 || !allNodes[idx].expanded) return allNodes

  const visible: ITreeNode[] = []
  const skipParent = new Set<number>()
  skipParent.add(nodeId)

  for (const n of allNodes) {
    if (n.parentId !== null && skipParent.has(n.parentId)) {
      if (n.hasChildren && n.expanded) skipParent.add(n.id)
      continue
    }
    if (n.id === nodeId) {
      visible.push({ ...n, expanded: false })
    } else {
      visible.push(n)
    }
  }

  return visible
}
