import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { tableMergeFixtureHtml } from '../fixtures/tableMergeFixture'
import EditorTinyMCEView from '../EditorTinyMCEView.vue'

vi.mock('@/components/form/EditorTinyMCE/index.vue', () => ({
  default: {
    name: 'EditorTinyMCE',
    props: {
      modelValue: String,
      simple: Boolean
    },
    template:
      '<div class="tiny-stub" :data-simple="String(Boolean(simple))" :data-content="modelValue" />'
  }
}))

describe('EditorTinyMCEView', () => {
  it('opens the full editor with the shared table fixture and keeps simple mode table-free', () => {
    const wrapper = mount(EditorTinyMCEView)
    const editors = wrapper.findAll('.tiny-stub')

    expect(editors).toHaveLength(2)
    expect(editors[0]?.attributes('data-content')).toBe(tableMergeFixtureHtml)
    expect(editors[0]?.attributes('data-simple')).toBe('false')
    expect(editors[1]?.attributes('data-simple')).toBe('true')
    expect(wrapper.text()).toContain('选中 A1:B2')
    expect(wrapper.text()).toContain('重建编辑器')
  })
})
