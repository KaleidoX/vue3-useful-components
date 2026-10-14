import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { tableMergeFixtureMarkdown } from '../fixtures/tableMergeFixture'
import EditorMilkdownView from '../EditorMilkdownView.vue'

vi.mock('@/components/form/EditorMilkdown/index.vue', () => ({
  default: {
    name: 'EditorMilkdown',
    props: { modelValue: String, simple: Boolean },
    template:
      '<div class="milkdown-stub" :data-simple="String(Boolean(simple))" :data-content="modelValue" />'
  }
}))

describe('EditorMilkdownView', () => {
  it('shows the common table seed without exposing a lossy merge action', () => {
    const wrapper = mount(EditorMilkdownView)
    const editors = wrapper.findAll('.milkdown-stub')

    expect(editors[0]?.attributes('data-content')).toBe(tableMergeFixtureMarkdown)
    expect(wrapper.text()).toContain('当前 Markdown 契约受限')
    expect(wrapper.text()).toContain('不会开放合并按钮')
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
