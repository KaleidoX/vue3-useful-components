import { Editor, Node, Path, Transforms, type Location } from 'slate-vue3/core'
import { HistoryEditor } from 'slate-vue3/history'
import type { SlateEditor } from '../types'

type CellPath = [number, number, number]

interface TableCellNode {
  type: 'table-cell'
  children: unknown[]
  rowspan?: number
  colspan?: number
  hiddenBy?: string
}

interface TableRowNode {
  type: 'table-row'
  children: TableCellNode[]
}

interface TableNode {
  type: 'table'
  children: TableRowNode[]
}

function normalizeCellPath(path: number[]): CellPath | null {
  if (path.length < 3) return null
  return [path[0], path[1], path[2]]
}

function readTable(editor: SlateEditor, cellPath: CellPath): TableNode | null {
  const tablePath = Path.parent(Path.parent(cellPath))
  const node = Node.get(editor, tablePath) as TableNode
  return node.type === 'table' ? node : null
}

function replaceTable(editor: SlateEditor, tablePath: number[], table: TableNode) {
  HistoryEditor.withNewBatch(editor, () => {
    Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: tablePath })
      Transforms.insertNodes(editor, table as any, { at: tablePath })
    })
  })
}

function cloneTable(table: TableNode): TableNode {
  return JSON.parse(JSON.stringify(table)) as TableNode
}

export function mergeTableCellsAt(
  editor: SlateEditor,
  anchorPathInput: number[],
  focusPathInput: number[]
) {
  const anchorPath = normalizeCellPath(anchorPathInput)
  const focusPath = normalizeCellPath(focusPathInput)
  if (!anchorPath || !focusPath || anchorPath[0] !== focusPath[0]) return false

  const minRow = Math.min(anchorPath[1], focusPath[1])
  const maxRow = Math.max(anchorPath[1], focusPath[1])
  const minColumn = Math.min(anchorPath[2], focusPath[2])
  const maxColumn = Math.max(anchorPath[2], focusPath[2])
  if (minRow === maxRow && minColumn === maxColumn) return false

  const table = readTable(editor, anchorPath)
  if (!table) return false
  const cells = table.children
    .slice(minRow, maxRow + 1)
    .flatMap((row) => row.children.slice(minColumn, maxColumn + 1))
  const expectedCellCount = (maxRow - minRow + 1) * (maxColumn - minColumn + 1)
  if (
    cells.length !== expectedCellCount ||
    cells.some(
      (cell) => cell.hiddenBy || (cell.rowspan ?? 1) !== 1 || (cell.colspan ?? 1) !== 1
    )
  ) {
    return false
  }

  const nextTable = cloneTable(table)
  const mergeId = `${minRow}:${minColumn}`
  const master = nextTable.children[minRow].children[minColumn]
  master.rowspan = maxRow - minRow + 1
  master.colspan = maxColumn - minColumn + 1
  for (let row = minRow; row <= maxRow; row += 1) {
    for (let column = minColumn; column <= maxColumn; column += 1) {
      if (row !== minRow || column !== minColumn) {
        nextTable.children[row].children[column].hiddenBy = mergeId
      }
    }
  }

  replaceTable(editor, [anchorPath[0]], nextTable)
  return true
}

export function splitTableCellAt(editor: SlateEditor, cellPathInput: number[]) {
  const cellPath = normalizeCellPath(cellPathInput)
  if (!cellPath) return false
  const table = readTable(editor, cellPath)
  if (!table) return false

  const master = table.children[cellPath[1]]?.children[cellPath[2]]
  const rowspan = master?.rowspan ?? 1
  const colspan = master?.colspan ?? 1
  if (rowspan === 1 && colspan === 1) return false

  const mergeId = `${cellPath[1]}:${cellPath[2]}`
  const nextTable = cloneTable(table)
  for (let row = cellPath[1]; row < cellPath[1] + rowspan; row += 1) {
    for (let column = cellPath[2]; column < cellPath[2] + colspan; column += 1) {
      const cell = nextTable.children[row]?.children[column]
      if (!cell || (row !== cellPath[1] || column !== cellPath[2]) && cell.hiddenBy !== mergeId) {
        return false
      }
      delete cell.hiddenBy
    }
  }
  const nextMaster = nextTable.children[cellPath[1]].children[cellPath[2]]
  delete nextMaster.rowspan
  delete nextMaster.colspan

  replaceTable(editor, [cellPath[0]], nextTable)
  return true
}

function getSelectedCellPath(editor: SlateEditor, at: Location) {
  const entry = Editor.above(editor, {
    at,
    match: (node) => (node as { type?: string }).type === 'table-cell'
  })
  return entry ? normalizeCellPath(entry[1]) : null
}

export function mergeSelectedTableCells(editor: SlateEditor) {
  if (!editor.selection) return false
  const anchorPath = getSelectedCellPath(editor, editor.selection.anchor)
  const focusPath = getSelectedCellPath(editor, editor.selection.focus)
  if (!anchorPath || !focusPath) return false
  return mergeTableCellsAt(editor, anchorPath, focusPath)
}

export function splitSelectedTableCell(editor: SlateEditor) {
  if (!editor.selection) return false
  const cellPath = getSelectedCellPath(editor, editor.selection.anchor)
  return cellPath ? splitTableCellAt(editor, cellPath) : false
}
