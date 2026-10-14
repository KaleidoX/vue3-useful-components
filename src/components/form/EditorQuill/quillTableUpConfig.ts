import {
  defaultCustomSelect,
  TableMenuContextmenu,
  TableSelection,
  TableUp,
  type TableUpOptionsInput
} from 'quill-table-up'

export const quillTableUpToolbarControl = { [TableUp.toolName]: [] }

export function createQuillTableUpOptions(simple: boolean): TableUpOptionsInput | undefined {
  if (simple) return undefined

  return {
    customSelect: defaultCustomSelect,
    customBtn: true,
    texts: {
      fullCheckboxText: '插入全宽表格',
      customBtnText: '自定义',
      confirmText: '确定',
      cancelText: '取消',
      rowText: '行',
      colText: '列',
      notPositiveNumberError: '请输入正整数',
      MergeCell: '合并单元格',
      SplitCell: '拆分单元格'
    },
    modules: [{ module: TableSelection }, { module: TableMenuContextmenu }]
  }
}
