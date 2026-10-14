import { tableMergeFixture } from '@/views/form/fixtures/tableMergeFixture'

export const blockNoteTableFixture = [
  {
    type: 'table',
    content: {
      type: 'tableContent',
      rows: tableMergeFixture.rows.map((row) => ({ cells: row.map((cell) => [cell]) }))
    }
  }
]
