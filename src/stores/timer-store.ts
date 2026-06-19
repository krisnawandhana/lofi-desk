import { create } from 'zustand'
import { useTaskStore } from './task-store'
import { DEFAULT_SETTINGS, getTimerDuration, useSettingsStore } from './settings-store'
import { useSessionStore } from './session-store'
import { sendSessionNotification } from '../lib/notifications'

export type TimerMode = 'focus' | 'short_break' | 'long_break'

type TimerState = {
  mode: TimerMode
  remainingSeconds: number
  isRunning: boolean
  endsAt: number | null
  startedAt: number | null
  completedFocusSessions: number
  setMode: (mode: TimerMode) => void
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  tick: () => void
}

const getNextMode = (mode: TimerMode, completedFocusSessions: number): TimerMode => {
  if (mode !== 'focus') return 'focus'
  const { longBreakInterval } = useSettingsStore.getState()
  return (completedFocusSessions + 1) % longBreakInterval === 0 ? 'long_break' : 'short_break'
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'focus',
  remainingSeconds: DEFAULT_SETTINGS.focusDuration * 60,
  isRunning: false,
  endsAt: null,
  startedAt: null,
  completedFocusSessions: 2,

  setMode: (mode) => set({
    mode,
    remainingSeconds: getTimerDuration(mode),
    isRunning: false,
    endsAt: null,
    startedAt: null,
  }),

  start: () => {
    const { isRunning, remainingSeconds, startedAt } = get()
    if (isRunning || remainingSeconds <= 0) return

    set({
      isRunning: true,
      endsAt: Date.now() + remainingSeconds * 1000,
      startedAt: startedAt ?? Date.now(),
    })
  },

  pause: () => {
    const { isRunning, endsAt } = get()
    if (!isRunning || endsAt === null) return

    set({
      remainingSeconds: Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)),
      isRunning: false,
      endsAt: null,
    })
  },

  reset: () => {
    const { mode } = get()
    set({
      remainingSeconds: getTimerDuration(mode),
      isRunning: false,
      endsAt: null,
      startedAt: null,
    })
  },

  skip: () => {
    const { mode, completedFocusSessions } = get()
    const nextMode = getNextMode(mode, completedFocusSessions)
    set({
      mode: nextMode,
      remainingSeconds: getTimerDuration(nextMode),
      isRunning: false,
      endsAt: null,
      startedAt: null,
    })
  },

  tick: () => {
    const { isRunning, endsAt, startedAt, mode, completedFocusSessions } = get()
    if (!isRunning || endsAt === null) return

    const remainingSeconds = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    if (remainingSeconds > 0) {
      set({ remainingSeconds })
      return
    }

    const nextCompleted = mode === 'focus'
      ? completedFocusSessions + 1
      : completedFocusSessions
    const endedAt = Date.now()
    const activeTask = useTaskStore.getState().tasks.find((task) =>
      task.id === useTaskStore.getState().activeTaskId)
    useSessionStore.getState().recordSession({
      taskId: activeTask?.id,
      taskTitle: activeTask?.title,
      type: mode,
      duration: getTimerDuration(mode),
      startedAt: new Date(startedAt ?? endedAt - getTimerDuration(mode) * 1000).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
    })
    if (mode === 'focus') useTaskStore.getState().completeActivePomodoro()
    const nextMode = getNextMode(mode, completedFocusSessions)
    sendSessionNotification(nextMode)

    set({
      mode: nextMode,
      remainingSeconds: getTimerDuration(nextMode),
      completedFocusSessions: nextCompleted,
      isRunning: false,
      endsAt: null,
      startedAt: null,
    })
  },
}))
