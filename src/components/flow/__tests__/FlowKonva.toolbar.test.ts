import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowKonva node-count toolbar 测试
 *
 * Feature: 添加节点数量控制工具栏 [10, 50, 100]
 * 点击按钮重新生成整个图。
 */

// Mock vue-konva to avoid canvas rendering issues in jsdom
vi.mock('vue-konva', () => {
  const StubComponent = {
    template: '<div class="konva-stub"><slot /></div>',
    props: ['config', 'key'],
    inheritAttrs: false,
  }
  return {
    Stage: StubComponent,
    Layer: StubComponent,
    Rect: StubComponent,
    Text: StubComponent,
    Line: StubComponent,
    Group: StubComponent,
  }
})

describe('FlowKonva toolbar', () => {
  it('toolbar renders count buttons [10, 50, 100]', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const toolbar = wrapper.find('.absolute.top-2.left-2')
    expect(toolbar.exists()).toBe(true)
    const buttons = toolbar.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toBe('10')
    expect(buttons[1].text()).toBe('50')
    expect(buttons[2].text()).toBe('100')
    // First button (10) should be active
    expect(buttons[0].classes()).toContain('bg-blue-500')
  })

  it('clicking "50" button regenerates nodes and edges', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    // Initial: 10 nodes
    const vm = wrapper.vm as any
    expect(vm.nodes).toHaveLength(10)

    // Click "50"
    const buttons = wrapper.findAll('.absolute.top-2.left-2 button')
    await buttons[1].trigger('click')

    await nextTick()
    expect(vm.nodes).toHaveLength(50)
    // Active class should switch to "50" button
    expect(buttons[1].classes()).toContain('bg-blue-500')
    expect(buttons[0].classes()).not.toContain('bg-blue-500')
  })

  it('node count 10 uses larger node size (100x40) while 50/100 use smaller (80x32)', async () => {
    const FlowKonva = (await import('../FlowKonva.vue')).default
    const wrapper = mount(FlowKonva, { attachTo: document.body })
    await nextTick()

    const vm = wrapper.vm as any
    // Initial 10 nodes should have 100x40
    expect(vm.nodes[0].width).toBe(100)
    expect(vm.nodes[0].height).toBe(40)

    // Click "50"
    const buttons = wrapper.findAll('.absolute.top-2.left-2 button')
    await buttons[1].trigger('click')
    await nextTick()

    // 50 nodes should have 80x32
    expect(vm.nodes[0].width).toBe(80)
    expect(vm.nodes[0].height).toBe(32)
  })
})
