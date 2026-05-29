import { onUnmounted, shallowRef } from 'vue'

export function useResize(
  initialSizes: number[],
  options: {
    minSizes?: number[]
    maxSizes?: number[]
    direction: 'horizontal' | 'vertical'
    onEnd?: () => void
  }
) {
  const localSizes = shallowRef<number[]>([...initialSizes])
  const isDragging = shallowRef(false)
  let activeIndex = -1
  let startPos = 0
  let startSizes: number[] = []

  function onPointerDown(index: number, event: PointerEvent) {
    event.preventDefault()
    activeIndex = index
    isDragging.value = true
    startSizes = [...localSizes.value]
    startPos = options.direction === 'horizontal' ? event.clientX : event.clientY
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  }

  function onPointerMove(event: PointerEvent) {
    if (!isDragging.value) return
    const currentPos = options.direction === 'horizontal' ? event.clientX : event.clientY
    let delta = currentPos - startPos
    if (delta === 0) return

    const a = activeIndex
    const b = activeIndex + 1
    const sizeA = startSizes[a]!
    const sizeB = startSizes[b]!

    const minA = options.minSizes?.[a] ?? 0
    const minB = options.minSizes?.[b] ?? 0
    const maxA = options.maxSizes?.[a] ?? Infinity
    const maxB = options.maxSizes?.[b] ?? Infinity

    const maxShrinkA = sizeA - minA
    const maxGrowB = maxB - sizeB
    const maxGrowA = maxA - sizeA
    const maxShrinkB = sizeB - minB

    const minDelta = -Math.min(maxShrinkA, maxGrowB)
    const maxDelta = Math.min(maxGrowA, maxShrinkB)

    delta = Math.max(minDelta, Math.min(maxDelta, delta))

    const newSizes = [...startSizes]
    newSizes[a] = sizeA + delta
    newSizes[b] = sizeB - delta
    localSizes.value = newSizes
  }

  function onPointerUp() {
    isDragging.value = false
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    options.onEnd?.()
  }

  onUnmounted(() => {
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  })

  return { localSizes, isDragging, onPointerDown }
}
