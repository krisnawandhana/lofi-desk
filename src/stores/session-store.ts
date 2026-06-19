import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TimerMode } from './timer-store'

export type PomodoroSession = {
  id: string
  taskId?: string
  taskTitle?: string
  type: TimerMode
  duration: number
  completed: boolean
  startedAt: string
  endedAt: string
}

type SessionInput = Omit<PomodoroSession, 'id' | 'completed'>

type SessionState = {
  sessions: PomodoroSession[]
  recordSession: (session: SessionInput) => void
  clearHistory: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      recordSession: (session) => set((state) => ({
        sessions: [
          { ...session, id: crypto.randomUUID(), completed: true },
          ...state.sessions,
        ].slice(0, 500),
      })),
      clearHistory: () => set({ sessions: [] }),
    }),
    { name: 'lofi-desk-sessions', version: 1 },
  ),
)
