import type { Editor, RawEditorOptions } from 'tinymce'

interface TinyMCEConfigOptions {
  simple: boolean
  height: number
  minHeight: number
  placeholder: string
  readOnly: boolean
  setup: (editor: Editor) => void
}

const simplePlugins = ['lists', 'link']
const normalPlugins =
  'advlist anchor autolink charmap code emoticons fullscreen image link lists media preview searchreplace table visualblocks wordcount'

const simpleToolbar = 'bold italic underline | bullist numlist | link'
const normalToolbar =
  'undo redo | blocks fontsize | bold italic underline strikethrough forecolor backcolor | link image media table | align | numlist bullist indent outdent | removeformat charmap emoticons | fullscreen preview'

const tableToolbar =
  'tableprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablemergecells tablesplitcells'

export const createTinyMCEConfig = (options: TinyMCEConfigOptions): RawEditorOptions => ({
  height: options.height || 360,
  min_height: options.minHeight,
  menubar: false,
  promotion: false,
  base_url: '',
  plugins: options.simple ? simplePlugins : normalPlugins,
  toolbar: options.simple ? simpleToolbar : normalToolbar,
  ...(options.simple ? {} : { table_toolbar: tableToolbar }),
  toolbar_mode: 'sliding',
  placeholder: options.placeholder,
  readonly: options.readOnly,
  setup: options.setup
})
