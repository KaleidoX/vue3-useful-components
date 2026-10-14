import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { tableMergeFixture } from '../fixtures/tableMergeFixture'
import { createTableFromRows } from '@/components/form/EditorSlate/plugins/withTables'
import EditorSlateView from '../EditorSlateView.vue'

vi.mock('@/components/form/EditorSlate/index.vue', () => ({
  default: {
    name: 'EditorSlate',
    props: { modelValue: Array },
    template: '<div class="slate-stub" :data-content="JSON.stringify(modelValue)" />'
  }
}))

describe('EditorSlateView', () => {
  it('seeds the common JSON fixture and exposes a rebuild path', () => {
    const wrapper = mount(EditorSlateView)
    const content = JSON.parse(wrapper.get('.slate-stub').attributes('data-content') ?? 'null')

    expect(content).toEqual([createTableFromRows(tableMergeFixture.rows)])
    expect(wrapper.text()).toContain('拖选 A1:B2')
    expect(wrapper.text()).toContain('重建编辑器')
    expect(wrapper.text()).toContain('被覆盖单元格仍保留在 JSON')
  })
})
