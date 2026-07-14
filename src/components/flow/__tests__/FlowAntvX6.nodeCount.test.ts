import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowAntvX6 节点数控制工具栏测试
 *
 * 功能：在画布左上角添加浮动工具栏，按钮 [50 | 500 | 1000 | 2000 | 2500 | 3000]，
 * 点击后 clearCells 再重新添加节点（网格排布，cols=5）和边。
 */

const mockClearCells = vi.fn()
const mockAddNode = vi.fn()
const mockAddEdge = vi.fn()
const mockCenterContent = vi.fn()
const mockResize = vi.fn()
const mockDispose = vi.fn()
const mockUse = vi.fn()

// Track added nodes to return incrementing IDs
let nodeIdCounter = 0

const MockGraph = vi.fn(function (this: any) {
  this.clearCells = mockClearCells
  this.addNode = mockAddNode.mockImplementation(() => {
    return { id: `node-${++nodeIdCounter}` }
  })
  this.addEdge = mockAddEdge
  this.centerContent = mockCenterContent
  this.resize = mockResize
  this.dispose = mockDispose
  this.use = mockUse
})

// Mock Shape.Rect for type checking
const MockShape = {
  Rect: vi.fn()
}

vi.mock('@antv/x6-vue-shape', () => ({
  register: vi.fn(),
  shapeMaps: {}
}))

vi.mock('@antv/x6', () => ({
  Graph: MockGraph,
  Shape: MockShape,
  Selection: class Selection {}
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
    mockUse.mockClear()
  })

  it('renders toolbar with all six count buttons', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text().trim())

    expect(buttonTexts).toEqual([
      '简单节点',
      '复杂节点',
      '50',
      '500',
      '1000',
      '2000',
      '2500',
      '3000'
    ])
  })

  it('default nodeCount is 50', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(50)
  })

  it('clicking "500" button regenerates 500 nodes and 570 edges', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    // Reset counters after initial mount (which calls addNode)
    mockAddNode.mockClear()
    mockAddEdge.mockClear()
    mockClearCells.mockClear()

    const buttons = wrapper.findAll('button')
    const btn500 = buttons.find((b) => b.text().trim() === '500')
    expect(btn500).toBeDefined()

    await btn500!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(500)

    // Should call clearCells to remove old nodes
    expect(mockClearCells).toHaveBeenCalled()

    expect(mockAddNode).toHaveBeenCalledTimes(500)
    expect(mockAddEdge).toHaveBeenCalledTimes(570)
  })

  it('nodes are arranged in grid with COLS=5', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    mockAddNode.mockClear()
    mockAddEdge.mockClear()
    mockClearCells.mockClear()

    const buttons = wrapper.findAll('button')
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    expect(btn50).toBeDefined()

    await btn50!.trigger('click')
    await nextTick()

    // Check grid layout from addNode calls
    const addNodeCalls = mockAddNode.mock.calls
    expect(addNodeCalls.length).toBe(50)

    const COLS = 5
    const GAP_X = 160
    const GAP_Y = 70

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
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    const btn500 = buttons.find((b) => b.text().trim() === '500')

    expect(btn50!.classes()).toContain('bg-blue-500')

    await btn500!.trigger('click')
    await nextTick()

    const buttonsAfter = wrapper.findAll('button')
    const btn50After = buttonsAfter.find((b) => b.text().trim() === '50')
    const btn500After = buttonsAfter.find((b) => b.text().trim() === '500')

    expect(btn500After!.classes()).toContain('bg-blue-500')
    expect(btn50After!.classes()).not.toContain('bg-blue-500')
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
