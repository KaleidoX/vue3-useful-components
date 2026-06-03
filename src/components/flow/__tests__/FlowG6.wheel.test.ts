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
const mockRegister = vi.fn()
const MockHTML = vi.fn()

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
  register: mockRegister,
  HTML: MockHTML
}))

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn() as any

// Mock createApp for Vue component mounting in complex node tests
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    createApp: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn()
    }))
  }
})

describe('FlowG6 wheel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockGraph.mockClear()
  })

  it('behaviors should NOT include drag-canvas or zoom-canvas', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default

    mount(FlowG6, {
      attachTo: document.body
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

    mount(FlowG6, {
      attachTo: document.body
    })
    await nextTick()

    const graphOptions = MockGraph.mock.calls[0][0]
    expect(graphOptions.autoFit).toBe('view')
  })

  it('node and edge config should remain intact', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default

    mount(FlowG6, {
      attachTo: document.body
    })
    await nextTick()

    const graphOptions = MockGraph.mock.calls[0][0]
    expect(graphOptions.node).toBeDefined()
    expect(graphOptions.edge).toBeDefined()
  })

  it('toolbar renders mode buttons and count buttons', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default
    const wrapper = mount(FlowG6, { attachTo: document.body })
    await nextTick()

    const toolbar = wrapper.find('.absolute.top-2.left-2')
    expect(toolbar.exists()).toBe(true)
    const buttons = toolbar.findAll('button')
    // 2 mode buttons (简单节点, 复杂节点) + 4 count buttons = 6 buttons
    expect(buttons).toHaveLength(6)
    expect(buttons[0].text()).toBe('简单节点')
    expect(buttons[1].text()).toBe('复杂节点')
    expect(buttons[2].text()).toBe('10')
    expect(buttons[3].text()).toBe('50')
    expect(buttons[4].text()).toBe('100')
    expect(buttons[5].text()).toBe('500')
    // "简单节点" mode button should be active by default
    expect(buttons[0].classes()).toContain('bg-blue-500')
    // "复杂节点" mode button should not be active
    expect(buttons[1].classes()).not.toContain('bg-blue-500')
    // "10" count button should be active by default
    expect(buttons[2].classes()).toContain('bg-blue-500')
  })

  it('clicking "50" button rebuilds graph with 50 nodes', async () => {
    vi.clearAllMocks()
    const FlowG6 = (await import('../FlowG6.vue')).default
    const wrapper = mount(FlowG6, { attachTo: document.body })
    await nextTick()

    // After onMounted, buildSimpleGraph() calls setData with 10 nodes
    expect(mockSetData).toHaveBeenCalled()
    const firstSetDataCall = mockSetData.mock.calls[0][0]
    expect(firstSetDataCall.nodes.length).toBe(10)

    mockRender.mockClear()
    mockSetData.mockClear()

    // Click the "50" button (index 3: after 简单节点, 复杂节点, 10)
    const buttons = wrapper.findAll('.absolute.top-2.left-2 button')
    await buttons[3].trigger('click')

    // After rebuild, setData should have been called with 50 nodes
    expect(mockSetData).toHaveBeenCalled()
    const setDataCall = mockSetData.mock.calls[0][0]
    expect(setDataCall.nodes.length).toBe(50)
    expect(mockRender).toHaveBeenCalled()
  })
})

/**
 * 复杂节点模式测试
 *
 * Feature: FlowToolbar 组件提供两个模式按钮（简单节点/复杂节点），
 *   复杂模式下使用 composable 数据源（20 个 InfoCard + 10 个 FormNode），
 *   使用 G6 自定义节点配合 DOM overlay 渲染 Vue 组件。
 */
describe('FlowG6 complex node mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockGraph.mockClear()
  })

  it('renders mode buttons in toolbar', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default
    const wrapper = mount(FlowG6, {
      attachTo: document.body,
      global: {
        stubs: {
          FlowNodeInfo: true,
          FlowNodeForm: true
        }
      }
    })
    await nextTick()

    const toolbar = wrapper.find('.absolute.top-2.left-2')
    expect(toolbar.exists()).toBe(true)

    const allButtons = toolbar.findAll('button')
    // 2 mode buttons + 4 count buttons = 6 buttons in simple mode
    expect(allButtons).toHaveLength(6)

    // "简单节点" button at index 0, "复杂节点" at index 1
    expect(allButtons[0].text()).toBe('简单节点')
    expect(allButtons[1].text()).toBe('复杂节点')
  })

  it('clicking "复杂节点" button switches to complex mode', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default
    const wrapper = mount(FlowG6, {
      attachTo: document.body,
      global: {
        stubs: {
          FlowNodeInfo: true,
          FlowNodeForm: true
        }
      }
    })
    await nextTick()

    // Clear calls from onMounted (buildSimpleGraph with simple nodes)
    mockSetData.mockClear()
    mockRender.mockClear()

    // Click "复杂节点" button (index 1)
    const buttons = wrapper.findAll('.absolute.top-2.left-2 button')
    await buttons[1].trigger('click')
    await nextTick()

    // "复杂节点" button should now have active class
    expect(buttons[1].classes()).toContain('bg-blue-500')
    // "简单节点" button should not be active
    expect(buttons[0].classes()).not.toContain('bg-blue-500')

    // setData should have been called with complex node data
    expect(mockSetData).toHaveBeenCalled()
    const setDataCall = mockSetData.mock.calls[0][0]
    // 20 InfoCard + 10 FormNode = 30 nodes total
    expect(setDataCall.nodes.length).toBe(30)

    // 20 InfoCard nodes should have type 'info-card'
    const infoNodes = setDataCall.nodes.filter((n: any) => n.type === 'info-card')
    expect(infoNodes).toHaveLength(20)

    // 10 FormNode nodes should have type 'form-node'
    const formNodes = setDataCall.nodes.filter((n: any) => n.type === 'form-node')
    expect(formNodes).toHaveLength(10)

    // render should have been called
    expect(mockRender).toHaveBeenCalled()
  })

  it('switching back to simple mode restores count buttons', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default
    const wrapper = mount(FlowG6, {
      attachTo: document.body,
      global: {
        stubs: {
          FlowNodeInfo: true,
          FlowNodeForm: true
        }
      }
    })
    await nextTick()

    // Switch to complex mode by clicking "复杂节点"
    const buttons = wrapper.findAll('.absolute.top-2.left-2 button')
    await buttons[1].trigger('click')
    await nextTick()

    expect(buttons[1].classes()).toContain('bg-blue-500')

    // Switch back to simple mode by clicking "简单节点"
    mockSetData.mockClear()
    mockRender.mockClear()
    await buttons[0].trigger('click')
    await nextTick()

    // "简单节点" button should be active again
    expect(buttons[0].classes()).toContain('bg-blue-500')

    // Should rebuild with 10 simple nodes (default count)
    expect(mockSetData).toHaveBeenCalled()
    const setDataCall = mockSetData.mock.calls[0][0]
    expect(setDataCall.nodes.length).toBe(10)
    // Simple nodes don't have explicit type set
    const typedNodes = setDataCall.nodes.filter((n: any) => n.type)
    expect(typedNodes).toHaveLength(0)
    expect(mockRender).toHaveBeenCalled()
  })

  it('node count buttons are not rendered in complex mode', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default
    const wrapper = mount(FlowG6, {
      attachTo: document.body,
      global: {
        stubs: {
          FlowNodeInfo: true,
          FlowNodeForm: true
        }
      }
    })
    await nextTick()

    // Switch to complex mode by clicking "复杂节点"
    const buttons = wrapper.findAll('.absolute.top-2.left-2 button')
    await buttons[1].trigger('click')
    await nextTick()

    // Count buttons should not be in DOM (v-if removed), only mode buttons remain
    const visibleButtons = wrapper.findAll('.absolute.top-2.left-2 button')
    expect(visibleButtons).toHaveLength(2)
    expect(visibleButtons[0].text()).toBe('简单节点')
    expect(visibleButtons[1].text()).toBe('复杂节点')
  })

  it('mode ref reflects current mode', async () => {
    const FlowG6 = (await import('../FlowG6.vue')).default
    const wrapper = mount(FlowG6, {
      attachTo: document.body,
      global: {
        stubs: {
          FlowNodeInfo: true,
          FlowNodeForm: true
        }
      }
    })
    await nextTick()

    // Initially in simple mode
    expect((wrapper.vm as any).mode).toBe('simple')

    // Switch to complex
    const buttons = wrapper.findAll('.absolute.top-2.left-2 button')
    await buttons[1].trigger('click')
    await nextTick()

    expect((wrapper.vm as any).mode).toBe('complex')
  })
})
