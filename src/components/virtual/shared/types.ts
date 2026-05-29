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

export interface ITableRow {
  id: number
  col0: string
  col1: boolean
  col2: string
  col3: number
  col4: string
}
