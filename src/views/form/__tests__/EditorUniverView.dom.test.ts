import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import EditorUniverView from '../EditorUniverView.vue'

vi.mock('@/components/form/EditorUniverSheet/index.vue', () => ({
  default: {
    name: 'EditorUniverSheet',
    props: ['data'],
    template: '<div class="univer-sheet-stub" />'
  }
}))

describe('EditorUniverView', () => {
  it('exposes merge, split, and workbook round-trip actions', () => {
    const wrapper = mount(EditorUniverView, {
      global: { stubs: { EvaluationTable: true } }
    })

    expect(wrapper.text()).toContain('合并 A1:B2')
    expect(wrapper.text()).toContain('拆分 A1:B2')
    expect(wrapper.text()).toContain('导出并重建')
  })
})
