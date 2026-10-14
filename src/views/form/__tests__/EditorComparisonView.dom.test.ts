import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { previewRouteGroups } from '@/router/routes'
import EditorComparisonView from '../EditorComparisonView.vue'

describe('EditorComparisonView', () => {
  const editorRoutes =
    previewRouteGroups
      .find((group) => group.key === 'form')
      ?.children.filter((route) => route.meta?.editorCapability) ?? []

  const mountView = () =>
    mount(EditorComparisonView, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>'
          }
        }
      }
    })

  it('renders exactly one comparison row and link per editor route', () => {
    const wrapper = mountView()
    const rows = wrapper.findAll('tbody tr')

    expect(rows).toHaveLength(editorRoutes.length)
    expect(rows.map((row) => row.get('a').attributes('href'))).toEqual(
      editorRoutes.map((route) => `/form/${String(route.path)}`)
    )
  })

  it('does not present runtime-only or unsupported states as verified round trips', () => {
    const wrapper = mountView()
    const milkdownRow = wrapper
      .findAll('tbody tr')
      .find((row) => row.text().includes('Milkdown编辑器'))
    const unsupportedRows = wrapper
      .findAll('tbody tr')
      .filter((row) => row.text().includes('不支持'))

    expect(milkdownRow?.text()).toContain('仅运行时')
    expect(milkdownRow?.text()).not.toContain('已验证回读')
    expect(unsupportedRows.length).toBeGreaterThan(0)
    expect(unsupportedRows.every((row) => row.text().includes('不适用'))).toBe(true)
  })
})
