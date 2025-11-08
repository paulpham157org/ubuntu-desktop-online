/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly E2B_API_KEY: string
  readonly VITE_DEFAULT_SESSION_DURATION_MINUTES?: string
  readonly VITE_MAX_SESSION_DURATION_MINUTES?: string
  readonly VITE_PAUSE_WARNING_SECONDS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
