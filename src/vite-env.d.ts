/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  type RegisterSWOptions = {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
  }

  export const registerSW: (options?: RegisterSWOptions) => (reloadPage?: boolean) => Promise<void>
}
