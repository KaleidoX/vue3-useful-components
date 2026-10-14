import {
  $createTextNode,
  $getRoot,
  $isElementNode,
  $setSelection,
  createEditor,
  type LexicalEditor
} from 'lexical'
import {
  $createTableNodeWithDimensions,
  $createTableSelectionFrom,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  $mergeCells,
  $unmergeCellNode,
  TableCellNode,
  TableNode,
  TableRowNode
} from '@lexical/table'

import { tableMergeFixture } from '@/views/form/fixtures/tableMergeFixture'

export const lexicalTableNodes = [TableNode, TableRowNode, TableCellNode]

export function createLexicalTableEditor() {
  return createEditor({
    namespace: 'LexicalTableGallery',
    nodes: lexicalTableNodes,
    onError(error) {
      throw error
    },
    theme: { table: 'lexical-table', tableCell: 'lexical-table-cell', tableCellHeader: 'lexical-table-cell' }
  })
}

export function seedLexicalTable(editor: LexicalEditor) {
  editor.update(
    () => {
      const root = $getRoot()
      root.clear()
      const table = $createTableNodeWithDimensions(3, 3, false)
      table.getChildren().forEach((row, rowIndex) => {
        if (!$isTableRowNode(row)) return
        row.getChildren().forEach((cell, columnIndex) => {
          if (!$isTableCellNode(cell)) return
          const paragraph = cell.getFirstChild()
          if ($isElementNode(paragraph)) {
            paragraph.clear().append($createTextNode(tableMergeFixture.rows[rowIndex][columnIndex]))
          }
        })
      })
      root.append(table)
    },
    { discrete: true }
  )
}

function getTableAndCells() {
  const table = $getRoot().getFirstChild()
  if (!$isTableNode(table)) return undefined
  const cells = table.getChildren().flatMap((row) =>
    $isTableRowNode(row) ? row.getChildren().filter($isTableCellNode) : []
  )
  return { table, cells }
}

export function mergeSampleLexicalCells(editor: LexicalEditor) {
  let merged = false
  editor.update(
    () => {
      const result = getTableAndCells()
      if (!result || result.cells.length < 5) return
      const selectedCells = [result.cells[0], result.cells[1], result.cells[3], result.cells[4]]
      $setSelection($createTableSelectionFrom(result.table, selectedCells[0], selectedCells[3]))
      merged = $mergeCells(selectedCells) !== null
    },
    { discrete: true }
  )
  return merged
}

export function splitSampleLexicalCell(editor: LexicalEditor) {
  let split = false
  editor.update(
    () => {
      const result = getTableAndCells()
      const cell = result?.cells.find((currentCell) => currentCell.getColSpan() > 1 || currentCell.getRowSpan() > 1)
      if (!cell) return
      $unmergeCellNode(cell)
      split = true
    },
    { discrete: true }
  )
  return split
}
