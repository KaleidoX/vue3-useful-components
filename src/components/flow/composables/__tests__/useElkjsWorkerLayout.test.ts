import { describe, expect, it, vi } from 'vitest'
import type { ElkNode } from 'elkjs/lib/elk-api.js'
import { DEFAULT_LAYOUT_CONTROLS } from '../../elkjsWorkerGraph'
import type { ElkLayoutApi } from '../../elkjsWorkerGraph'
import { useElkjsWorkerLayout } from '../useElkjsWorkerLayout'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve
    reject = nextReject
  })
  return { promise, resolve, reject }
}

function layoutResult(x: number): ElkNode {
  return {
    id: 'root',
    children: [{ id: 'start', x, y: 20 }],
    edges: [
      {
        id: 'start-validate',
        sources: ['start'],
        targets: ['validate'],
        sections: [
          {
            id: 'section-start-validate',
            startPoint: { x, y: 20 },
            endPoint: { x: x + 160, y: 20 }
          }
        ]
      }
    ]
  }
}

describe('useElkjsWorkerLayout', () => {
  it('stores a successful layout result', async () => {
    const api: ElkLayoutApi = {
      layout: vi.fn().mockResolvedValue(layoutResult(10)),
      terminateWorker: vi.fn()
    }
    const state = useElkjsWorkerLayout(() => api)

    await state.layout(DEFAULT_LAYOUT_CONTROLS)

    expect(state.nodes.value).toHaveLength(1)
    expect(state.edges.value).toHaveLength(1)
    expect(state.isLoading.value).toBe(false)
    expect(state.error.value).toBeNull()
  })

  it('keeps the newest result when an older request finishes last', async () => {
    const first = deferred<ElkNode>()
    const second = deferred<ElkNode>()
    const api: ElkLayoutApi = {
      layout: vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise),
      terminateWorker: vi.fn()
    }
    const state = useElkjsWorkerLayout(() => api)

    const firstRequest = state.layout(DEFAULT_LAYOUT_CONTROLS)
    const secondRequest = state.layout({ ...DEFAULT_LAYOUT_CONTROLS, direction: 'DOWN' })
    second.resolve(layoutResult(200))
    await secondRequest
    first.resolve(layoutResult(10))
    await firstRequest

    expect(state.nodes.value[0].position).toEqual({ x: 200, y: 20 })
    expect(state.isLoading.value).toBe(false)
  })

  it('keeps loading while an older request finishes before a newer pending request', async () => {
    const first = deferred<ElkNode>()
    const second = deferred<ElkNode>()
    const api: ElkLayoutApi = {
      layout: vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise),
      terminateWorker: vi.fn()
    }
    const state = useElkjsWorkerLayout(() => api)

    const firstRequest = state.layout(DEFAULT_LAYOUT_CONTROLS)
    const secondRequest = state.layout({ ...DEFAULT_LAYOUT_CONTROLS, direction: 'DOWN' })
    first.resolve(layoutResult(10))
    await firstRequest

    expect(state.isLoading.value).toBe(true)
    expect(state.nodes.value).toEqual([])

    second.resolve(layoutResult(200))
    await secondRequest
  })

  it('uses a controls snapshot for graph options and edge routing', async () => {
    const pending = deferred<ElkNode>()
    const api: ElkLayoutApi = {
      layout: vi.fn().mockReturnValue(pending.promise),
      terminateWorker: vi.fn()
    }
    const state = useElkjsWorkerLayout(() => api)
    const controls = { ...DEFAULT_LAYOUT_CONTROLS }

    const request = state.layout(controls)
    controls.edgeRouting = 'SPLINES'
    pending.resolve(layoutResult(10))
    await request

    expect(api.layout).toHaveBeenCalledWith(
      expect.objectContaining({
        layoutOptions: expect.objectContaining({ 'elk.edgeRouting': 'ORTHOGONAL' })
      })
    )
    expect(state.edges.value[0].data.edgeRouting).toBe('ORTHOGONAL')
  })

  it('preserves the last successful graph after layout rejection', async () => {
    const api: ElkLayoutApi = {
      layout: vi
        .fn()
        .mockResolvedValueOnce(layoutResult(10))
        .mockRejectedValueOnce(new Error('布局失败')),
      terminateWorker: vi.fn()
    }
    const state = useElkjsWorkerLayout(() => api)

    await state.layout(DEFAULT_LAYOUT_CONTROLS)
    const previousNodes = state.nodes.value
    await state.layout(DEFAULT_LAYOUT_CONTROLS)

    expect(state.nodes.value).toBe(previousNodes)
    expect(state.error.value).toBe('布局失败')
    expect(state.isLoading.value).toBe(false)
  })

  it('captures synchronous ELK construction errors', async () => {
    const state = useElkjsWorkerLayout(() => {
      throw new Error('ELK 初始化失败')
    })

    await state.layout(DEFAULT_LAYOUT_CONTROLS)

    expect(state.nodes.value).toEqual([])
    expect(state.error.value).toBe('ELK 初始化失败')
    expect(state.isLoading.value).toBe(false)
  })

  it.each(['resolve', 'reject'] as const)(
    'ignores an in-flight %s after idempotent disposal',
    async (outcome) => {
      const pending = deferred<ElkNode>()
      const api: ElkLayoutApi = {
        layout: vi.fn().mockReturnValue(pending.promise),
        terminateWorker: vi.fn()
      }
      const state = useElkjsWorkerLayout(() => api)
      const request = state.layout(DEFAULT_LAYOUT_CONTROLS)
      const beforeDispose = {
        nodes: state.nodes.value,
        edges: state.edges.value,
        isLoading: state.isLoading.value,
        error: state.error.value
      }

      state.dispose()
      state.dispose()
      if (outcome === 'resolve') pending.resolve(layoutResult(10))
      else pending.reject(new Error('布局失败'))
      await request

      expect(state.nodes.value).toBe(beforeDispose.nodes)
      expect(state.edges.value).toBe(beforeDispose.edges)
      expect(state.isLoading.value).toBe(beforeDispose.isLoading)
      expect(state.error.value).toBe(beforeDispose.error)
      expect(api.terminateWorker).toHaveBeenCalledTimes(1)
    }
  )

  it('does nothing when layout is requested after disposal of an existing API', async () => {
    const api: ElkLayoutApi = {
      layout: vi.fn().mockResolvedValue(layoutResult(10)),
      terminateWorker: vi.fn()
    }
    const createApi = vi.fn<() => ElkLayoutApi>(() => api)
    const state = useElkjsWorkerLayout(createApi)

    await state.layout(DEFAULT_LAYOUT_CONTROLS)
    state.dispose()
    await state.layout(DEFAULT_LAYOUT_CONTROLS)

    expect(createApi).toHaveBeenCalledTimes(1)
    expect(api.layout).toHaveBeenCalledTimes(1)
    expect(api.terminateWorker).toHaveBeenCalledTimes(1)
  })
})
