import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSessionStore } from './session-store'
import { useSettingsStore } from './settings-store'
import { useTaskStore, type Task } from './task-store'
import { useTimerStore } from './timer-store'

const task = (id: string, status: Task['status']): Task => ({
  id,
  title: `Task ${id}`,
  status,
  estimatedPomodoro: 2,
  completedPomodoro: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

describe('timer store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T08:00:00.000Z'))
    useSettingsStore.setState({ focusDuration: 1, shortBreakDuration: 1, longBreakDuration: 1, longBreakInterval: 4 })
    useTaskStore.setState({ tasks: [task('a', 'doing'), task('b', 'todo')], activeTaskId: 'a' })
    useSessionStore.setState({ sessions: [] })
    useTimerStore.setState({
      mode: 'focus',
      remainingSeconds: 60,
      isRunning: false,
      endsAt: null,
      startedAt: null,
      sessionTaskId: null,
      sessionTaskTitle: null,
      completedFocusSessions: 0,
    })
  })

  afterEach(() => vi.useRealTimers())

  it('records a completed focus session against the task selected at start', () => {
    useTimerStore.getState().start()
    useTaskStore.getState().setActiveTask('b')
    vi.advanceTimersByTime(60_000)
    useTimerStore.getState().tick()

    const session = useSessionStore.getState().sessions[0]
    expect(session).toMatchObject({ taskId: 'a', taskTitle: 'Task a', type: 'focus', duration: 60 })
    expect(useTaskStore.getState().tasks.find((item) => item.id === 'a')?.completedPomodoro).toBe(1)
    expect(useTaskStore.getState().tasks.find((item) => item.id === 'b')?.completedPomodoro).toBe(0)
  })

  it('does not record a session when skipped', () => {
    useTimerStore.getState().start()
    useTimerStore.getState().skip()
    expect(useSessionStore.getState().sessions).toHaveLength(0)
  })
})
