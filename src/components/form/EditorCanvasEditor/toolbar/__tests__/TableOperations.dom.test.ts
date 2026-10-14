import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TableOperations from '../TableOperations.vue'

const exec = vi.hoisted(() => vi.fn())

vi.mock('../../injection', () => ({
  useCanvasEditor: () => ({ exec })
}))

describe('Canvas TableOperations', () => {
  beforeEach(() => exec.mockClear())

  it('routes visible merge and split controls to the canvas editor commands', async () => {
    const wrapper = mount(TableOperations)

    await wrapper.get('[title="合并所选单元格"]').trigger('click')
    await wrapper.get('[title="取消合并单元格"]').trigger('click')

    expect(exec.mock.calls).toEqual([['executeMergeTableCell'], ['executeCancelMergeTableCell']])
  })
})
