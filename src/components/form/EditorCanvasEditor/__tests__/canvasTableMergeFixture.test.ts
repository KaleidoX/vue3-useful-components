import { describe, expect, it } from 'vitest'

import { tableMergeFixture } from '@/views/form/fixtures/tableMergeFixture'
import { createCanvasTableMergeFixture } from '../canvasTableMergeFixture'

describe('createCanvasTableMergeFixture', () => {
  it('maps the shared 3×3 grid to native canvas-editor table data', () => {
    const [table] = createCanvasTableMergeFixture()
    const cells = table?.trList?.flatMap((row) => row.tdList) ?? []

    expect(table?.type).toBe('table')
    expect(table?.trList).toHaveLength(3)
    expect(cells.map((cell) => cell.value.map((item) => item.value).join(''))).toEqual(
      tableMergeFixture.rows.flat()
    )
    expect(cells.every((cell) => cell.rowspan === 1 && cell.colspan === 1)).toBe(true)
  })
})
