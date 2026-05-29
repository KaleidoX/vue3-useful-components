import type { Ref } from 'vue'
import type { ITreeNode } from './types'
import { generateTreeRoots, expandNode, collapseNode } from './generateTree'

export function useTreeData(count: Ref<number>) {
  const allNodes = shallowRef<ITreeNode[]>([])

  watchEffect(() => {
    allNodes.value = generateTreeRoots(count.value)
  })

  function toggleExpand(nodeId: number) {
    const nodes = allNodes.value
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    if (node.expanded) {
      allNodes.value = collapseNode(nodes, nodeId)
    } else {
      allNodes.value = expandNode(nodes, nodeId, count.value * 10)
    }
  }

  return { allNodes, toggleExpand }
}
