export type EditorKind = 'spreadsheet' | 'document' | 'rich-text' | 'block' | 'markdown'

export type EditorContentFormat = 'workbook' | 'html' | 'markdown' | 'delta' | 'json' | 'mixed'

export type TableMergeSupport =
  'built-in' | 'official-extension' | 'third-party-extension' | 'experimental' | 'unsupported'

export type TableMergePersistence = 'round-trip' | 'runtime-only' | 'not-verified' | 'unsupported'

export type MaintenanceStatus = 'active' | 'limited'

export interface EditorCapabilityMeta {
  kind: EditorKind
  contentFormat: EditorContentFormat
  mergeSupport: TableMergeSupport
  persistence: TableMergePersistence
  maintenance: MaintenanceStatus
  maintenanceCheckedAt: string
  license: string
  staticDeployment: boolean
  notes: string
}
