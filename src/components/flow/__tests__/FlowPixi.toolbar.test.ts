import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowPixi node-count toolbar 测试
 *
 * Feature: 添加节点数量控制工具栏 [10, 50, 100, 500]
 * 点击按钮重新生成整个图。
 */

// Mock pixi.js to avoid WebGL/canvas rendering issues in jsdom
vi.mock('pixi.js', () => {
  const MockContainer = vi.fn(function (this: any) {
    this.children = []
    this.x = 0
    this.y = 0
    this.scale = { x: 1, y: 1 }
    this.eventMode = 'static'
    this.hitArea = null
    this.cursor = 'default'
    this.alpha = 1
    this.addChild = vi.fn()
    this.removeChildren = vi.fn()
    this.on = vi.fn()
  })
  const MockGraphics = vi.fn(function (this: any) {
    this.clear = vi.fn()
    this.moveTo = vi.fn()
    this.lineTo = vi.fn()
    this.stroke = vi.fn()
    this.fill = vi.fn()
    this.roundRect = vi.fn()
  })
  const MockText = vi.fn(function (this: any, opts?: any) {
    this.text = opts?.text ?? ''
    this.x = 0
    this.y = 0
    this.anchor = { set: vi.fn() }
  })
  const MockTextStyle = vi.fn()
  const MockApplication = vi.fn(function (this: any) {
    this.init = vi.fn().mockResolvedValue(undefined)
    this.canvas = document.createElement('canvas')
    this.stage = new MockContainer()
    this.screen = { width: 800, height: 600 }
    this.destroy = vi.fn()
    this.render = vi.fn()
  })
  return {
    Application: MockApplication,
    Graphics: MockGraphics,
    Text: MockText,
    TextStyle: MockTextStyle,
    Container: MockContainer,
  }
})

describe('FlowPixi toolbar', () => {
  it('toolbar renders count buttons [10, 50, 100, 500]', async () => {
    const FlowPixi = (await import('../FlowPixi.vue')).default
    const wrapper = mount(FlowPixi, { attachTo: document.body })
    await nextTick()

    const toolbar = wrapper.find('.absolute.top-2.left-2')
    expect(toolbar.exists()).toBe(true)
    const buttons = toolbar.findAll('button')
    expect(buttons).toHaveLength(4)
    expect(buttons[0].text()).toBe('10')
    expect(buttons[1].text()).toBe('50')
    expect(buttons[2].text()).toBe('100')
    expect(buttons[3].text()).toBe('500')
    // First button (10) should be active
    expect(buttons[0].classes()).toContain('bg-blue-500')
  })

  it('clicking "100" button sets active class', async () => {
    const FlowPixi = (await import('../FlowPixi.vue')).default
    const wrapper = mount(FlowPixi, { attachTo: document.body })
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
