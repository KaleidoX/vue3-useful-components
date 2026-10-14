import { LocaleType, type IWorkbookData } from '@univerjs/presets'

import { tableMergeFixture } from '@/views/form/fixtures/tableMergeFixture'

const workbookId = 'table-merge-fixture'
const sheetId = 'table-merge-sheet'

export function createUniverTableMergeFixture(): IWorkbookData {
  const cellData = Object.fromEntries(
    tableMergeFixture.rows.map((row, rowIndex) => [
      rowIndex,
      Object.fromEntries(row.map((value, columnIndex) => [columnIndex, { v: value }]))
    ])
  )

  return {
    id: workbookId,
    name: '表格合并对比',
    appVersion: '3.0.0',
    locale: LocaleType.ZH_CN,
    styles: {},
    sheetOrder: [sheetId],
    sheets: {
      [sheetId]: {
        id: sheetId,
        name: '3×3 对比表格',
        rowCount: 100,
        columnCount: 26,
        cellData,
        mergeData: []
      }
    }
  }
}

export function hasUniverMergeRange(workbook: IWorkbookData): boolean {
  const sheet = workbook.sheets[workbook.sheetOrder[0] as string]
  const expected = tableMergeFixture.mergeRange

  return Boolean(
    sheet?.mergeData?.some(
      (range) =>
        range.startRow === expected.from.row &&
        range.endRow === expected.to.row &&
        range.startColumn === expected.from.column &&
        range.endColumn === expected.to.column
    )
  )
}
