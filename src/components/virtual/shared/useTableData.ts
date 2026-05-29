import type { Ref } from 'vue'
import type { ITableRow } from './types'
import { generateTable } from './generateTable'

export function useTableData(count: Ref<number>) {
  const data = shallowRef<ITableRow[]>([])

  watchEffect(() => {
    data.value = generateTable(count.value)
  })

  return { data }
}
