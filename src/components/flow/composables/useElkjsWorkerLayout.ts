import ELK from 'elkjs/lib/elk-api.js'
import elkWorkerUrl from 'elkjs/lib/elk-worker.min.js?url'
import { createElkWorkerGraph, toVueFlowGraph } from '../elkjsWorkerGraph'
import type { ElkFlowEdge, ElkFlowNode, ElkLayoutApi, LayoutControls } from '../elkjsWorkerGraph'

type ElkLayoutApiFactory = () => ElkLayoutApi

function createElkLayoutApi(): ElkLayoutApi {
  const elk = new ELK({ workerUrl: elkWorkerUrl })
  return {
    layout: (graph) => elk.layout(graph) as Promise<typeof graph>,
    terminateWorker: () => elk.terminateWorker()
  }
}

export function useElkjsWorkerLayout(createApi: ElkLayoutApiFactory = createElkLayoutApi) {
  const nodes = ref<ElkFlowNode[]>([])
  const edges = ref<ElkFlowEdge[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let api: ElkLayoutApi | null = null
  let requestId = 0
  let disposed = false

  function isCurrentRequest(id: number) {
    return !disposed && id === requestId
  }

  async function layout(controls: LayoutControls) {
    if (disposed) return

    const controlsSnapshot = { ...controls }
    const currentRequestId = ++requestId
    isLoading.value = true
    error.value = null

    try {
      api ??= createApi()
      const result = await api.layout(createElkWorkerGraph(controlsSnapshot))
      if (!isCurrentRequest(currentRequestId)) return

      const graph = toVueFlowGraph(result, controlsSnapshot.edgeRouting)
      nodes.value = graph.nodes
      edges.value = graph.edges
      isLoading.value = false
    } catch (reason) {
      if (!isCurrentRequest(currentRequestId)) return

      error.value = reason instanceof Error ? reason.message : String(reason)
      isLoading.value = false
    }
  }

  function dispose() {
    if (disposed) return

    disposed = true
    requestId += 1
    api?.terminateWorker()
  }

  return { nodes, edges, isLoading, error, layout, dispose }
}
