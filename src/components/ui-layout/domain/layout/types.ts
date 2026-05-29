import type { SplitNode } from './split'
import type { ContainerNode } from '../container/types'

export type LayoutNode = SplitNode | ContainerNode

export type LayoutSize =
  | { type: 'ratio'; value: number }
  | { type: 'px'; value: number }
  | { type: 'auto' }
