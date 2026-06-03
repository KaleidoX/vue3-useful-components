import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowAntvX6 复杂节点模式测试
 *
 * 功能：在工具栏添加 "简单节点" 和 "复杂节点" 两个按钮。
 * 简单模式下显示普通 Rect 节点。
 * 复杂模式下显示 20 个 InfoCard 节点 + 10 个 FormNode 节点（共 30 个）。
 */

const mockClearCells = vi.fn()
const mockAddNode = vi.fn()
const mockAddEdge = vi.fn()
const mockCenterContent = vi.fn()
const mockResize = vi.fn()
const mockDispose = vi.fn()

let nodeIdCounter = 0

// Mock Graph.registerNode as static method
const mockRegisterNode = vi.fn()

const MockGraph = vi.fn(function (this: any) {
  this.clearCells = mockClearCells
  this.addNode = mockAddNode.mockImplementation(() => {
    return { id: `node-${++nodeIdCounter}` }
  })
  this.addEdge = mockAddEdge
  this.centerContent = mockCenterContent
  this.resize = mockResize
  this.dispose = mockDispose
})
;(MockGraph as any).registerNode = mockRegisterNode

const MockShape = {
  Rect: vi.fn()
}

vi.mock('@antv/x6-vue-shape', () => ({
  register: vi.fn(),
  shapeMaps: {}
}))

vi.mock('@antv/x6', () => ({
  Graph: MockGraph,
  Shape: MockShape
}))

describe('FlowAntvX6 complex-node toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockGraph.mockClear()
    mockRegisterNode.mockClear()
    nodeIdCounter = 0
    mockAddNode.mockClear()
    mockAddEdge.mockClear()
    mockClearCells.mockClear()
    mockCenterContent.mockClear()
  })

  it('renders both "简单节点" and "复杂节点" mode buttons', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const simpleBtn = buttons.find((b) => b.text().trim() === '简单节点')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')
    expect(simpleBtn).toBeDefined()
    expect(complexBtn).toBeDefined()
  })

  it('"简单节点" button has active class by default', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const simpleBtn = buttons.find((b) => b.text().trim() === '简单节点')
    expect(simpleBtn!.classes()).toContain('bg-blue-500')
  })

  it('clicking "复杂节点" button switches mode and regenerates graph', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    // Reset mocks after initial mount
    mockAddNode.mockClear()
    mockAddEdge.mockClear()
    mockClearCells.mockClear()

    const buttons = wrapper.findAll('button')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')
    await complexBtn!.trigger('click')
    await nextTick()

    // Should have cleared cells and regenerated
    expect(mockClearCells).toHaveBeenCalled()
  })

  it('complex mode creates 30 total nodes (20 info + 10 form)', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    // Reset after initial mount
    mockAddNode.mockClear()
    mockClearCells.mockClear()

    // Switch to complex mode
    const buttons = wrapper.findAll('button')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')
    await complexBtn!.trigger('click')
    await nextTick()

    // Should add 30 nodes total (20 info + 10 form)
    expect(mockAddNode).toHaveBeenCalledTimes(30)
  })

  it('switching back to simple mode regenerates simple rect nodes', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    // Switch to complex mode first
    let buttons = wrapper.findAll('button')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')
    await complexBtn!.trigger('click')
    await nextTick()

    mockAddNode.mockClear()
    mockClearCells.mockClear()

    // Switch back to simple mode
    buttons = wrapper.findAll('button')
    const simpleBtn = buttons.find((b) => b.text().trim() === '简单节点')
    await simpleBtn!.trigger('click')
    await nextTick()

    // Should be back to 10 simple nodes (default nodeCount)
    expect(mockAddNode).toHaveBeenCalledTimes(10)
  })

  it('active highlight switches between mode buttons', async () => {
    const FlowAntvX6 = (await import('../FlowAntvX6.vue')).default

    const wrapper = mount(FlowAntvX6)
    await nextTick()

    let buttons = wrapper.findAll('button')
    const simpleBtn = buttons.find((b) => b.text().trim() === '简单节点')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')

    // Simple mode active by default
    expect(simpleBtn!.classes()).toContain('bg-blue-500')
    expect(complexBtn!.classes()).not.toContain('bg-blue-500')

    // Switch to complex
    await complexBtn!.trigger('click')
    await nextTick()

    buttons = wrapper.findAll('button')
    const simpleBtnAfter = buttons.find((b) => b.text().trim() === '简单节点')
    const complexBtnAfter = buttons.find((b) => b.text().trim() === '复杂节点')

    expect(complexBtnAfter!.classes()).toContain('bg-blue-500')
    expect(simpleBtnAfter!.classes()).not.toContain('bg-blue-500')
  })
})
