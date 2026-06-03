import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowLogicFlow 复杂节点模式测试
 *
 * 功能：工具栏添加切换按钮，在"简单节点"和"复杂节点"之间切换。
 * 复杂节点模式：显示 20 个 InfoCard 节点 + 10 个 FormNode 节点（使用共享 useFlowData composable）。
 * 使用 LogicFlow 的 HTML node 机制注册自定义节点类型。
 */

const mockRegister = vi.fn()
const mockBatchRegister = vi.fn()
const mockRender = vi.fn()
const mockTranslateCenter = vi.fn()
const mockDestroy = vi.fn()
const mockSetTheme = vi.fn()

// HtmlNodeModel mock — 必须是真实的 class，因为组件会用 extends 继承
class MockHtmlNodeModel {
  modelType: string
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
    this.modelType = 'html-node'
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
  setHtmlCalls: SVGForeignObjectElement[]

  constructor(props?: any) {
    this.props = props ?? { model: new MockHtmlNodeModel(), graphModel: null }
    this.ref = { current: null }
    this.setHtmlCalls = []
  }

  setHtml(rootEl: SVGForeignObjectElement) {
    this.setHtmlCalls.push(rootEl)
  }

  shouldUpdate() {
    return true
  }

  componentDidMount() {
    if (this.shouldUpdate() && this.ref.current) {
      this.setHtml(this.ref.current)
    }
  }

  componentDidUpdate() {
    if (this.shouldUpdate() && this.ref.current) {
      this.setHtml(this.ref.current)
    }
  }

  componentWillUnmount() {
    if (this.ref.current) {
      this.ref.current.innerHTML = ''
    }
  }

  get rootEl() {
    return this.ref.current
  }

  getShape() {
    return null
  }
}

const MockLogicFlow = vi.fn(function (this: any) {
  this.render = mockRender
  this.translateCenter = mockTranslateCenter
  this.destroy = mockDestroy
  this.setTheme = mockSetTheme
  this.register = mockRegister
  this.batchRegister = mockBatchRegister
})

vi.mock('@logicflow/core', () => ({
  default: MockLogicFlow,
  HtmlNodeModel: MockHtmlNodeModel,
  HtmlNode: MockHtmlNode
}))

// 辅助函数，在文本内容中查找按钮
function findButtonByText(wrapper: ReturnType<typeof mount>, text: string) {
  const buttons = wrapper.findAll('button')
  return buttons.find((b) => b.text().trim() === text)
}

describe('FlowLogicFlow complex node mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockLogicFlow.mockClear()
    mockRegister.mockClear()
    mockRender.mockClear()
    mockTranslateCenter.mockClear()
  })

  it('toolbar renders a mode toggle button with label "复杂节点" initially', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    const toggleBtn = findButtonByText(wrapper, '复杂节点')
    expect(toggleBtn).toBeDefined()
  })

  it('default mode is simple (nodeCount=10, registers complex types proactively)', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    // 默认应该是简单模式
    const vm = wrapper.vm as any
    expect(vm.mode).toBe('simple')

    // register 在初始化时被调用来预注册复杂节点类型（即使当前是简单模式）
    expect(mockRegister).toHaveBeenCalled()
  })

  it('clicking mode toggle switches to complex mode', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    // 清理 onMounted 中的 mock 调用记录，只关注切换后的行为
    mockRegister.mockClear()
    mockRender.mockClear()
    mockTranslateCenter.mockClear()

    const toggleBtn = findButtonByText(wrapper, '复杂节点')
    expect(toggleBtn).toBeDefined()
    await toggleBtn!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.mode).toBe('complex')

    // 切换后简单节点按钮应存在且处于非高亮状态
    const toggleBtnAfter = findButtonByText(wrapper, '简单节点')
    expect(toggleBtnAfter).toBeDefined()
  })

  it('complex mode registers info-card and form-node custom types during init', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    mount(FlowLogicFlow)
    await nextTick()

    // register 在 onMounted 中调用，预注册 info-card 和 form-node
    expect(mockRegister.mock.calls.length).toBeGreaterThanOrEqual(2)

    // 检查注册的类型名称
    const registeredTypes = mockRegister.mock.calls.map((call: any) => {
      if (typeof call[0] === 'object' && call[0].type) {
        return call[0].type
      }
      if (typeof call[0] === 'string') {
        return call[0]
      }
      return null
    })
    expect(registeredTypes).toContain('info-card')
    expect(registeredTypes).toContain('form-node')
  })

  it('complex mode renders 20 InfoCard nodes and 10 FormNode nodes', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    // 清理初始 render
    mockRender.mockClear()

    const toggleBtn = findButtonByText(wrapper, '复杂节点')
    await toggleBtn!.trigger('click')
    await nextTick()

    // render 应该被调用
    expect(mockRender).toHaveBeenCalledTimes(1)

    const renderCall = mockRender.mock.calls[0][0]
    expect(renderCall.nodes).toBeDefined()
    expect(renderCall.nodes.length).toBe(30)

    const infoNodes = renderCall.nodes.filter((n: any) => n.type === 'info-card')
    const formNodes = renderCall.nodes.filter((n: any) => n.type === 'form-node')

    expect(infoNodes.length).toBe(20)
    expect(formNodes.length).toBe(10)

    // InfoCard 节点应有 properties
    for (const node of infoNodes) {
      expect(node.properties).toBeDefined()
      expect(node.properties.title).toBeTruthy()
      expect(node.properties.status).toBeTruthy()
    }

    // FormNode 节点应有 properties（inputValue/selectValue/toggleValue 由 composable formData 管理）
    for (const node of formNodes) {
      expect(node.properties).toBeDefined()
      expect(node.properties.title).toBeTruthy()
    }
  })

  it('complex mode nodes have edges connecting them', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    mockRender.mockClear()

    const toggleBtn = findButtonByText(wrapper, '复杂节点')
    await toggleBtn!.trigger('click')
    await nextTick()

    const renderCall = mockRender.mock.calls[0][0]
    expect(renderCall.edges).toBeDefined()
    expect(renderCall.edges.length).toBeGreaterThan(0)

    // 边应该引用存在的节点 id
    const nodeIds = new Set(renderCall.nodes.map((n: any) => n.id))
    for (const edge of renderCall.edges) {
      expect(nodeIds.has(edge.sourceNodeId)).toBe(true)
      expect(nodeIds.has(edge.targetNodeId)).toBe(true)
    }
  })

  it('clicking back to simple mode switches to simple nodes', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    // 先切换到复杂模式
    let toggleBtn = findButtonByText(wrapper, '复杂节点')
    await toggleBtn!.trigger('click')
    await nextTick()

    // 现在切换回简单模式
    mockRender.mockClear()

    toggleBtn = findButtonByText(wrapper, '简单节点')
    expect(toggleBtn).toBeDefined()
    await toggleBtn!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.mode).toBe('simple')

    // render 应该被调用，nodes 使用简单类型 (rect/diamond)
    expect(mockRender).toHaveBeenCalled()
    const renderCall = mockRender.mock.calls[0][0]
    const nodeTypes = renderCall.nodes.map((n: any) => n.type)
    expect(nodeTypes).toContain('rect')
    expect(nodeTypes).not.toContain('info-card')
    expect(nodeTypes).not.toContain('form-node')
  })

  it('mode toggle button shows correct label based on current mode', async () => {
    const FlowLogicFlow = (await import('../FlowLogicFlow.vue')).default

    const wrapper = mount(FlowLogicFlow)
    await nextTick()

    // 简单模式时显示"复杂节点"
    expect(findButtonByText(wrapper, '复杂节点')).toBeDefined()

    // 切换到复杂模式
    await findButtonByText(wrapper, '复杂节点')!.trigger('click')
    await nextTick()

    // 复杂模式时显示"简单节点"
    expect(findButtonByText(wrapper, '简单节点')).toBeDefined()
  })
})
