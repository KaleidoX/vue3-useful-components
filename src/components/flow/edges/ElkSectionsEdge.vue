<script lang="ts" setup>
import { BaseEdge } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'
import type { ElkSection, LayoutControls } from '../elkjsWorkerGraph'

defineOptions({
  name: 'ElkSectionsEdge'
})

interface ElkSectionsEdgeData {
  sections?: ElkSection[]
  edgeRouting?: LayoutControls['edgeRouting']
}

const props = defineProps<EdgeProps>()

type Point = { x: number; y: number }

function pointToString(point: Point) {
  return `${point.x},${point.y}`
}

function toLinePath(points: Point[]) {
  return `M ${pointToString(points[0])}${points
    .slice(1)
    .map((point) => ` L ${pointToString(point)}`)
    .join('')}`
}

function toSectionPath(section: ElkSection, edgeRouting: LayoutControls['edgeRouting']) {
  const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint]
  const remainingPoints = points.slice(1)

  if (edgeRouting === 'SPLINES' && remainingPoints.length % 3 === 0) {
    let path = `M ${pointToString(points[0])}`
    for (let index = 0; index < remainingPoints.length; index += 3) {
      const [control1, control2, end] = remainingPoints.slice(index, index + 3)
      path += ` C ${pointToString(control1)} ${pointToString(control2)} ${pointToString(end)}`
    }
    return path
  }

  return toLinePath(points)
}

const path = computed(() => {
  const data = props.data as ElkSectionsEdgeData | undefined
  const sections = data?.sections ?? []
  if (sections.length === 0) {
    return `M ${props.sourceX},${props.sourceY} L ${props.targetX},${props.targetY}`
  }

  const edgeRouting = data?.edgeRouting ?? 'ORTHOGONAL'
  return sections.map((section) => toSectionPath(section, edgeRouting)).join(' ')
})
</script>

<template>
  <BaseEdge :path="path" :marker-end="markerEnd" />
</template>
