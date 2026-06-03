import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowAntvX6 节点数控制工具栏测试
 *
 * 功能：在画布左上角添加浮动工具栏，按钮 [10 | 50 | 100]，
 * 点击后 clearCells 再重新添加节点（网格排布，cols=5）和边。
 */

const mockClearCells = vi.fn()
const mockAddNode = vi.fn()
const mockAddEdge = vi.fn()
const mockCenterContent = vi.fn()
const mockResize = vi.fn()
const mockDispose = vi.fn()

// Track added nodes to return incrementing IDs
let nodeIdCounter = 0

const MockGraph = vi.fn(function (this: any, _options: any) {
  this.clearCells = mockClearCells
  this.addNode = mockAddNode.mockImplementation(() => {
    return { id: `node-${++nodeIdCounter}` }
  })
  this.addEdge = mockAddEdge
  this.centerContent = mockCenterContent
  this.resize = mockResize
  this.dispose = mockDispose
})

// Mock Shape.Rect for type checking
const MockShape = {
  Rect: vi.fn(),
}

vi.mock('@antv/x6', () => ({
  Graph: MockGraph,
  Shape: MockShape,
}))

describe('FlowAntvX6 node-count toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockGraph.mockClear()
    nodeIdCounter = 0
    mockAddNode.mockClear()
    mockAddEdge.mockClear()
    mockClearCells.mockClear()
    mockCenterContent.mockClear()
  })

  it('renders toolbar with buttons for 10, 50, 100 nodes', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text().trim())

    expect(buttonTexts).toContain('10')
    expect(buttonTexts).toContain('50')
    expect(buttonTexts).toContain('100')
  })

  it('default nodeCount is 10', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(10)
  })

  it('clicking "50" button sets nodeCount to 50 and calls clearCells + addNode 50 times', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    // Reset counters after initial mount (which calls addNode)
    mockAddNode.mockClear()
    mockAddEdge.mockClear()
    mockClearCells.mockClear()

    const buttons = wrapper.findAll('button')
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    expect(btn50).toBeDefined()

    await btn50!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(50)

    // Should call clearCells to remove old nodes
    expect(mockClearCells).toHaveBeenCalled()

    // Should add 50 nodes
    expect(mockAddNode).toHaveBeenCalledTimes(50)
  })

  it('clicking "100" button regenerates 100 nodes and edges', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    mockAddNode.mockClear()
    mockAddEdge.mockClear()
    mockClearCells.mockClear()

    const buttons = wrapper.findAll('button')
    const btn100 = buttons.find((b) => b.text().trim() === '100')
    expect(btn100).toBeDefined()

    await btn100!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(100)
    expect(mockClearCells).toHaveBeenCalled()
    expect(mockAddNode).toHaveBeenCalledTimes(100)

    // Should generate sequential edges (99 for 100 nodes) + cross-links
    // Cross-links: i%7===0 && i+5<100 → i=0,7,14,21,28,35,42,49,56,63,70,77,84,91
    // That's 14 cross-links. Total edges: 99 + 14 = 113
    expect(mockAddEdge).toHaveBeenCalledTimes(113)
  })

  it('nodes are arranged in grid with COLS=5', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    mockAddNode.mockClear()
    mockClearCells.mockClear()

    const buttons = wrapper.findAll('button')
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    await btn50!.trigger('click')
    await nextTick()

    // Check grid layout from addNode calls
    const addNodeCalls = mockAddNode.mock.calls
    expect(addNodeCalls.length).toBe(50)

    const COLS = 5
    const GAP_X = 180
    const GAP_Y = 80

    for (let i = 0; i < 50; i++) {
      const config = addNodeCalls[i][0]
      const expectedX = 40 + (i % COLS) * GAP_X
      const expectedY = 40 + Math.floor(i / COLS) * GAP_Y
      expect(config.x).toBe(expectedX)
      expect(config.y).toBe(expectedY)
      expect(config.label).toBe(`N${i + 1}`)
    }
  })

  it('active button has highlight class', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const btn10 = buttons.find((b) => b.text().trim() === '10')
    const btn50 = buttons.find((b) => b.text().trim() === '50')

    // Default is 10, should have active class
    expect(btn10!.classes()).toContain('bg-blue-500')

    // Click 50
    await btn50!.trigger('click')
    await nextTick()

    const buttonsAfter = wrapper.findAll('button')
    const btn10After = buttonsAfter.find((b) => b.text().trim() === '10')
    const btn50After = buttonsAfter.find((b) => b.text().trim() === '50')

    expect(btn50After!.classes()).toContain('bg-blue-500')
    expect(btn10After!.classes()).not.toContain('bg-blue-500')
  })

  it('calls centerContent after regenerating graph', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    mockCenterContent.mockClear()

    const buttons = wrapper.findAll('button')
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    await btn50!.trigger('click')
    await nextTick()

    expect(mockCenterContent).toHaveBeenCalled()
  })
})
