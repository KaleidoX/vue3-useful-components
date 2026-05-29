import type { Ref } from 'vue'
import type { IListItem } from './types'
import { generateItems } from './generateItems'

export function useDemoData(count: Ref<number>, contentType: Ref<string>) {
  const data = shallowRef<IListItem[]>([])

  watchEffect(() => {
    data.value = generateItems(count.value, contentType.value)
  })

  return { data }
}
