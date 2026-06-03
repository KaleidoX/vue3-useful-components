import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowLogicFlow 节点数控制工具栏测试
 *
 * 功能：在画布左上角添加浮动工具栏，按钮 [10 | 50 | 100]，
 * 点击后重新渲染对应数量的节点（网格排布，cols=5）和边。
 */

const mockRender = vi.fn()
const mockTranslateCenter = vi.fn()
const mockDestroy = vi.fn()
const mockSetTheme = vi.fn()

const MockLogicFlow = vi.fn(function (this: any, _options: any) {
  this.render = mockRender
  this.translateCenter = mockTranslateCenter
  this.destroy = mockDestroy
  this.setTheme = mockSetTheme
})

vi.mock('@logicflow/core', () => ({
  default: MockLogicFlow,
}))

describe('FlowLogicFlow node-count toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockLogicFlow.mockClear()
    mockRender.mockClear()
    mockTranslateCenter.mockClear()
  })

  it('renders toolbar with buttons for 10, 50, 100 nodes', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text().trim())

    expect(buttonTexts).toContain('10')
    expect(buttonTexts).toContain('50')
    expect(buttonTexts).toContain('100')
  })

  it('default nodeCount is 10', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(10)
  })

  it('clicking "50" button sets nodeCount to 50 and calls lf.render with 50 nodes', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    expect(btn50).toBeDefined()

    await btn50!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(50)

    // lf.render should have been called with the new nodes/edges
    // The initial render happens in onMounted, then this is the second call
    expect(mockRender).toHaveBeenCalledTimes(2) // initial + click

    const renderCall = mockRender.mock.calls[1][0]
    expect(renderCall.nodes.length).toBe(50)

    // Sequential edges: 49 + cross-links (i%7===0 && i+5<50 → 7 cross-links)
    // Total edges: 49 + 7 = 56
    expect(renderCall.edges.length).toBe(56)
  })

  it('clicking "100" button regenerates 100 nodes', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const btn100 = buttons.find((b) => b.text().trim() === '100')
    expect(btn100).toBeDefined()

    await btn100!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(100)

    // lf.render called twice
    expect(mockRender).toHaveBeenCalledTimes(2)

    const renderCall = mockRender.mock.calls[1][0]
    expect(renderCall.nodes.length).toBe(100)

    // 99 sequential + 14 cross-links = 113
    expect(renderCall.edges.length).toBe(113)
  })

  it('nodes are arranged in grid with COLS=5', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    await btn50!.trigger('click')
    await nextTick()

    const renderCall = mockRender.mock.calls[1][0]
    const COLS = 5
    const GAP_X = 160
    const GAP_Y = 70

    for (let i = 0; i < 50; i++) {
      const node = renderCall.nodes[i]
      const expectedX = 40 + (i % COLS) * GAP_X
      const expectedY = 40 + Math.floor(i / COLS) * GAP_Y
      expect(node.x).toBe(expectedX)
      expect(node.y).toBe(expectedY)
      expect(node.id).toBe(String(i + 1))
      expect(node.text).toBe(`N${i + 1}`)
    }
  })

  it('some nodes should be diamond type for visual variety', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    // With 50 nodes, nodes at index i where i%10===6 should be diamond
    // That's nodes with id: 7, 17, 27, 37, 47
    const buttons = wrapper.findAll('button')
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    await btn50!.trigger('click')
    await nextTick()

    const renderCall = mockRender.mock.calls[1][0]
    const diamondNodes = renderCall.nodes.filter((n: any) => n.type === 'diamond')
    expect(diamondNodes.length).toBeGreaterThan(0)

    // Verify the diamond condition: index % 10 === 6 → id = index+1 → id%10 === 7
    for (const node of diamondNodes) {
      const id = Number(node.id)
      expect(id % 10).toBe(7)
    }
  })

  it('active button has highlight class', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const btn10 = buttons.find((b) => b.text().trim() === '10')
    const btn50 = buttons.find((b) => b.text().trim() === '50')

    expect(btn10!.classes()).toContain('bg-blue-500')

    await btn50!.trigger('click')
    await nextTick()

    const buttonsAfter = wrapper.findAll('button')
    const btn10After = buttonsAfter.find((b) => b.text().trim() === '10')
    const btn50After = buttonsAfter.find((b) => b.text().trim() === '50')

    expect(btn50After!.classes()).toContain('bg-blue-500')
    expect(btn10After!.classes()).not.toContain('bg-blue-500')
  })

  it('calls translateCenter after regenerating graph', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    mockTranslateCenter.mockClear()

    const buttons = wrapper.findAll('button')
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    await btn50!.trigger('click')
    await nextTick()

    // translateCenter is called after render
    expect(mockTranslateCenter).toHaveBeenCalled()
  })
})
