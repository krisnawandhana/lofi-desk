import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'
import {
  BarChart3,
  Bell,
  BellOff,
  Check,
  CloudRain,
  Coffee,
  Database,
  Download,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  SkipBack,
  SkipForward,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTimerStore, type TimerMode } from './stores/timer-store'
import { useTaskStore } from './stores/task-store'
import { useAmbienceAudio } from './hooks/use-ambience-audio'
import { useAmbienceStore, type Ambience } from './stores/ambience-store'
import { getTimerDuration, useSettingsStore } from './stores/settings-store'
import { useSessionStore } from './stores/session-store'
import { downloadBackup, importBackup } from './lib/backup'
import { useMusicPlayer } from './hooks/use-music-player'
import { MUSIC_TRACKS, useMusicStore } from './stores/music-store'

const modeLabels: Record<TimerMode, string> = {
  focus: 'Focus',
  short_break: 'Short break',
  long_break: 'Long break',
}

const timerLabels: Record<TimerMode, string> = {
  focus: 'Time to focus',
  short_break: 'Take a breather',
  long_break: 'Time for a deep rest',
}

const ambienceLabels: Record<Ambience, string> = {
  rain: 'Rainy night',
  lofi: 'Lofi beat',
  fireplace: 'Fireplace',
  cafe: 'Cozy cafe',
  ocean: 'Ocean waves',
  coffee: 'Coffee ritual',
  none: 'No ambience',
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`
}

const getLocalDateKey = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

type TimeTheme = 'morning' | 'afternoon' | 'evening' | 'night'

const getTimeTheme = (): TimeTheme => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 20) return 'evening'
  return 'night'
}

function App() {
  useAmbienceAudio()
  useMusicPlayer()
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null)
  const [timeTheme, setTimeTheme] = useState<TimeTheme>(getTimeTheme)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const {
    mode,
    remainingSeconds,
    isRunning,
    completedFocusSessions,
    setMode,
    start,
    pause,
    reset,
    skip,
    tick,
  } = useTimerStore()
  const { tasks, activeTaskId, addTask, setActiveTask, toggleTask, deleteTask } = useTaskStore()
  const {
    ambience,
    volume: ambienceVolume,
    isMuted: isAmbienceMuted,
    isPlaying: isAmbiencePlaying,
    setAmbience,
    setVolume,
    toggleMuted,
    togglePlaying: toggleAmbience,
  } = useAmbienceStore()
  const {
    trackIndex: musicTrackIndex,
    volume: musicVolume,
    isMuted: isMusicMuted,
    isPlaying: isMusicPlaying,
    setVolume: setMusicVolume,
    toggleMuted: toggleMusicMuted,
    togglePlaying: toggleMusic,
    nextTrack,
    previousTrack,
  } = useMusicStore()
  const {
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    notificationsEnabled,
    setFocusDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    setLongBreakInterval,
    setNotificationsEnabled,
    resetSettings,
  } = useSettingsStore()
  const { sessions, clearHistory } = useSessionStore()
  const previousSessionCount = useRef(sessions.length)
  const backupInputRef = useRef<HTMLInputElement>(null)
  const currentTrack = MUSIC_TRACKS[musicTrackIndex]

  useEffect(() => {
    if (!isRunning) return
    tick()
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [isRunning, tick])

  useEffect(() => {
    if (!useTimerStore.getState().isRunning) reset()
  }, [focusDuration, shortBreakDuration, longBreakDuration, reset])

  useEffect(() => {
    document.title = `${formatTime(remainingSeconds)} • ${modeLabels[mode]} — Lofi Desk`
    return () => { document.title = 'Lofi Desk' }
  }, [mode, remainingSeconds])

  useEffect(() => {
    const updateTimeTheme = () => setTimeTheme(getTimeTheme())
    const interval = window.setInterval(updateTimeTheme, 60_000)
    window.addEventListener('focus', updateTimeTheme)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', updateTimeTheme)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false)
        setIsStatsOpen(false)
        setIsAddingTask(false)
        return
      }

      const target = event.target as HTMLElement
      const isFormField = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target.tagName)
      if (event.code !== 'Space' || isFormField || isSettingsOpen || isStatsOpen) return
      event.preventDefault()
      if (isRunning) pause()
      else start()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, isSettingsOpen, isStatsOpen, pause, start])

  useEffect(() => {
    if (sessions.length > previousSessionCount.current) {
      const newestSession = sessions[0]
      setToast({
        title: 'Session complete',
        message: newestSession.type === 'focus'
          ? 'Focus session complete — time to recharge.'
          : 'Break complete — ready when you are.',
      })
      const timeout = window.setTimeout(() => setToast(null), 4500)
      previousSessionCount.current = sessions.length
      return () => window.clearTimeout(timeout)
    }
    previousSessionCount.current = sessions.length
  }, [sessions])

  const progress = (remainingSeconds / getTimerDuration(mode)) * 100
  const timerStyle = { '--timer-progress': `${progress}%` } as CSSProperties
  const sessionNumber = (completedFocusSessions % longBreakInterval) + 1
  const activeTask = tasks.find((task) => task.id === activeTaskId)
  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const totalPomodoros = tasks.reduce((total, task) => total + task.estimatedPomodoro, 0)
  const completedPomodoros = tasks.reduce((total, task) => total + task.completedPomodoro, 0)
  const dailyProgress = totalPomodoros > 0
    ? Math.min(100, (completedPomodoros / totalPomodoros) * 100)
    : 0
  const focusSessions = sessions.filter((session) => session.type === 'focus')
  const totalFocusMinutes = focusSessions.reduce((total, session) => total + session.duration / 60, 0)
  const todayKey = getLocalDateKey(new Date())
  const todayFocusSessions = focusSessions.filter((session) => getLocalDateKey(session.endedAt) === todayKey)
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const key = getLocalDateKey(date)
    const minutes = focusSessions
      .filter((session) => getLocalDateKey(session.endedAt) === key)
      .reduce((total, session) => total + session.duration / 60, 0)
    return { key, label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2), minutes }
  })
  const maxDailyMinutes = Math.max(25, ...lastSevenDays.map((day) => day.minutes))

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newTaskTitle.trim()) return
    addTask(newTaskTitle)
    setNewTaskTitle('')
    setIsAddingTask(false)
  }

  const handleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false)
      return
    }

    if (!('Notification' in window)) return
    const permission = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission()
    setNotificationsEnabled(permission === 'granted')
  }

  const handleExport = () => {
    downloadBackup()
    setToast({ title: 'Backup exported', message: 'Your Lofi Desk data was saved as a JSON file.' })
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await importBackup(file)
      setToast({ title: 'Backup restored', message: 'Tasks, history, and preferences were imported.' })
    } catch (error) {
      setToast({
        title: 'Import failed',
        message: error instanceof Error ? error.message : 'The selected backup could not be imported.',
      })
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className="app-shell" data-time={timeTheme}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Lofi Desk home">
          <span className="brand-mark"><Coffee size={18} /></span>
          <span>Lofi Desk</span>
        </a>

        <div className="topbar-actions">
          <span className="offline-status"><span /> Saved offline</span>
          <button className="icon-button" type="button" aria-label="Open statistics" onClick={() => setIsStatsOpen(true)}><BarChart3 /></button>
          <button className="icon-button" type="button" aria-label="Open settings" onClick={() => setIsSettingsOpen(true)}><Settings /></button>
          <button className="avatar" type="button" aria-label="Open profile">WA</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="task-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Today</p>
              <h2>Focus list</h2>
            </div>
            <button className="icon-button soft" type="button" aria-label="Add task" onClick={() => setIsAddingTask(true)}><Plus /></button>
          </div>

          <div className="progress-summary">
            <div className="progress-copy"><span>Daily progress</span><strong>{completedPomodoros} of {totalPomodoros}</strong></div>
            <div className="progress-track"><span style={{ width: `${dailyProgress}%` }} /></div>
            <p>{completedPomodoros * 25} focused minutes</p>
          </div>

          <div className="task-list">
            {tasks.map((task) => (
              <article className={`task-item${task.id === activeTaskId ? ' active' : ''}${task.status === 'done' ? ' done' : ''}`} key={task.id}>
                <button className="task-check" type="button" aria-label={`Complete ${task.title}`} onClick={() => toggleTask(task.id)}>
                  {task.status === 'done' ? <Check /> : task.id === activeTaskId && <span />}
                </button>
                <button className="task-copy" type="button" onClick={() => task.status !== 'done' && setActiveTask(task.id)}>
                  <h3>{task.title}</h3>
                  <p>{task.completedPomodoro} / {task.estimatedPomodoro} sessions</p>
                </button>
                <button className="task-menu danger" type="button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}><Trash2 /></button>
              </article>
            ))}
          </div>

          {isAddingTask ? (
            <form className="add-task-form" onSubmit={handleAddTask}>
              <input
                autoFocus
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="What do you want to focus on?"
                aria-label="Task title"
              />
              <div>
                <button type="button" onClick={() => setIsAddingTask(false)}>Cancel</button>
                <button className="save-task" type="submit">Add task</button>
              </div>
            </form>
          ) : (
            <button className="add-task" type="button" onClick={() => setIsAddingTask(true)}><Plus /> Add a task</button>
          )}

          <div className="completed-row">
            <span className="completed-icon"><Check /></span>
            <span><strong>{completedTasks} {completedTasks === 1 ? 'task' : 'tasks'} completed</strong><small>Nice work today</small></span>
          </div>
        </aside>

        <section className="focus-area" data-mode={mode} data-time={timeTheme}>
          <div className="scene" aria-hidden="true">
            <div className="room-grain" />
            <div className="room-vignette" />

            <div className="poster-cluster">
              <span className="poster poster-moon">MOON<br />TAPES</span>
              <span className="poster poster-cat">stay<br />cozy</span>
              <span className="wall-sticker">✦</span>
              <span className="wall-sticker second">☾</span>
            </div>

            <div className="bookshelf">
              <span className="shelf-book pink" />
              <span className="shelf-book blue" />
              <span className="shelf-book gold" />
              <span className="shelf-book green" />
              <span className="shelf-radio"><i /></span>
            </div>

            <div className="rain-window">
              <div className="night-sky">
                <span className="moon"><i /></span>
                <span className="cloud cloud-one" />
                <span className="cloud cloud-two" />
                <span className="city-lights" />
              </div>
              <div className="rain-layer">
                {Array.from({ length: 32 }).map((_, index) => (
                  <i
                    key={index}
                    style={{
                      left: `${(index * 29) % 100}%`,
                      top: `${-30 - ((index * 47) % 260)}px`,
                      height: `${36 + (index % 5) * 12}px`,
                      animationDelay: `${-(index % 11) * 0.23}s`,
                      animationDuration: `${1.1 + (index % 4) * 0.17}s`,
                    }}
                  />
                ))}
              </div>
              <span className="window-cross horizontal" />
              <span className="window-cross vertical" />
              <span className="window-sill" />
            </div>

            <div className="dust-layer">
              {Array.from({ length: 14 }).map((_, index) => (
                <i
                  key={index}
                  style={{
                    left: `${12 + ((index * 31) % 78)}%`,
                    top: `${18 + ((index * 43) % 62)}%`,
                    animationDelay: `${-(index % 7) * 0.8}s`,
                    animationDuration: `${5 + (index % 5)}s`,
                  }}
                />
              ))}
            </div>

            <motion.span
              className="lamp-glow"
              animate={{ opacity: [0.65, 1, 0.65], scale: [0.96, 1.04, 0.96] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="desk-scene">
              <div className="notebook"><i /><i /><b /></div>
              <div className="keyboard">
                {Array.from({ length: 15 }).map((_, index) => <i key={index} />)}
              </div>
              <div className="desk-mouse"><i /></div>
              <div className="vinyl-player"><span className={isMusicPlaying ? 'spinning' : ''}><i /></span><b /></div>
              <div className="mug">
                <b className="mug-saucer" />
                <span className="mug-cup"><i /></span>
                <i className="steam steam-one" />
                <i className="steam steam-two" />
              </div>
              <div className="lamp-object"><span className="lamp-shade" /><i className="lamp-neck" /><i className="lamp-base" /></div>
              <div className="round-cactus"><span><i /><i /><i /></span><b /></div>
              <div className="sleepy-cat"><span className="cat-ear left z-3" /><span className="cat-ear right" /><i className="cat-tail" /><b>⌁</b></div>
              <span className="desk-sticker star">✦</span>
              <span className="desk-sticker heart">♥</span>
            </div>
          </div>

          <div className="timer-card">
            <div className="mode-switcher" aria-label="Timer mode">
              {(Object.keys(modeLabels) as TimerMode[]).map((timerMode) => (
                <button
                  className={mode === timerMode ? 'active' : ''}
                  type="button"
                  onClick={() => setMode(timerMode)}
                  key={timerMode}
                >
                  {modeLabels[timerMode]}
                </button>
              ))}
            </div>

            <p className="timer-label">{timerLabels[mode]}</p>
            <motion.div
              className={`timer-ring${isRunning ? ' running' : ''}`}
              style={timerStyle}
              role="timer"
              aria-live="polite"
              aria-label={`${formatTime(remainingSeconds)} remaining in ${modeLabels[mode]} mode`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55 }}
            >
              <div>
                <strong>{formatTime(remainingSeconds)}</strong>
                <span>{mode === 'focus' ? `session ${sessionNumber} of ${longBreakInterval}` : modeLabels[mode]}</span>
              </div>
            </motion.div>

            <div className="current-task">
              <span>Currently focusing on</span>
              <strong>{activeTask?.title ?? 'Choose a task from your focus list'}</strong>
            </div>

            <div className="timer-controls">
              <button className="icon-button soft large" type="button" aria-label="Reset timer" onClick={reset}><RotateCcw /></button>
              <button className="primary-control" type="button" onClick={isRunning ? pause : start}>
                {isRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                {isRunning ? 'Pause' : `Start ${mode === 'focus' ? 'focus' : 'break'}`}
              </button>
              <button className="icon-button soft large" type="button" aria-label="Skip session" onClick={skip}><SkipForward /></button>
            </div>
          </div>
        </section>
      </div>

      {isSettingsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsSettingsOpen(false)}>
          <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="settings-heading">
              <div>
                <p className="eyebrow">Preferences</p>
                <h2 id="settings-title">Timer settings</h2>
              </div>
              <button className="icon-button soft" type="button" aria-label="Close settings" onClick={() => setIsSettingsOpen(false)}><X /></button>
            </div>

            <div className="settings-list">
              <label>
                <span><strong>Focus duration</strong><small>Minutes per focus session</small></span>
                <input type="number" min="1" max="90" value={focusDuration} onChange={(event) => setFocusDuration(Number(event.target.value))} />
              </label>
              <label>
                <span><strong>Short break</strong><small>Quick recovery between sessions</small></span>
                <input type="number" min="1" max="30" value={shortBreakDuration} onChange={(event) => setShortBreakDuration(Number(event.target.value))} />
              </label>
              <label>
                <span><strong>Long break</strong><small>Rest after a full focus cycle</small></span>
                <input type="number" min="1" max="60" value={longBreakDuration} onChange={(event) => setLongBreakDuration(Number(event.target.value))} />
              </label>
              <label>
                <span><strong>Long break interval</strong><small>Focus sessions before a long break</small></span>
                <input type="number" min="2" max="8" value={longBreakInterval} onChange={(event) => setLongBreakInterval(Number(event.target.value))} />
              </label>
              <div className="notification-setting">
                <span><strong>Desktop notifications</strong><small>Alert me when a session or break ends</small></span>
                <button
                  className={notificationsEnabled ? 'enabled' : ''}
                  type="button"
                  onClick={handleNotifications}
                  disabled={!('Notification' in window)}
                  aria-pressed={notificationsEnabled}
                >
                  {notificationsEnabled ? <Bell /> : <BellOff />}
                  {notificationsEnabled ? 'On' : 'Off'}
                </button>
              </div>
            </div>

            <div className="data-management">
              <div className="data-heading">
                <span><Database /></span>
                <div><strong>Your data</strong><small>Portable JSON backup stored entirely on your device</small></div>
              </div>
              <div className="data-actions">
                <button type="button" onClick={handleExport}><Download /> Export backup</button>
                <button type="button" onClick={() => backupInputRef.current?.click()}><Upload /> Import backup</button>
                <input ref={backupInputRef} type="file" accept="application/json,.json" onChange={handleImport} hidden />
              </div>
            </div>

            <div className="settings-actions">
              <button type="button" onClick={resetSettings}>Restore defaults</button>
              <button className="primary-control" type="button" onClick={() => setIsSettingsOpen(false)}>Save settings</button>
            </div>
          </section>
        </div>
      )}

      {isStatsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsStatsOpen(false)}>
          <section className="settings-modal stats-modal" role="dialog" aria-modal="true" aria-labelledby="stats-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="settings-heading">
              <div>
                <p className="eyebrow">Your rhythm</p>
                <h2 id="stats-title">Focus history</h2>
              </div>
              <button className="icon-button soft" type="button" aria-label="Close statistics" onClick={() => setIsStatsOpen(false)}><X /></button>
            </div>

            <div className="stats-summary">
              <article><strong>{todayFocusSessions.length}</strong><span>sessions today</span></article>
              <article><strong>{Math.round(todayFocusSessions.reduce((total, session) => total + session.duration / 60, 0))}</strong><span>minutes today</span></article>
              <article><strong>{Math.round(totalFocusMinutes)}</strong><span>all-time minutes</span></article>
            </div>

            <div className="weekly-chart" aria-label="Focus minutes over the last seven days">
              {lastSevenDays.map((day) => (
                <div className="chart-day" key={day.key} title={`${Math.round(day.minutes)} minutes`}>
                  <span className="chart-value">{day.minutes > 0 ? Math.round(day.minutes) : ''}</span>
                  <span className="chart-track"><i style={{ height: `${Math.max(4, (day.minutes / maxDailyMinutes) * 100)}%` }} /></span>
                  <small>{day.label}</small>
                </div>
              ))}
            </div>

            <div className="history-heading">
              <strong>Recent sessions</strong>
              {sessions.length > 0 && <button type="button" onClick={clearHistory}>Clear history</button>}
            </div>
            <div className="history-list">
              {sessions.length === 0 ? (
                <p className="empty-history">Complete your first session to start building a focus history.</p>
              ) : sessions.slice(0, 6).map((session) => (
                <article key={session.id}>
                  <span className={`history-dot ${session.type}`} />
                  <span><strong>{session.taskTitle ?? modeLabels[session.type]}</strong><small>{new Date(session.endedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small></span>
                  <b>{Math.round(session.duration / 60)} min</b>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      <footer className="ambience-bar">
        <div className="now-playing">
          <span className="sound-icon"><Music2 /><i /><i /><i /></span>
          <span><small>Now playing</small><strong>{currentTrack.title}</strong><em>{currentTrack.artist}</em></span>
        </div>
        <div className={`player-center${isMusicPlaying ? ' playing' : ''}`}>
          <button className="transport-button" type="button" aria-label="Previous track" onClick={previousTrack}><SkipBack fill="currentColor" /></button>
          <button
            className="round-play"
            type="button"
            aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
            onClick={toggleMusic}
          >
            {isMusicPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
          </button>
          <button className="transport-button" type="button" aria-label="Next track" onClick={nextTrack}><SkipForward fill="currentColor" /></button>
          <div className="sound-wave">
            {Array.from({ length: 18 }).map((_, index) => <i key={index} style={{ animationDelay: `${index * 0.08}s` }} />)}
          </div>
        </div>
        <div className="volume-control mixer-control">
          <div className="mixer-row">
            <small>Music</small>
            <button className="volume-button" type="button" aria-label={isMusicMuted ? 'Unmute music' : 'Mute music'} onClick={toggleMusicMuted}>
              {isMusicMuted ? <VolumeX /> : <Volume2 />}
            </button>
            <input className="volume-slider" type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={(event) => setMusicVolume(Number(event.target.value))} aria-label="Music volume" />
          </div>
          <div className="mixer-row">
            <small>Ambience</small>
            <button className={`ambience-toggle${isAmbiencePlaying ? ' active' : ''}`} type="button" aria-label={isAmbiencePlaying ? 'Pause ambience' : 'Play ambience'} onClick={toggleAmbience} disabled={ambience === 'none'}><CloudRain /></button>
            <button className="volume-button" type="button" aria-label={isAmbienceMuted ? 'Unmute ambience' : 'Mute ambience'} onClick={toggleMuted}>{isAmbienceMuted ? <VolumeX /> : <Volume2 />}</button>
            <input className="volume-slider compact" type="range" min="0" max="1" step="0.01" value={ambienceVolume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Ambience volume" />
            <label className="ambience-select">
              <select value={ambience} onChange={(event) => setAmbience(event.target.value as Ambience)} aria-label="Choose ambience">
                {(Object.keys(ambienceLabels) as Ambience[]).map((option) => <option value={option} key={option}>{ambienceLabels[option]}</option>)}
              </select>
            </label>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="session-toast"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
          >
            <span><Bell /></span>
            <div><strong>{toast.title}</strong><small>{toast.message}</small></div>
            <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}><X /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App
