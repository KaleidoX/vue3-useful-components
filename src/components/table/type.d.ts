import type { TableInstance, TableColumnInstance } from 'element-plus'
import type { VNode } from 'vue'

export type TableProps = TableInstance['$props']
export type TableColumnProps = TableColumnInstance['$props']

export interface ITableRenderColumn<T = Record<string, any>> extends TableColumnProps {
  prop?: keyof T
  renderDefault?: (scope: { row: T; column: any; $index: number }) => VNode | VNode[]
  renderHeader?: (scope: { row: T; column: any; $index: number }) => VNode | VNode[]
  children?: ITableRenderColumn[]
}

export interface ITableRender extends TableProps {
  modelValue: any[] | string
  selection: boolean | 'multiple'
  columns: ITableRenderColumn[]
}
