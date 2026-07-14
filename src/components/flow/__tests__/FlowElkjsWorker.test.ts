import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MarkerType } from '@vue-flow/core'
import ElkSectionsEdge from '../edges/ElkSectionsEdge.vue'

const fitView = vi.fn()
const layout = vi.fn()
const dispose = vi.fn()
const nodes = ref([
  { id: 'start', position: { x: 0, y: 0 }, width: 160, height: 56, data: { label: '开始' } }
])
const edges = ref<Record<string, unknown>[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const nodesInitialized = ref(false)

vi.mock('@vue-flow/core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vue-flow/core')>()),
  VueFlow: {
    name: 'VueFlow',
    props: ['nodes', 'edges', 'edgeTypes', 'defaultEdgeOptions', 'fitViewOnInit'],
    template:
      '<div class="vue-flow-stub" :data-default-edge-options="JSON.stringify(defaultEdgeOptions)" :data-nodes="JSON.stringify(nodes)" :data-edges="JSON.stringify(edges)" :data-edge-types="Object.keys(edgeTypes).join(\',\')"><slot /><slot name="node-default" :data="nodes[0]?.data" /></div>'
  },
  useVueFlow: () => ({ fitView }),
  useNodesInitialized: () => nodesInitialized
}))

vi.mock('@vue-flow/background', () => ({
  Background: { template: '<div class="background-stub" />' }
}))
vi.mock('@vue-flow/controls', () => ({ Controls: { template: '<div class="controls-stub" />' } }))
vi.mock('../composables/useElkjsWorkerLayout', () => ({
  useElkjsWorkerLayout: () => ({ nodes, edges, isLoading, error, layout, dispose })
}))

import FlowElkjsWorker from '../FlowElkjsWorker.vue'

enableAutoUnmount(afterEach)

function resetState() {
  layout.mockReset().mockResolvedValue(undefined)
  dispose.mockReset()
  fitView.mockReset()
  nodes.value = [
    { id: 'start', position: { x: 0, y: 0 }, width: 160, height: 56, data: { label: '开始' } }
  ]
  edges.value = []
  isLoading.value = false
  error.value = null
  nodesInitialized.value = false
}

describe('FlowElkjsWorker', () => {
  it('submits complete controls for each of the four controls', async () => {
    resetState()
    const wrapper = mount(FlowElkjsWorker)
    await nextTick()
    layout.mockClear()

    const selects = wrapper.findAll('select')
    expect(selects).toHaveLength(4)
    expect(selects.map((select) => select.element.value)).toEqual([
      'RIGHT',
      'ORTHOGONAL',
      '40',
      '80'
    ])
    expect(
      selects.map((select) => select.findAll('option').map((option) => option.attributes('value')))
    ).toEqual([
      ['RIGHT', 'LEFT', 'DOWN', 'UP'],
      ['ORTHOGONAL', 'POLYLINE', 'SPLINES'],
      ['20', '40', '60', '80'],
      ['40', '60', '80', '120']
    ])

    await selects[0].setValue('DOWN')
    expect(layout).toHaveBeenCalledTimes(1)
    expect(layout).toHaveBeenLastCalledWith({
      direction: 'DOWN',
      edgeRouting: 'ORTHOGONAL',
      nodeSpacing: 40,
      layerSpacing: 80
    })
    await selects[1].setValue('SPLINES')
    expect(layout).toHaveBeenCalledTimes(2)
    expect(layout).toHaveBeenLastCalledWith({
      direction: 'DOWN',
      edgeRouting: 'SPLINES',
      nodeSpacing: 40,
      layerSpacing: 80
    })
    await selects[2].setValue('60')
    expect(layout).toHaveBeenCalledTimes(3)
    expect(layout).toHaveBeenLastCalledWith({
      direction: 'DOWN',
      edgeRouting: 'SPLINES',
      nodeSpacing: 60,
      layerSpacing: 80
    })
    await selects[3].setValue('120')
    expect(layout).toHaveBeenCalledTimes(4)
    expect(layout).toHaveBeenLastCalledWith({
      direction: 'DOWN',
      edgeRouting: 'SPLINES',
      nodeSpacing: 60,
      layerSpacing: 120
    })
  })

  it('renders loading, error and retry states', async () => {
    resetState()
    const wrapper = mount(FlowElkjsWorker)
    isLoading.value = true
    await nextTick()
    expect(wrapper.get('[role="status"]').text()).toContain('正在计算布局')

    isLoading.value = false
    error.value = '布局失败'
    await nextTick()
    expect(wrapper.get('[role="alert"]').text()).toContain('布局失败')
    layout.mockClear()
    await wrapper.get('button').trigger('click')
    expect(layout).toHaveBeenCalledWith({
      direction: 'RIGHT',
      edgeRouting: 'ORTHOGONAL',
      nodeSpacing: 40,
      layerSpacing: 80
    })
  })

  it('fits exactly once when nodes initialize', async () => {
    resetState()
    mount(FlowElkjsWorker)
    nodesInitialized.value = true
    await nextTick()

    expect(fitView).toHaveBeenCalledTimes(1)
    expect(fitView).toHaveBeenCalledWith({ padding: 0.2 })
  })

  it('passes Vue Flow graph props with fixed nodes and the ELK edge type', () => {
    resetState()
    edges.value = [
      { id: 'start-validate', source: 'start', target: 'validate', type: 'elk-sections' }
    ]
    const wrapper = mount(FlowElkjsWorker)
    const flow = wrapper.get('.vue-flow-stub')

    expect(JSON.parse(flow.attributes('data-nodes')!)).toEqual([
      expect.objectContaining({ id: 'start', width: 160, height: 56 })
    ])
    expect(JSON.parse(flow.attributes('data-edges')!)).toEqual(edges.value)
    expect(flow.attributes('data-edge-types')).toBe('elk-sections')
    expect(wrapper.getComponent({ name: 'VueFlow' }).props('edgeTypes')['elk-sections']).toBe(
      ElkSectionsEdge
    )
  })

  it('fits after the latest successful request only', async () => {
    resetState()
    const nextLayout = deferred<void>()
    layout.mockResolvedValueOnce(undefined).mockReturnValueOnce(nextLayout.promise)
    const wrapper = mount(FlowElkjsWorker)
    await Promise.resolve()
    nodesInitialized.value = true
    await nextTick()
    fitView.mockClear()
    const select = wrapper.findAll('select')[0]
    const change = select.setValue('DOWN')
    await nextTick()
    expect(layout).toHaveBeenCalledTimes(2)
    nextLayout.resolve()
    await change
    await nextTick()
    await nextTick()

    expect(fitView).toHaveBeenCalledTimes(1)
    expect(fitView).toHaveBeenCalledWith({ padding: 0.2 })
  })

  it('does not fit when a resolved request becomes stale before nextTick resumes', async () => {
    resetState()
    nodesInitialized.value = true
    const initial = deferred<void>()
    const newer = deferred<void>()
    layout.mockReturnValueOnce(initial.promise).mockReturnValueOnce(newer.promise)
    const wrapper = mount(FlowElkjsWorker)
    await nextTick()
    fitView.mockClear()

    initial.resolve()
    await Promise.resolve()
    await wrapper.findAll('select')[0].setValue('DOWN')
    await nextTick()

    expect(fitView).not.toHaveBeenCalled()
    newer.resolve()
    await nextTick()
    await nextTick()
  })

  it('does not fit when a resolved request is unmounted before nextTick resumes', async () => {
    resetState()
    const pending = deferred<void>()
    layout.mockReturnValue(pending.promise)
    const wrapper = mount(FlowElkjsWorker)
    pending.resolve()
    await Promise.resolve()
    wrapper.unmount()
    await nextTick()

    expect(fitView).not.toHaveBeenCalled()
  })

  it('does not fit after unmount and disposes the layout composable', async () => {
    resetState()
    const pending = deferred<void>()
    layout.mockReturnValue(pending.promise)
    const wrapper = mount(FlowElkjsWorker)
    wrapper.unmount()
    pending.resolve()
    await nextTick()

    expect(dispose).toHaveBeenCalledTimes(1)
    expect(fitView).not.toHaveBeenCalled()
  })

  it('passes ArrowClosed as the default edge marker', () => {
    resetState()
    const wrapper = mount(FlowElkjsWorker)

    expect(
      JSON.parse(wrapper.get('.vue-flow-stub').attributes('data-default-edge-options')!)
    ).toEqual({
      markerEnd: MarkerType.ArrowClosed
    })
  })
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve
  })
  return { promise, resolve }
}
