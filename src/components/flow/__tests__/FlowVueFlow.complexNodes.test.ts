import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowVueFlow 复杂节点模式测试
 *
 * 功能：工具栏新增「简单节点/复杂节点」切换按钮，
 * 复杂模式下展示 6 个 InfoCard 节点 + 4 个 FormNode 节点，使用自定义节点类型。
 */

// Mock vue-flow components — 支持 custom node type slots
vi.mock('@vue-flow/core', () => ({
  VueFlow: {
    name: 'VueFlow',
    props: [
      'nodes',
      'edges',
      'defaultViewport',
      'fitViewOnInit',
      'panOnScroll',
      'zoomOnScroll',
      'zoomActivationKeyCode'
    ],
    template: `<div class="mock-vue-flow">
      <template v-for="n in nodes" :key="n.id">
        <slot :name="'node-' + (n.type || 'default')" :id="n.id" :data="n.data" :type="n.type" />
      </template>
    </div>`
  }
}))

vi.mock('@vue-flow/background', () => ({
  Background: { name: 'Background', template: '<div class="mock-background" />' }
}))

vi.mock('@vue-flow/controls', () => ({
  Controls: { name: 'Controls', template: '<div class="mock-controls" />' }
}))

vi.mock('@vue-flow/minimap', () => ({
  MiniMap: { name: 'MiniMap', template: '<div class="mock-minimap" />' }
}))

// Mock child components
vi.mock('../nodes/FlowNodeInfo.vue', () => ({
  default: {
    name: 'FlowNodeInfo',
    props: ['title', 'subtitle', 'status', 'statusLabel'],
    template: '<div class="mock-info-node">{{ title }}</div>'
  }
}))

vi.mock('../nodes/FlowNodeForm.vue', () => ({
  default: {
    name: 'FlowNodeForm',
    props: ['title', 'inputValue', 'selectValue', 'toggleValue'],
    emits: ['update:inputValue', 'update:selectValue', 'update:toggleValue'],
    template: '<div class="mock-form-node">{{ title }}</div>'
  }
}))

describe('FlowVueFlow complex node mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders mode toggle buttons: 简单节点 and 复杂节点', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default
    const wrapper = mount(FlowVueFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text().trim())

    expect(buttonTexts).toContain('简单节点')
    expect(buttonTexts).toContain('复杂节点')
  })

  it('default mode is simple and renders all six count buttons', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default
    const wrapper = mount(FlowVueFlow)
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

  it('switching to 复杂节点 generates 20 info nodes + 10 form nodes = 30 total', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default
    const wrapper = mount(FlowVueFlow)
    await nextTick()

    // Click 复杂节点 button
    const buttons = wrapper.findAll('button')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')
    expect(complexBtn).toBeDefined()
    await complexBtn!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.mode).toBe('complex')
    expect(vm.nodes.length).toBe(30)

    const infoNodes = vm.nodes.filter((n: any) => n.type === 'info')
    const formNodes = vm.nodes.filter((n: any) => n.type === 'form')

    expect(infoNodes.length).toBe(20)
    expect(formNodes.length).toBe(10)
  })

  it('complex mode info nodes have Chinese labels and correct type', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default
    const wrapper = mount(FlowVueFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')
    await complexBtn!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    const infoNodes = vm.nodes.filter((n: any) => n.type === 'info')

    expect(infoNodes[0].data.title).toBe('服务器 A')
    expect(infoNodes[0].data.status).toBe('success')
    expect(infoNodes[0].data.statusLabel).toBe('正常')

    // Check we have nodes with warning and danger statuses
    const statuses = infoNodes.map((n: any) => n.data.status)
    expect(statuses).toContain('warning')
    expect(statuses).toContain('danger')
  })

  it('complex mode form nodes have Chinese titles and reactive state initialized', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default
    const wrapper = mount(FlowVueFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')
    await complexBtn!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    const formNodes = vm.nodes.filter((n: any) => n.type === 'form')

    expect(formNodes[0].data.label).toBe('用户信息')
    expect(formNodes[1].data.label).toBe('系统配置')
    expect(formNodes[2].data.label).toBe('通知设置')
    expect(formNodes[3].data.label).toBe('权限管理')

    // Form node states should be initialized (via composable's formData)
    expect(vm.formData).toBeDefined()
    const form1 = vm.formData.find((n: any) => n.id === 'form-1')
    expect(form1).toBeDefined()
    expect(form1.inputValue).toBe('张三')
    expect(form1.selectValue).toBe('option1')
    expect(form1.toggleValue).toBe(true)
  })

  it('complex mode generates edges connecting info and form nodes', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default
    const wrapper = mount(FlowVueFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')
    await complexBtn!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    const edges = vm.edges

    expect(edges.length).toBeGreaterThan(0)

    // Should have sequential info edges
    const infoSeqEdge = edges.find((e: any) => e.source === 'info-1' && e.target === 'info-2')
    expect(infoSeqEdge).toBeDefined()

    // Should have cross-row edges (COMPLEX_COLS=4 → info-1 cross to info-5)
    const crossEdge = edges.find((e: any) => e.source === 'info-1' && e.target === 'info-5')
    expect(crossEdge).toBeDefined()

    // Should connect last info to first form (info-20 to form-1)
    const bridgeEdge = edges.find((e: any) => e.source === 'info-20' && e.target === 'form-1')
    expect(bridgeEdge).toBeDefined()

    // Should have sequential form edges
    const formSeqEdge = edges.find((e: any) => e.source === 'form-1' && e.target === 'form-2')
    expect(formSeqEdge).toBeDefined()
  })

  it('switching back to 简单节点 restores count buttons and preserves simple mode', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default
    const wrapper = mount(FlowVueFlow)
    await nextTick()

    // First switch to complex
    let buttons = wrapper.findAll('button')
    const complexBtn = buttons.find((b) => b.text().trim() === '复杂节点')
    await complexBtn!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.mode).toBe('complex')

    // Then switch back to simple
    buttons = wrapper.findAll('button')
    const simpleBtn = buttons.find((b) => b.text().trim() === '简单节点')
    await simpleBtn!.trigger('click')
    await nextTick()

    expect(vm.mode).toBe('simple')

    // Count buttons should be visible again
    buttons = wrapper.findAll('button')
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
})
