import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowVueFlow 节点数控制工具栏测试
 *
 * 功能：在画布左上角添加浮动工具栏，按钮 [50 | 500 | 1000 | 2000 | 2500 | 3000]，
 * 点击后重新生成对应数量的节点（网格排布，cols=5）和边。
 */

// Mock vue-flow components
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
    template:
      '<div class="mock-vue-flow"><slot name="node-default" v-for="n in nodes" :key="n.id" :data="n.data" /></div>'
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

describe('FlowVueFlow node-count toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders toolbar with buttons for 50, 500, 1000, 2000, 2500, 3000 nodes', async () => {
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

  it('default nodeCount is 50 and generates 50 nodes', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default

    const wrapper = mount(FlowVueFlow)
    await nextTick()

    // Access the component's refs via vm
    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(50)

    // The underlying nodes reactive data should have 50 entries
    // We access it via __vue_app__ internals or the component setup state
    // Since nodes is a ref exposed by the setup, it should be accessible
    const nodes = vm.nodes
    expect(nodes).toBeDefined()
    expect(Array.isArray(nodes)).toBe(true)
    expect(nodes.length).toBe(50)

    // Verify grid layout: first node at col 0 row 0, second at col 1 row 0
    // Composables use offset 50, SIMPLE_GAP_X=160, SIMPLE_GAP_Y=70
    expect(nodes[0].position.x).toBe(50) // 50 + 0 * 160
    expect(nodes[0].position.y).toBe(50) // 50 + 0 * 70
    expect(nodes[1].position.x).toBe(210) // 50 + 1 * 160
    expect(nodes[1].position.y).toBe(50)
  })

  it('clicking "500" button changes nodeCount to 500 and regenerates 500 nodes', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default

    const wrapper = mount(FlowVueFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const btn500 = buttons.find((b) => b.text().trim() === '500')
    expect(btn500).toBeDefined()

    await btn500!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(500)
    expect(vm.nodes.length).toBe(500)
    expect(vm.edges.length).toBeGreaterThan(0)
  })

  it('clicking "1000" button regenerates 1000 nodes with grid layout', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default

    const wrapper = mount(FlowVueFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const btn1000 = buttons.find((b) => b.text().trim() === '1000')
    expect(btn1000).toBeDefined()

    await btn1000!.trigger('click')
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.nodeCount).toBe(1000)
    expect(vm.nodes.length).toBe(1000)

    // Grid layout: SIMPLE_COLS=5, SIMPLE_GAP_X=160, SIMPLE_GAP_Y=70, offset=50
    const COLS = 5
    const GAP_X = 160
    const GAP_Y = 70
    const expectPosition = (index: number) => {
      expect(vm.nodes[index].position).toEqual({
        x: 50 + (index % COLS) * GAP_X,
        y: 50 + Math.floor(index / COLS) * GAP_Y
      })
    }

    expectPosition(0)
    expectPosition(COLS - 1)
    expectPosition(COLS)
    expectPosition(999)
  })

  it('generates sequential edges plus cross-links', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default

    const wrapper = mount(FlowVueFlow)
    await nextTick()

    // The default 50 nodes provide a compact edge structure.
    const vm = wrapper.vm as any
    const edges = vm.edges

    // Sequential edges: node i → node i+1 for i=1..49
    const seqEdges = edges.filter((e: any) => {
      const src = Number(e.source)
      const tgt = Number(e.target)
      return tgt === src + 1
    })
    expect(seqEdges.length).toBe(49) // nodes 1→2 through 49→50

    // Cross-links: node i → node i+6 when i%7===0 and i+6 < 50
    // Valid i values: 0, 7, 14, 21, 28, 35, 42 (but i starts at 1 in node IDs)
    // In our edge generation: i runs 0 to count-2, edges from i+1 to i+2
    // Cross-link condition: i % 7 === 0 and i + 5 < count
    // So for count=50: i=0,7,14,21,28,35,42 → cross from i+1 to i+6
    // Node IDs: 1→6, 8→13, 15→20, 22→27, 29→34, 36→41, 43→48
    const crossEdges = edges.filter((e: any) => {
      const src = Number(e.source)
      const tgt = Number(e.target)
      return tgt === src + 5
    })
    expect(crossEdges.length).toBe(7)
  })

  it('active button has blue highlight class', async () => {
    const FlowVueFlow = (await import('../FlowVueFlow.vue')).default

    const wrapper = mount(FlowVueFlow)
    await nextTick()

    const buttons = wrapper.findAll('button')
    const btn50 = buttons.find((b) => b.text().trim() === '50')
    const btn500 = buttons.find((b) => b.text().trim() === '500')

    expect(btn50!.classes()).toContain('bg-blue-500')

    await btn500!.trigger('click')
    await nextTick()

    // Now btn500 should be active, btn50 should not
    const buttonsAfter = wrapper.findAll('button')
    const btn50After = buttonsAfter.find((b) => b.text().trim() === '50')
    const btn500After = buttonsAfter.find((b) => b.text().trim() === '500')

    expect(btn500After!.classes()).toContain('bg-blue-500')
    expect(btn50After!.classes()).not.toContain('bg-blue-500')
  })
})
