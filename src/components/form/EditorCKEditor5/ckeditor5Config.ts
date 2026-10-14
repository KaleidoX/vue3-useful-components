import {
  BlockQuote,
  Bold,
  CodeBlock,
  Essentials,
  Heading,
  HorizontalLine,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  Paragraph,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
  Undo
} from 'ckeditor5'

const simplePlugins = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Heading,
  List,
  Link,
  Indent,
  IndentBlock,
  Undo
]

const normalPlugins = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  List,
  Link,
  Indent,
  IndentBlock,
  BlockQuote,
  CodeBlock,
  HorizontalLine,
  Table,
  TableToolbar,
  Undo
]

const simpleToolbar = [
  'heading',
  '|',
  'bold',
  'italic',
  '|',
  'bulletedList',
  'numberedList',
  '|',
  'link',
  '|',
  'undo',
  'redo'
]

const normalToolbar = [
  'undo',
  'redo',
  '|',
  'heading',
  '|',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  '|',
  'bulletedList',
  'numberedList',
  '|',
  'outdent',
  'indent',
  '|',
  'link',
  'blockQuote',
  'codeBlock',
  '|',
  'insertTable',
  'horizontalLine'
]

export function createCKEditor5Config(options: { simple: boolean; placeholder: string }) {
  return {
    licenseKey: 'GPL' as const,
    plugins: options.simple ? simplePlugins : normalPlugins,
    toolbar: options.simple ? simpleToolbar : normalToolbar,
    placeholder: options.placeholder,
    ...(options.simple
      ? {}
      : {
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
          }
        })
  }
}
