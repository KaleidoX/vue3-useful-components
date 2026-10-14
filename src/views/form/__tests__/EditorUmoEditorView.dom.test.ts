import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { tableMergeFixtureHtml } from '../fixtures/tableMergeFixture'
import EditorUmoEditorView from '../EditorUmoEditorView.vue'

vi.mock('@/components/form/EditorUmoEditor/index.vue', () => ({
  default: {
    name: 'EditorUmoEditor',
    props: ['modelValue'],
    template: '<div class="umo-editor-stub" :data-content="modelValue" />'
  }
}))

describe('EditorUmoEditorView', () => {
  it('uses the shared table fixture and exposes native merge round-trip guidance', () => {
    const wrapper = mount(EditorUmoEditorView, {
      global: { stubs: { EvaluationTable: true, SealTool: true } }
    })

    expect(wrapper.get('.umo-editor-stub').attributes('data-content')).toBe(tableMergeFixtureHtml)
    expect(wrapper.text()).toContain('选中 A1:B2')
    expect(wrapper.get('button').text()).toContain('重建编辑器')
  })
})
