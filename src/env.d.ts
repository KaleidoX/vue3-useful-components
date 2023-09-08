/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // 更多环境变量...
  readonly BASE_URL: string
  readonly VITE_BASE_HOST: string
  readonly VITE_BASE_API: string
  readonly VITE_LOGIN_URL: string
  readonly VITE_LOGOUT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
