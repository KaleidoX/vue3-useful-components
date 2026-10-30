import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import unocss from '@unocss/eslint-config/flat'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  // public/ 下的 vendored 产物（wasm-apps 官方构建等）不参与 lint：
  // eslint --fix 会重排格式，破坏 index.html 记录的 SRI sha384 完整性哈希，
  // 导致浏览器拒绝加载 wasm 模块（*Craft 白屏）
  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    'public/**',
    '.agents/**',
    '.remember/**',
    '.codex/**',
    '.aws/**'
  ]),

  pluginVue.configs['flat/essential'],
  unocss,
  vueTsConfigs.recommended,
  
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  skipFormatting,

  // ✅ 自定义 TypeScript 规则
  {
    name: 'custom/ts-rules',
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
)
