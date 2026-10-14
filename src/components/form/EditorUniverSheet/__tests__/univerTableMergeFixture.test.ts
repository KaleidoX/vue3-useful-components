import { describe, expect, it } from 'vitest'

import {
  createUniverTableMergeFixture,
  hasUniverMergeRange
} from '../univerTableMergeFixture'

describe('Univer table merge fixture', () => {
  it('maps the shared 3x3 cell labels into workbook cell data', () => {
    const workbook = createUniverTableMergeFixture()
    const sheet = workbook.sheets[workbook.sheetOrder[0] as string]

    expect(sheet?.cellData?.[0]?.[0]?.v).toBe('A1')
    expect(sheet?.cellData?.[1]?.[1]?.v).toBe('B2')
    expect(sheet?.cellData?.[2]?.[2]?.v).toBe('C3')
    expect(hasUniverMergeRange(workbook)).toBe(false)
  })

  it('recognizes the shared A1:B2 merge range in a saved workbook', () => {
    const workbook = createUniverTableMergeFixture()
    const sheet = workbook.sheets[workbook.sheetOrder[0] as string]
    sheet!.mergeData = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }]

    expect(hasUniverMergeRange(workbook)).toBe(true)
  })
})
