import { defineConfig, presetUno, presetIcons, transformerVariantGroup } from 'unocss'
// import presetTheme from 'unocss-preset-theme'
import transformerDirectives from '@unocss/transformer-directives'
import transformerCompileClass from '@unocss/transformer-compile-class'
// loader helpers
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

import { colors, fontSize } from './src/assets/styles/variable'

// https://unocss.dev/guide/config-file
export default defineConfig({
  // ...UnoCSS options
  // darkMode: 'class',
  theme: { colors, fontSize },
  rules: [
    [/^color-(\d+)$/, ([, d]) => ({ color: `#${d.toString().repeat(3)}` })],
    ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['pr-safe', { 'padding-right': 'env(safe-area-inset-right)' }],
    ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
    ['pl-safe', { 'padding-left': 'env(safe-area-inset-left)' }],
    ['top-safe', { top: 'env(safe-area-inset-top)' }],
    ['right-safe', { right: 'env(safe-area-inset-right)' }],
    ['bottom-safe', { bottom: 'env(safe-area-inset-bottom)' }],
    ['left-safe', { left: 'env(safe-area-inset-left)' }]
  ],
  shortcuts: [
    // ...
    { 'p-safe': 'pt-safe pr-safe pb-safe pl-safe' },
    { 'px-safe': 'pt-safe pb-safe' },
    { 'py-safe': 'pr-safe pl-safe' },
    { 'inset-safe': 'top-safe right-safe bottom-safe left-safe' }
  ],
  presets: [
    // presetUno({
    //   preflight: false
    // }),
    presetUno(),
    presetIcons({
      collections: {
        custom: FileSystemIconLoader('./src/assets/icons', (svg) =>
          svg.replace(/#fff/, 'currentColor')
        )
      }
    })
  ],
  transformers: [transformerVariantGroup(), transformerDirectives(), transformerCompileClass()]
})
