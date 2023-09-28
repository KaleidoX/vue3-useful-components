/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@unocss',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  ignorePatterns: ['auto-imports.d.ts', 'components.d.ts'],
  rules: {
    'no-undef': 'off',
    '@unocss/order': 'warn'
  }
}
