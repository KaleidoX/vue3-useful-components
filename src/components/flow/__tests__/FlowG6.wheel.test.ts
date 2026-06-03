import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowG6 wheel pan + zoom 测试
 *
 * Bug: G6 v5 的 zoom-canvas behavior 配合 trigger: ['Control'] 不可靠，
 *       导致 Ctrl+滚轮缩放不工作。同时 drag-canvas behavior 的平移也不可靠。
 *
 * Fix: 移除 drag-canvas 和 zoom-canvas behaviors，用手动 wheel 事件处理所有平移和缩放。
 *       Ctrl+滚轮 → graph.zoomTo() 缩放
 *       普通滚轮 → graph.translateBy() 平移
 */

const mockRender = vi.fn()
const mockDestroy = vi.fn()
const mockGetZoom = vi.fn(() => 1)
const mockGetCanvas = vi.fn(() => ({ getZoom: mockGetZoom }))
const mockZoomTo = vi.fn()
const mockTranslateBy = vi.fn()
const mockSetSize = vi.fn()
const mockSetData = vi.fn()

const MockGraph = vi.fn(function (this: any, options: any) {
  this._options = options
  this.render = mockRender
  this.destroy = mockDestroy
  this.getCanvas = mockGetCanvas
  this.getZoom = mockGetZoom
  this.zoomTo = mockZoomTo
  this.translateBy = mockTranslateBy
  this.setSize = mockSetSize
  this.setData = mockSetData
})

vi.mock('@antv/g6', () => ({
  Graph: MockGraph,
}))

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn() as any

describe('FlowG6', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockGraph.mockClear()
  })

  it('behaviors should NOT include drag-canvas or zoom-canvas', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default

    const wrapper = mount(FlowG6, {
      attachTo: document.body,
    })
    await nextTick()

    // Check what options were passed to Graph constructor
    const calls = MockGraph.mock.calls
    expect(calls.length).toBeGreaterThan(0)

    const graphOptions = calls[0][0]
    expect(graphOptions.behaviors).toBeDefined()

    // Should NOT contain drag-canvas or zoom-canvas
    const behaviorStrings = graphOptions.behaviors.filter((b: any) => typeof b === 'string')
    expect(behaviorStrings).not.toContain('drag-canvas')
    expect(behaviorStrings).not.toContain('zoom-canvas')

    const behaviorObjects = graphOptions.behaviors.filter((b: any) => typeof b === 'object')
    const zoomCanvasObj = behaviorObjects.find((b: any) => b.type === 'zoom-canvas')
    expect(zoomCanvasObj).toBeUndefined()

    // Should contain drag-element and click-select
    expect(behaviorStrings).toContain('drag-element')
    expect(behaviorStrings).toContain('click-select')
  })

  it('autoFit should still be configured', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default

    const wrapper = mount(FlowG6, {
      attachTo: document.body,
    })
    await nextTick()

    const graphOptions = MockGraph.mock.calls[0][0]
    expect(graphOptions.autoFit).toBe('view')
  })

  it('node and edge config should remain intact', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default

    const wrapper = mount(FlowG6, {
      attachTo: document.body,
    })
    await nextTick()

    const graphOptions = MockGraph.mock.calls[0][0]
    expect(graphOptions.node).toBeDefined()
    expect(graphOptions.edge).toBeDefined()
  })

  it('toolbar renders count buttons [10, 50, 100, 500]', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default
    const wrapper = mount(FlowG6, { attachTo: document.body })
    await nextTick()

    const toolbar = wrapper.find('.absolute.top-2.left-2')
    expect(toolbar.exists()).toBe(true)
    const buttons = toolbar.findAll('button')
    expect(buttons).toHaveLength(4)
    expect(buttons[0].text()).toBe('10')
    expect(buttons[1].text()).toBe('50')
    expect(buttons[2].text()).toBe('100')
    expect(buttons[3].text()).toBe('500')
    // First button (10) should be active by default
    expect(buttons[0].classes()).toContain('bg-blue-500')
  })

  it('clicking "50" button rebuilds graph with 50 nodes', async () => {
    vi.clearAllMocks()
    const FlowG6 = (await import('../FlowG6.vue')).default
    const wrapper = mount(FlowG6, { attachTo: document.body })
    await nextTick()

    // After onMounted, buildGraph(10) calls setData with 10 nodes
    expect(mockSetData).toHaveBeenCalled()
    const firstSetDataCall = mockSetData.mock.calls[0][0]
    expect(firstSetDataCall.nodes.length).toBe(10)

    mockRender.mockClear()
    mockSetData.mockClear()

    // Click the "50" button
    const buttons = wrapper.findAll('.absolute.top-2.left-2 button')
    await buttons[1].trigger('click') // "50"

    // After rebuild, setData should have been called with 50 nodes
    expect(mockSetData).toHaveBeenCalled()
    const setDataCall = mockSetData.mock.calls[0][0]
    expect(setDataCall.nodes.length).toBe(50)
    // render should have been called
    expect(mockRender).toHaveBeenCalled()
  })
})
