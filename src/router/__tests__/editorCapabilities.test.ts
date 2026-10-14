import { describe, expect, it } from 'vitest'

import { previewRouteGroups } from '../routes'

describe('editor capability routes', () => {
  const formRoutes = previewRouteGroups.find((group) => group.key === 'form')?.children ?? []
  const editorRoutes = formRoutes.filter((route) => String(route.path).startsWith('editor-'))

  it('requires capability metadata for every editor route', () => {
    expect(editorRoutes.length).toBeGreaterThan(0)

    for (const route of editorRoutes) {
      expect(
        route.meta?.editorCapability,
        `${String(route.name)} lacks editorCapability`
      ).toBeDefined()
    }
  })

  it('keeps paths unique and capability states honest', () => {
    const paths = editorRoutes.map((route) => String(route.path))
    expect(new Set(paths).size).toBe(paths.length)

    for (const route of editorRoutes) {
      const capability = route.meta?.editorCapability
      expect(capability).toBeDefined()
      if (!capability) continue

      expect(capability.maintenanceCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(capability.notes.trim().length).toBeGreaterThan(0)

      if (capability.mergeSupport === 'unsupported') {
        expect(capability.persistence).toBe('unsupported')
      }
      if (capability.persistence === 'round-trip') {
        expect(capability.mergeSupport).not.toBe('unsupported')
      }
    }
  })

  it('registers the comparison page separately from editor implementations', () => {
    const comparisonRoute = formRoutes.find((route) => route.name === 'FormEditorComparison')

    expect(comparisonRoute).toBeDefined()
    expect(comparisonRoute?.meta?.editorCapability).toBeUndefined()
    expect(comparisonRoute?.meta).not.toHaveProperty('editorCapability')
  })
})
