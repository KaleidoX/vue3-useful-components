import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowLogicFlow 节点数控制工具栏测试
 *
 * 功能：在画布左上角添加浮动工具栏，按钮 [50 | 500 | 1000 | 2000 | 2500 | 3000] 和模式切换按钮，
 * 点击后重新渲染对应数量的节点（网格排布，cols=5）和边。
 */

const mockRegister = vi.fn()
const mockRender = vi.fn()
const mockTranslateCenter = vi.fn()
const mockDestroy = vi.fn()
const mockSetTheme = vi.fn()

const MockLogicFlow = vi.fn(function (this: any) {
  this.register = mockRegister
  this.render = mockRender
  this.translateCenter = mockTranslateCenter
  this.destroy = mockDestroy
  this.setTheme = mockSetTheme
})

// HtmlNodeModel mock — 必须是真实的 class，因为组件会用 extends 继承
class MockHtmlNodeModel {
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, unknown>

  constructor(data?: any) {
    this.x = data?.x ?? 0
    this.y = data?.y ?? 0
    this.width = data?.properties?.width ?? 200
    this.height = data?.properties?.height ?? 80
    this.properties = data?.properties ?? {}
  }

  setAttributes() {}
  getNodeStyle() {
    return {}
  }
  getDefaultAnchor() {
    return []
  }
}

// HtmlNode mock — 必须是真实的 class
class MockHtmlNode {
  ref: { current: SVGForeignObjectElement | null }
  props: { model: MockHtmlNodeModel; graphModel: any }

  constructor(props?: any) {
    this.props = props ?? { model: new MockHtmlNodeModel(), graphModel: null }
    this.ref = { current: null }
  }

  setHtml() {}
  shouldUpdate() {
    return true
  }
  componentDidMount() {}
  componentDidUpdate() {}
  componentWillUnmount() {}
}

vi.mock('@logicflow/core', () => ({
  default: MockLogicFlow,
  HtmlNodeModel: MockHtmlNodeModel,
  HtmlNode: MockHtmlNode
}))

describe('FlowLogicFlow node-count toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockLogicFlow.mockClear()
    mockRegister.mockClear()
    mockRender.mockClear()
    mockTranslateCenter.mockClear()
  })

  it('renders toolbar with all six count buttons and mode toggle', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
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
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(50)
  })

  it('clicking "500" button renders 500 nodes and 570 edges', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const btn500 = buttons.find((b) => b.text().trim() === '500')
    expect(btn500).toBeDefined()

    await btn500!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(500)

    // lf.render should have been called with the new nodes/edges
    // The initial render happens in onMounted, then this is the second call
    expect(mockRender).toHaveBeenCalledTimes(2) // initial + click

    const renderCall = mockRender.mock.calls[1][0]
    expect(renderCall.nodes.length).toBe(500)

    expect(renderCall.edges.length).toBe(570)
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
