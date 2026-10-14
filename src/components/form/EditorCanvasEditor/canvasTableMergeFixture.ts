import { ElementType, type IElement } from '@hufe921/canvas-editor'

import { tableMergeFixture } from '@/views/form/fixtures/tableMergeFixture'

const columnWidth = 180
const rowHeight = 42

export const createCanvasTableMergeFixture = (): IElement[] => [
  {
    value: '',
    type: ElementType.TABLE,
    width: columnWidth * 3,
    height: rowHeight * 3,
    colgroup: tableMergeFixture.rows[0].map(() => ({ width: columnWidth })),
    trList: tableMergeFixture.rows.map((row) => ({
      height: rowHeight,
      minHeight: rowHeight,
      tdList: row.map((value) => ({
        colspan: 1,
        rowspan: 1,
        value: [{ value }]
      }))
    }))
  }
]
