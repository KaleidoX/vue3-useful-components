export const tableMergeFixture = {
  rows: [
    ['A1', 'A2', 'A3'],
    ['B1', 'B2', 'B3'],
    ['C1', 'C2', 'C3']
  ],
  mergeRange: {
    from: { row: 0, column: 0 },
    to: { row: 1, column: 1 }
  },
  expectedSpan: { rowspan: 2, colspan: 2 }
} as const

const tableRows = tableMergeFixture.rows
  .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
  .join('')

export const tableMergeFixtureHtml = `<table><tbody>${tableRows}</tbody></table>`

export const tableMergeFixtureMarkdown = [
  `| ${tableMergeFixture.rows[0].join(' | ')} |`,
  '| --- | --- | --- |',
  ...tableMergeFixture.rows.slice(1).map((row) => `| ${row.join(' | ')} |`)
].join('\n')
