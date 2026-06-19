import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TimerMode } from './timer-store'

type SettingsState = {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  notificationsEnabled: boolean
  setFocusDuration: (minutes: number) => void
  setShortBreakDuration: (minutes: number) => void
  setLongBreakDuration: (minutes: number) => void
  setLongBreakInterval: (sessions: number) => void
  setNotificationsEnabled: (enabled: boolean) => void
  resetSettings: () => void
}

export const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  notificationsEnabled: false,
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, Math.round(value)))

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setFocusDuration: (focusDuration) => set({ focusDuration: clamp(focusDuration, 1, 90) }),
      setShortBreakDuration: (shortBreakDuration) => set({ shortBreakDuration: clamp(shortBreakDuration, 1, 30) }),
      setLongBreakDuration: (longBreakDuration) => set({ longBreakDuration: clamp(longBreakDuration, 1, 60) }),
      setLongBreakInterval: (longBreakInterval) => set({ longBreakInterval: clamp(longBreakInterval, 2, 8) }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    { name: 'lofi-desk-settings', version: 1 },
  ),
)

export const getTimerDuration = (mode: TimerMode) => {
  const settings = useSettingsStore.getState()
  const minutes = mode === 'focus'
    ? settings.focusDuration
    : mode === 'short_break'
      ? settings.shortBreakDuration
      : settings.longBreakDuration
  return minutes * 60
}
