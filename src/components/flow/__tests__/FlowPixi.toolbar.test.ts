import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

/**
 * FlowPixi toolbar 测试 — 使用共享 FlowToolbar 组件和 useFlowData composable
 *
 * FlowToolbar 在 simple 模式下显示：2 个模式按钮 + 6 个数量按钮 = 8 个按钮
 * FlowToolbar 在 complex 模式下显示：2 个模式按钮
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
    this.circle = vi.fn()
    this.ellipse = vi.fn()
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
    Container: MockContainer
  }
})

describe('FlowPixi toolbar', () => {
  it('renders 2 mode buttons and 6 count buttons in simple mode (default)', async () => {
    const FlowPixi = (await import('../FlowPixi.vue')).default
    const wrapper = mount(FlowPixi, { attachTo: document.body })
    await nextTick()

    const allButtons = wrapper.findAll('button')
    expect(allButtons).toHaveLength(8)

    // Mode buttons exist
    const simpleBtn = allButtons.find((b) => b.text() === '简单节点')
    const complexBtn = allButtons.find((b) => b.text() === '复杂节点')
    expect(simpleBtn).toBeTruthy()
    expect(complexBtn).toBeTruthy()

    // 简单节点 should be active (default mode is 'simple')
    expect(simpleBtn!.classes()).toContain('bg-blue-500')
    expect(complexBtn!.classes()).not.toContain('bg-blue-500')

    // Count buttons
    const countButtons = allButtons.filter((b) =>
      ['50', '500', '1000', '2000', '2500', '3000'].includes(b.text())
    )
    expect(countButtons.map((button) => button.text())).toEqual([
      '50',
      '500',
      '1000',
      '2000',
      '2500',
      '3000'
    ])
    // First count button (50) should be active
    expect(countButtons[0].classes()).toContain('bg-blue-500')
  })

  it('clicking count button "500" activates it and deactivates "50"', async () => {
    const FlowPixi = (await import('../FlowPixi.vue')).default
    const wrapper = mount(FlowPixi, { attachTo: document.body })
    await nextTick()

    const allButtons = wrapper.findAll('button')
    const btn50 = allButtons.find((b) => b.text() === '50')!
    const btn500 = allButtons.find((b) => b.text() === '500')!

    expect(btn50.classes()).toContain('bg-blue-500')
    expect(btn500.classes()).not.toContain('bg-blue-500')

    await btn500.trigger('click')
    await nextTick()

    expect(btn500.classes()).toContain('bg-blue-500')
    expect(btn50.classes()).not.toContain('bg-blue-500')
  })

  it('switches to complex mode — hides count buttons and activates 复杂节点', async () => {
    const FlowPixi = (await import('../FlowPixi.vue')).default
    const wrapper = mount(FlowPixi, { attachTo: document.body })
    await nextTick()

    // Click 复杂节点 to switch to complex mode
    const complexBtn = wrapper.findAll('button').find((b) => b.text() === '复杂节点')!
    await complexBtn.trigger('click')
    await nextTick()

    // Only 2 mode buttons visible (count buttons hidden)
    const allButtons = wrapper.findAll('button')
    expect(allButtons).toHaveLength(2)

    // 复杂节点 should be active
    expect(complexBtn.classes()).toContain('bg-blue-500')
  })

  it('switches back to simple mode — count buttons reappear', async () => {
    const FlowPixi = (await import('../FlowPixi.vue')).default
    const wrapper = mount(FlowPixi, { attachTo: document.body })
    await nextTick()

    // Switch to complex
    const complexBtn = wrapper.findAll('button').find((b) => b.text() === '复杂节点')!
    await complexBtn.trigger('click')
    await nextTick()

    // Switch back to simple
    const simpleBtn = wrapper.findAll('button').find((b) => b.text() === '简单节点')!
    await simpleBtn.trigger('click')
    await nextTick()

    // 8 buttons again
    const allButtons = wrapper.findAll('button')
    expect(allButtons).toHaveLength(8)

    // 简单节点 should be active
    expect(simpleBtn.classes()).toContain('bg-blue-500')
  })
})
