import { describe, expect, it } from 'vitest'

import { TOOLBAR_BUTTONS } from '../constants'
import { renderTable } from '../renders/elements/table'

describe('Slate table merge UI', () => {
  it('exposes merge and split only in the full toolbar', () => {
    const fullActions = TOOLBAR_BUTTONS.full.flat().map(({ action }) => action)
    const simpleActions = TOOLBAR_BUTTONS.simple.flat().map(({ action }) => action)

    expect(fullActions).toContain('mergeTableCells')
    expect(fullActions).toContain('splitTableCell')
    expect(simpleActions).not.toContain('mergeTableCells')
    expect(simpleActions).not.toContain('splitTableCell')
  })

  it('renders master spans and keeps covered JSON cells out of the visual grid', () => {
    const merged = renderTable({
      element: { type: 'table-cell', rowspan: 2, colspan: 2, children: [] },
      attributes: {},
      children: 'A1'
    } as any)
    const covered = renderTable({
      element: { type: 'table-cell', hiddenBy: '0:0', children: [] },
      attributes: {},
      children: 'A2'
    } as any)

    expect(merged.props?.rowspan).toBe(2)
    expect(merged.props?.colspan).toBe(2)
    expect(covered.props?.style).toEqual({ display: 'none' })
  })
})
