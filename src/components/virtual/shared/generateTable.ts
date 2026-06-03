import type { ITableRow } from './types'

let tableNextId = 1

export function generateTable(count: number): ITableRow[] {
  const rows: ITableRow[] = []
  for (let i = 0; i < count; i++) {
    rows.push({
      id: tableNextId++,
      col0: `数据-${tableNextId - 1}`,
      col1: (tableNextId - 1) % 2 === 0,
      col2: `描述文本 ${String.fromCharCode(65 + ((tableNextId - 1) % 26))}`,
      col3: Math.floor(Math.random() * 10000),
      col4: ['是', '否', '待定'][(tableNextId - 1) % 3]
    })
  }
  return rows
}
