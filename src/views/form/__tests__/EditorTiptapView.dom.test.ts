import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { tableMergeFixtureHtml } from '../fixtures/tableMergeFixture'
import EditorTiptapView from '../EditorTiptapView.vue'

vi.mock('@/components/form/EditorTiptap/index.vue', () => ({
  default: {
    name: 'EditorTiptap',
    props: { modelValue: String, simple: Boolean },
    template:
      '<div class="tiptap-stub" :data-simple="String(Boolean(simple))" :data-content="modelValue" />'
  }
}))

describe('EditorTiptapView', () => {
  it('seeds full mode with the shared fixture and exposes a rebuild path', () => {
    const wrapper = mount(EditorTiptapView)
    const editors = wrapper.findAll('.tiptap-stub')

    expect(editors).toHaveLength(2)
    expect(editors[0]?.attributes('data-content')).toBe(tableMergeFixtureHtml)
    expect(editors[0]?.attributes('data-simple')).toBe('false')
    expect(editors[1]?.attributes('data-simple')).toBe('true')
    expect(wrapper.text()).toContain('拖选 A1:B2')
    expect(wrapper.text()).toContain('重建编辑器')
  })
})
