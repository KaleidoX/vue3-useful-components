import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { previewRouteGroups } from '@/router/routes'

vi.mock('@/components/flow/FlowElkjsWorker.vue', () => ({
  default: { name: 'FlowElkjsWorker', template: '<div class="elkjs-worker-stub" />' }
}))

describe('FlowElkjsWorkerView', () => {
  it('registers the ELKJS Worker route contract', () => {
    const flowGroup = previewRouteGroups.find((group) => group.key === 'flow')
    const route = flowGroup?.children.find((child) => child.name === 'FlowElkjsWorker')

    expect(route).toMatchObject({
      path: 'elkjs-worker',
      name: 'FlowElkjsWorker',
      meta: {
        title: 'ELKJS Worker',
        description: 'ELKJS 0.11.1 分层自动布局 · Web Worker 计算 · Vue Flow 渲染'
      }
    })
  })

  it('shallow mounts the view after mocking the canvas module', async () => {
    const FlowElkjsWorkerView = (await import('../FlowElkjsWorkerView.vue')).default
    const wrapper = shallowMount(FlowElkjsWorkerView, {
      global: { stubs: { FlowElkjsWorker: false } }
    })

    expect(wrapper.get('h2').text()).toBe('ELKJS Worker')
    expect(wrapper.find('.h-\\[calc\\(100dvh-210px\\)\\]').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'FlowElkjsWorker' }).exists()).toBe(true)
  })
})
