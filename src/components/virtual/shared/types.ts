export interface IListItem {
  id: number
  content: string
  checked: boolean
  height?: number
  avatar?: string
  description?: string
}

export interface ITreeNode extends IListItem {
  level: number
  parentId: number | null
  hasChildren: boolean
  expanded: boolean
}
