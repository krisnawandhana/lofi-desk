import { useAmbienceStore, type Ambience } from '../stores/ambience-store'
import { useSessionStore, type PomodoroSession } from '../stores/session-store'
import { useSettingsStore } from '../stores/settings-store'
import { useTaskStore, type Task } from '../stores/task-store'
import { MUSIC_TRACKS, useMusicStore } from '../stores/music-store'

type BackupSettings = {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  notificationsEnabled: boolean
}

type BackupAmbience = {
  ambience: Ambience
  volume: number
  isMuted: boolean
}

type BackupMusic = {
  trackIndex: number
  volume: number
  isMuted: boolean
}

type AppBackup = {
  app: 'lofi-desk'
  version: 1
  exportedAt: string
  data: {
    tasks: Task[]
    activeTaskId: string | null
    sessions: PomodoroSession[]
    settings: BackupSettings
    ambience: BackupAmbience
    music?: BackupMusic
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isTask = (value: unknown): value is Task => {
  if (!isRecord(value)) return false
  return typeof value.id === 'string'
    && typeof value.title === 'string'
    && ['todo', 'doing', 'done'].includes(String(value.status))
    && typeof value.estimatedPomodoro === 'number'
    && typeof value.completedPomodoro === 'number'
    && value.estimatedPomodoro >= 1
    && value.completedPomodoro >= 0
    && typeof value.createdAt === 'string'
    && typeof value.updatedAt === 'string'
}

const isSession = (value: unknown): value is PomodoroSession => {
  if (!isRecord(value)) return false
  return typeof value.id === 'string'
    && ['focus', 'short_break', 'long_break'].includes(String(value.type))
    && typeof value.duration === 'number'
    && value.completed === true
    && typeof value.startedAt === 'string'
    && typeof value.endedAt === 'string'
    && (value.taskId === undefined || typeof value.taskId === 'string')
    && (value.taskTitle === undefined || typeof value.taskTitle === 'string')
}

const isValidBackup = (value: unknown): value is AppBackup => {
  if (!isRecord(value) || value.app !== 'lofi-desk' || value.version !== 1 || !isRecord(value.data)) return false
  if (typeof value.exportedAt !== 'string') return false
  const { data } = value
  if (!Array.isArray(data.tasks) || !data.tasks.every(isTask)) return false
  if (!Array.isArray(data.sessions) || !data.sessions.every(isSession)) return false
  if (!isRecord(data.settings) || !isRecord(data.ambience)) return false
  if (data.activeTaskId !== null && typeof data.activeTaskId !== 'string') return false

  const settings = data.settings
  const ambience = data.ambience
  const musicIsValid = data.music === undefined || (isRecord(data.music)
    && typeof data.music.trackIndex === 'number'
    && data.music.trackIndex >= 0
    && data.music.trackIndex < MUSIC_TRACKS.length
    && typeof data.music.volume === 'number'
    && data.music.volume >= 0
    && data.music.volume <= 1
    && typeof data.music.isMuted === 'boolean')
  return musicIsValid
    && typeof settings.focusDuration === 'number'
    && typeof settings.shortBreakDuration === 'number'
    && typeof settings.longBreakDuration === 'number'
    && typeof settings.longBreakInterval === 'number'
    && typeof settings.notificationsEnabled === 'boolean'
    && settings.focusDuration >= 1 && settings.focusDuration <= 90
    && settings.shortBreakDuration >= 1 && settings.shortBreakDuration <= 30
    && settings.longBreakDuration >= 1 && settings.longBreakDuration <= 60
    && settings.longBreakInterval >= 2 && settings.longBreakInterval <= 8
    && ['rain', 'lofi', 'fireplace', 'cafe', 'ocean', 'coffee', 'none'].includes(String(ambience.ambience))
    && typeof ambience.volume === 'number'
    && ambience.volume >= 0
    && ambience.volume <= 1
    && typeof ambience.isMuted === 'boolean'
}

export const downloadBackup = () => {
  const tasks = useTaskStore.getState()
  const sessions = useSessionStore.getState().sessions
  const settings = useSettingsStore.getState()
  const ambience = useAmbienceStore.getState()
  const music = useMusicStore.getState()

  const backup: AppBackup = {
    app: 'lofi-desk',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      tasks: tasks.tasks,
      activeTaskId: tasks.activeTaskId,
      sessions,
      settings: {
        focusDuration: settings.focusDuration,
        shortBreakDuration: settings.shortBreakDuration,
        longBreakDuration: settings.longBreakDuration,
        longBreakInterval: settings.longBreakInterval,
        notificationsEnabled: settings.notificationsEnabled,
      },
      ambience: {
        ambience: ambience.ambience,
        volume: ambience.volume,
        isMuted: ambience.isMuted,
      },
      music: {
        trackIndex: Math.min(music.trackIndex, MUSIC_TRACKS.length - 1),
        volume: music.volume,
        isMuted: music.isMuted,
      },
    },
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `lofi-desk-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export const importBackup = async (file: File) => {
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  if (!isValidBackup(parsed)) {
    throw new Error('This is not a valid Lofi Desk backup.')
  }

  const { data } = parsed
  const activeTaskId = data.activeTaskId && data.tasks.some((task) => task.id === data.activeTaskId)
    ? data.activeTaskId
    : null

  useTaskStore.setState({ tasks: data.tasks, activeTaskId })
  useSessionStore.setState({ sessions: data.sessions.slice(0, 500) })
  useSettingsStore.setState(data.settings)
  useAmbienceStore.setState({ ...data.ambience, isPlaying: false })
  if (data.music) useMusicStore.setState({ ...data.music, isPlaying: false })
}
