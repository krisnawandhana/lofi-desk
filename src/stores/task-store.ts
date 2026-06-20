import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TaskStatus = 'todo' | 'doing' | 'done'

export type Task = {
  id: string
  title: string
  status: TaskStatus
  estimatedPomodoro: number
  completedPomodoro: number
  createdAt: string
  updatedAt: string
}

type TaskState = {
  tasks: Task[]
  activeTaskId: string | null
  addTask: (title: string, estimatedPomodoro?: number) => void
  setActiveTask: (id: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  completePomodoro: (taskId: string | null) => void
}

const now = new Date().toISOString()

const initialTasks: Task[] = [
  {
    id: 'landing-page-copy',
    title: 'Finish landing page copy',
    status: 'doing',
    estimatedPomodoro: 3,
    completedPomodoro: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'weekly-notes',
    title: 'Review weekly notes',
    status: 'todo',
    estimatedPomodoro: 2,
    completedPomodoro: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tomorrow-focus',
    title: 'Plan tomorrow’s focus',
    status: 'todo',
    estimatedPomodoro: 1,
    completedPomodoro: 0,
    createdAt: now,
    updatedAt: now,
  },
]

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      activeTaskId: initialTasks[0].id,

      addTask: (title, estimatedPomodoro = 1) => {
        const trimmedTitle = title.trim()
        if (!trimmedTitle) return

        const timestamp = new Date().toISOString()
        const task: Task = {
          id: crypto.randomUUID(),
          title: trimmedTitle,
          status: 'todo',
          estimatedPomodoro: Math.max(1, estimatedPomodoro),
          completedPomodoro: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        }

        set((state) => ({ tasks: [...state.tasks, task] }))
      },

      setActiveTask: (id) => set((state) => ({
        activeTaskId: id,
        tasks: state.tasks.map((task) => ({
          ...task,
          status: task.id === id
            ? 'doing'
            : task.status === 'doing' ? 'todo' : task.status,
          updatedAt: task.id === id ? new Date().toISOString() : task.updatedAt,
        })),
      })),

      toggleTask: (id) => set((state) => {
        const task = state.tasks.find((item) => item.id === id)
        if (!task) return state

        const isDone = task.status === 'done'
        return {
          activeTaskId: !isDone && state.activeTaskId === id ? null : state.activeTaskId,
          tasks: state.tasks.map((item) => item.id === id
            ? {
                ...item,
                status: isDone ? 'todo' : 'done',
                updatedAt: new Date().toISOString(),
              }
            : item),
        }
      }),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
      })),

      completePomodoro: (taskId) => {
        if (!taskId) return

        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId || task.status === 'done') return task
            const completedPomodoro = task.completedPomodoro + 1
            return {
              ...task,
              completedPomodoro,
              status: completedPomodoro >= task.estimatedPomodoro ? 'done' : 'doing',
              updatedAt: new Date().toISOString(),
            }
          }),
          activeTaskId: state.tasks.some((task) =>
            task.id === taskId && task.completedPomodoro + 1 >= task.estimatedPomodoro)
            ? null
            : state.activeTaskId,
        }))
      },
    }),
    { name: 'lofi-desk-tasks', version: 1 },
  ),
)
