import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowFabric node-count toolbar 测试
 *
 * Feature: 添加节点数量控制工具栏 [10, 50, 100]
 * 点击按钮重新生成整个图。
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
    Point: vi.fn(function (this: any, x: number, y: number) {
      this.x = x
      this.y = y
    }),
  }
})

describe('FlowFabric toolbar', () => {
  it('toolbar renders count buttons [10, 50, 100]', async () => {
    const FlowFabric = (await import('../FlowFabric.vue')).default
    const wrapper = mount(FlowFabric, { attachTo: document.body })
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

  it('clicking "100" button sets active class', async () => {
    const FlowFabric = (await import('../FlowFabric.vue')).default
    const wrapper = mount(FlowFabric, { attachTo: document.body })
    await nextTick()

    const buttons = wrapper.findAll('.absolute.top-2.left-2 button')
    expect(buttons[0].classes()).toContain('bg-blue-500')

    // Click "100" (index 2)
    await buttons[2].trigger('click')
    await nextTick()

    expect(buttons[2].classes()).toContain('bg-blue-500')
    expect(buttons[0].classes()).not.toContain('bg-blue-500')
  })
})
