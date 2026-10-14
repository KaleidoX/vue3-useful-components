import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { tableMergeFixtureHtml } from '../fixtures/tableMergeFixture'
import EditorJoditView from '../EditorJoditView.vue'

vi.mock('@/components/form/EditorJodit/index.vue', () => ({
  default: {
    name: 'EditorJodit',
    props: { modelValue: String },
    template: '<div class="jodit-stub" :data-content="modelValue" />'
  }
}))

describe('EditorJoditView', () => {
  it('seeds the common HTML fixture and exposes a rebuild path', () => {
    const wrapper = mount(EditorJoditView)

    expect(wrapper.get('.jodit-stub').attributes('data-content')).toBe(tableMergeFixtureHtml)
    expect(wrapper.text()).toContain('合并 A1:B2')
    expect(wrapper.text()).toContain('拆分合并单元格')
    expect(wrapper.text()).toContain('重建编辑器')
  })
})
