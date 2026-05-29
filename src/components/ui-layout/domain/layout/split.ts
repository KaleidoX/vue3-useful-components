import type { LayoutNode, LayoutSize } from './types'

export interface SplitChildState {
  collapsed?: boolean
  previousSize?: LayoutSize
  collapsedSize?: number
}

export interface SplitNode {
  id: string
  type: 'split'
  direction: 'horizontal' | 'vertical'
  children: LayoutNode[]
  sizes: LayoutSize[]
  minSizes?: number[]
  maxSizes?: number[]
  childStates?: SplitChildState[]
}

export function isSplitNode(node: LayoutNode | any): node is SplitNode {
  return node?.type === 'split'
}

let _idCounter = 0
export function generateId(): string {
  return `node_${++_idCounter}_${Date.now().toString(36)}`
}

export function createSplitNode(
  id: string,
  direction: 'horizontal' | 'vertical',
  children: SplitNode['children'],
  sizes?: LayoutSize[],
  minSizes?: number[],
  maxSizes?: number[]
): SplitNode {
  const defaultSizes: LayoutSize[] = sizes ?? children.map(() => ({ type: 'ratio', value: 1 }))
  return { id, type: 'split', direction, children, sizes: defaultSizes, minSizes, maxSizes }
}
