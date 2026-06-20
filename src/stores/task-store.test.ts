import { beforeEach, describe, expect, it } from 'vitest'
import { useTaskStore, type Task } from './task-store'

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-a',
  title: 'Test task',
  status: 'doing',
  estimatedPomodoro: 3,
  completedPomodoro: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('task store', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [createTask()], activeTaskId: 'task-a' })
  })

  it('supports multiple focus sessions before completing a task', () => {
    useTaskStore.getState().completePomodoro('task-a')
    useTaskStore.getState().completePomodoro('task-a')

    expect(useTaskStore.getState().tasks[0]).toMatchObject({
      completedPomodoro: 2,
      status: 'doing',
    })
    expect(useTaskStore.getState().activeTaskId).toBe('task-a')

    useTaskStore.getState().completePomodoro('task-a')

    expect(useTaskStore.getState().tasks[0]).toMatchObject({
      completedPomodoro: 3,
      status: 'done',
    })
    expect(useTaskStore.getState().activeTaskId).toBeNull()
  })

  it('does not increment an unrelated task', () => {
    useTaskStore.getState().completePomodoro('missing-task')
    expect(useTaskStore.getState().tasks[0].completedPomodoro).toBe(0)
  })
})
