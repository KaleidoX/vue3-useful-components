import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowFabric node-count toolbar 测试
 *
 * Feature: 添加节点数量控制工具栏 [10, 50, 100]
 * 点击按钮重新生成整个图。
 *
 * 重构后使用共享 FlowToolbar 组件：
 * - 模式按钮（简单节点、复杂节点）在前
 * - 数量按钮仅在简单模式下可见（通过 v-if 控制）
 * - 复杂模式下数量按钮被隐藏（非 disabled）
 */

// Mock fabric to avoid canvas rendering issues in jsdom
vi.mock('fabric', () => {
  const MockRect = vi.fn(function (this: any, opts?: any) {
    Object.assign(this, opts ?? {})
    this.on = vi.fn()
  })
  const MockText = vi.fn(function (this: any, text: string, opts?: any) {
    this.text = text
    Object.assign(this, opts ?? {})
    this.set = vi.fn()
    this.setCoords = vi.fn()
  })
  const MockLine = vi.fn(function (this: any, points: number[], opts?: any) {
    this.x1 = points[0]
    this.y1 = points[1]
    this.x2 = points[2]
    this.y2 = points[3]
    Object.assign(this, opts ?? {})
    this.set = vi.fn()
    this.setCoords = vi.fn()
  })
  const MockCircle = vi.fn(function (this: any, opts?: any) {
    Object.assign(this, opts ?? {})
    this.set = vi.fn()
    this.setCoords = vi.fn()
  })
  const MockCanvas = vi.fn(function (this: any, _el: any, opts?: any) {
    Object.assign(this, opts ?? {})
    this.add = vi.fn()
    this.clear = vi.fn()
    this.sendObjectToBack = vi.fn()
    this.requestRenderAll = vi.fn()
    this.dispose = vi.fn()
    this.on = vi.fn()
    this.getZoom = vi.fn(() => 1)
    this.zoomToPoint = vi.fn()
    this.viewportTransform = [1, 0, 0, 1, 0, 0]
  })
  return {
    Canvas: MockCanvas,
    Rect: MockRect,
    FabricText: MockText,
    Line: MockLine,
    Circle: MockCircle,
    Point: vi.fn(function (this: any, x: number, y: number) {
      this.x = x
      this.y = y
    })
  }
})

describe('FlowFabric toolbar', () => {
  it('toolbar renders mode buttons [简单节点, 复杂节点] and count buttons [10, 50, 100]', async () => {
    const FlowFabric = (await import('../FlowFabric.vue')).default
    const wrapper = mount(FlowFabric, { attachTo: document.body })
    await nextTick()

    const toolbar = wrapper.find('.absolute.left-2.top-2')
    expect(toolbar.exists()).toBe(true)
    const buttons = toolbar.findAll('button')
    // FlowToolbar order: 简单节点, 复杂节点, 10, 50, 100
    expect(buttons).toHaveLength(5)
    expect(buttons[0].text()).toBe('简单节点')
    expect(buttons[1].text()).toBe('复杂节点')
    expect(buttons[2].text()).toBe('10')
    expect(buttons[3].text()).toBe('50')
    expect(buttons[4].text()).toBe('100')
    // 简单节点 should be active by default
    expect(buttons[0].classes()).toContain('bg-blue-500')
    // First count button (10) should be active by default
    expect(buttons[2].classes()).toContain('bg-blue-500')
  })

  it('clicking "100" button sets active class', async () => {
    const FlowFabric = (await import('../FlowFabric.vue')).default
    const wrapper = mount(FlowFabric, { attachTo: document.body })
    await nextTick()

    const buttons = wrapper.findAll('.absolute.left-2.top-2 button')
    // Button 10 at index 2 should be active by default
    expect(buttons[2].classes()).toContain('bg-blue-500')

    // Click "100" (index 4)
    await buttons[4].trigger('click')
    await nextTick()

    expect(buttons[4].classes()).toContain('bg-blue-500')
    expect(buttons[2].classes()).not.toContain('bg-blue-500')
  })

  it('clicking "复杂节点" activates complex mode and hides count buttons', async () => {
    const FlowFabric = (await import('../FlowFabric.vue')).default
    const wrapper = mount(FlowFabric, { attachTo: document.body })
    await nextTick()

    const toolbar = wrapper.find('.absolute.left-2.top-2')

    // Click "复杂节点" (index 1)
    let buttons = toolbar.findAll('button')
    await buttons[1].trigger('click')
    await nextTick()

    // After switching to complex mode, count buttons are hidden (v-if)
    buttons = toolbar.findAll('button')
    expect(buttons).toHaveLength(2) // only mode buttons
    expect(buttons[0].text()).toBe('简单节点')
    expect(buttons[1].text()).toBe('复杂节点')
    // Complex mode button should be active
    expect(buttons[1].classes()).toContain('bg-blue-500')
    // Simple mode button should not be active
    expect(buttons[0].classes()).not.toContain('bg-blue-500')
  })

  it('clicking "简单节点" re-activates simple mode and shows count buttons', async () => {
    const FlowFabric = (await import('../FlowFabric.vue')).default
    const wrapper = mount(FlowFabric, { attachTo: document.body })
    await nextTick()

    const toolbar = wrapper.find('.absolute.left-2.top-2')

    // First switch to complex
    let buttons = toolbar.findAll('button')
    await buttons[1].trigger('click')
    await nextTick()

    // Verify complex mode active
    buttons = toolbar.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[1].classes()).toContain('bg-blue-500')

    // Then switch back to simple
    await buttons[0].trigger('click')
    await nextTick()

    // Count buttons should be visible again
    buttons = toolbar.findAll('button')
    expect(buttons).toHaveLength(5)
    expect(buttons[0].classes()).toContain('bg-blue-500')
    expect(buttons[1].classes()).not.toContain('bg-blue-500')
  })
})
