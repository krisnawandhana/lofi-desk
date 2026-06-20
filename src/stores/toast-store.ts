import { create } from 'zustand'

export type ToastMessage = {
  title: string
  message: string
}

type ToastState = {
  toast: ToastMessage | null
  showToast: (toast: ToastMessage) => void
  dismissToast: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  showToast: (toast) => set({ toast }),
  dismissToast: () => set({ toast: null }),
}))
