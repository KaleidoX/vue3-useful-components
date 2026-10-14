import { describe, expect, it } from 'vitest'

import {
  tableMergeFixture,
  tableMergeFixtureHtml,
  tableMergeFixtureMarkdown
} from '../tableMergeFixture'

describe('table merge acceptance fixture', () => {
  it('provides a unique 3×3 grid and the shared A1:B2 merge target', () => {
    expect(tableMergeFixture.rows).toEqual([
      ['A1', 'A2', 'A3'],
      ['B1', 'B2', 'B3'],
      ['C1', 'C2', 'C3']
    ])
    expect(new Set(tableMergeFixture.rows.flat()).size).toBe(9)
    expect(tableMergeFixture.mergeRange).toEqual({
      from: { row: 0, column: 0 },
      to: { row: 1, column: 1 }
    })
    expect(tableMergeFixture.expectedSpan).toEqual({ rowspan: 2, colspan: 2 })
  })

  it('offers a semantic HTML seed without pre-merging cells', () => {
    const document = new DOMParser().parseFromString(tableMergeFixtureHtml, 'text/html')
    const cells = [...document.querySelectorAll('td')]

    expect(cells.map((cell) => cell.textContent)).toEqual(tableMergeFixture.rows.flat())
    expect(cells.every((cell) => cell.rowSpan === 1 && cell.colSpan === 1)).toBe(true)
  })

  it('produces the same 3×3 seed as GFM markdown', () => {
    expect(tableMergeFixtureMarkdown).toContain('| A1 | A2 | A3 |')
    expect(tableMergeFixtureMarkdown).toContain('| B1 | B2 | B3 |')
    expect(tableMergeFixtureMarkdown).toContain('| C1 | C2 | C3 |')
  })
})
