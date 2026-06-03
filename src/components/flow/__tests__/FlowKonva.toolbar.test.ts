import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowKonva toolbar 测试 — 使用共享 useFlowData composable + FlowToolbar
 *
 * Features:
 *   - FlowToolbar: 简单/复杂模式按钮 + [10, 50, 100, 500] 计数按钮
 *   - Composables: useFlowData 管理节点数据和模式
 *   - Konva: 保持所有渲染逻辑
 */

// Mock vue-konva to avoid canvas rendering issues in jsdom
vi.mock('vue-konva', () => {
  const StubComponent = {
    template: '<div class="konva-stub"><slot /></div>',
    props: ['config', 'key'],
    inheritAttrs: false
  }
  return {
    Stage: StubComponent,
    Layer: StubComponent,
    Rect: StubComponent,
    Text: StubComponent,
    Line: StubComponent,
    Group: StubComponent,
    Circle: StubComponent
  }
})

describe('FlowKonva toolbar — 简单节点模式', () => {
  it('toolbar renders mode buttons + count buttons [10, 50, 100, 500]', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const toolbar = wrapper.find('.absolute.left-2.top-2')
    expect(toolbar.exists()).toBe(true)
    const buttons = toolbar.findAll('button')
    // FlowToolbar: 2 mode buttons + 4 count buttons = 6 total in simple mode
    expect(buttons).toHaveLength(6)
    // Mode buttons
    expect(buttons[0].text()).toBe('简单节点')
    expect(buttons[1].text()).toBe('复杂节点')
    // "简单节点" should be active by default
    expect(buttons[0].classes()).toContain('bg-blue-500')
    // Count buttons
    expect(buttons[2].text()).toBe('10')
    expect(buttons[3].text()).toBe('50')
    expect(buttons[4].text()).toBe('100')
    expect(buttons[5].text()).toBe('500')
    // First count button (10) should be active
    expect(buttons[2].classes()).toContain('bg-blue-500')
  })

  it('clicking "50" button regenerates nodes and edges', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    // Initial: 10 nodes (from composable default)
    const vm = wrapper.vm as any
    expect(vm.nodes).toHaveLength(10)

    // Click "50" (button index: 0=简单节点, 1=复杂节点, 2=10, 3=50, 4=100, 5=500)
    const buttons = wrapper.findAll('.absolute.left-2.top-2 button')
    await buttons[3].trigger('click')

    await nextTick()
    expect(vm.nodes).toHaveLength(50)
    // Active class should switch to "50" button
    expect(buttons[3].classes()).toContain('bg-blue-500')
    expect(buttons[2].classes()).not.toContain('bg-blue-500')
  })

  it('node count 10 uses larger node size (100x40) while 50+ use smaller (80x32)', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const vm = wrapper.vm as any
    // Initial 10 nodes should have 100x40
    expect(vm.nodes[0].width).toBe(100)
    expect(vm.nodes[0].height).toBe(40)

    // Click "50" (button index 3)
    const buttons = wrapper.findAll('.absolute.left-2.top-2 button')
    await buttons[3].trigger('click')
    await nextTick()

    // 50 nodes should have 80x32
    expect(vm.nodes[0].width).toBe(80)
    expect(vm.nodes[0].height).toBe(32)
  })
})

describe('FlowKonva toolbar — 复杂节点模式', () => {
  it('default mode is simple (mode === "simple")', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.mode).toBe('simple')
  })

  it('clicking "复杂节点" switches to complex mode and generates 30 complex nodes', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const vm = wrapper.vm as any
    expect(vm.mode).toBe('simple')

    // Click "复杂节点" button (index 1)
    const buttons = wrapper.findAll('.absolute.left-2.top-2 button')
    await buttons[1].trigger('click')
    await nextTick()

    expect(vm.mode).toBe('complex')
    // 20 info + 10 form = 30 total
    expect(vm.nodes).toHaveLength(30)
  })

  it('complex mode generates 20 InfoCard nodes with correct properties', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const vm = wrapper.vm as any
    const buttons = wrapper.findAll('.absolute.left-2.top-2 button')
    await buttons[1].trigger('click')
    await nextTick()

    const infoNodes = vm.nodes.filter((n: any) => n.type === 'info')
    expect(infoNodes).toHaveLength(20)

    // Verify InfoCard structure
    const first = infoNodes[0]
    expect(first.width).toBe(180)
    expect(first.height).toBe(80)
    expect(first.status).toBeDefined()
    expect(first.statusLabel).toBeDefined()
    expect(first.subtitle).toBeDefined()
  })

  it('complex mode generates 10 FormNode nodes with correct properties', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const vm = wrapper.vm as any
    const buttons = wrapper.findAll('.absolute.left-2.top-2 button')
    await buttons[1].trigger('click')
    await nextTick()

    const formNodes = vm.nodes.filter((n: any) => n.type === 'form')
    expect(formNodes).toHaveLength(10)

    // Verify FormNode structure
    const first = formNodes[0]
    expect(first.width).toBe(200)
    expect(first.height).toBe(120)
    expect(first.selectValue).toBeDefined()
    expect(first.toggleValue).toBeDefined()
  })

  it('toggle back to simple mode restores simple nodes with current count', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const vm = wrapper.vm as any
    let buttons = wrapper.findAll('.absolute.left-2.top-2 button')

    // Switch to complex
    await buttons[1].trigger('click')
    await nextTick()
    expect(vm.mode).toBe('complex')
    expect(vm.nodes).toHaveLength(30)

    // Switch back to simple (click "简单节点" button, index 0)
    buttons = wrapper.findAll('.absolute.left-2.top-2 button')
    await buttons[0].trigger('click')
    await nextTick()

    expect(vm.mode).toBe('simple')
    // Default count 10 still active
    expect(vm.nodes).toHaveLength(10)
    // Simple nodes have no type
    expect(vm.nodes[0].type).toBeUndefined()
  })

  it('in complex mode, count buttons are hidden (only mode buttons visible)', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const buttons = wrapper.findAll('.absolute.left-2.top-2 button')

    // Switch to complex (click "复杂节点", index 1)
    await buttons[1].trigger('click')
    await nextTick()

    // In complex mode, only the 2 mode buttons should be visible
    const buttonsAfter = wrapper.findAll('.absolute.left-2.top-2 button')
    expect(buttonsAfter).toHaveLength(2)
    expect(buttonsAfter[0].text()).toBe('简单节点')
    expect(buttonsAfter[1].text()).toBe('复杂节点')
  })
})
