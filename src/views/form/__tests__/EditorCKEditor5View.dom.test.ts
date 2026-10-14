import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { tableMergeFixtureHtml } from '../fixtures/tableMergeFixture'
import EditorCKEditor5View from '../EditorCKEditor5View.vue'

vi.mock('@/components/form/EditorCKEditor5/index.vue', () => ({
  default: {
    name: 'EditorCKEditor5',
    props: { modelValue: String, simple: Boolean },
    template:
      '<div class="ckeditor-stub" :data-simple="String(Boolean(simple))" :data-content="modelValue" />'
  }
}))

describe('EditorCKEditor5View', () => {
  it('seeds full mode with the shared fixture and exposes a rebuild path', () => {
    const wrapper = mount(EditorCKEditor5View)
    const editors = wrapper.findAll('.ckeditor-stub')

    expect(editors).toHaveLength(2)
    expect(editors[0]?.attributes('data-content')).toBe(tableMergeFixtureHtml)
    expect(editors[0]?.attributes('data-simple')).toBe('false')
    expect(editors[1]?.attributes('data-simple')).toBe('true')
    expect(wrapper.text()).toContain('选中 A1:B2')
    expect(wrapper.text()).toContain('重建编辑器')
  })
})
