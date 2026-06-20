import { memo, useEffect, type CSSProperties } from 'react'
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { useTimerStore, type TimerMode } from '../stores/timer-store'
import { getTimerDuration, useSettingsStore } from '../stores/settings-store'
import { useTaskStore } from '../stores/task-store'

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  short_break: 'Short break',
  long_break: 'Long break',
}

const TIMER_LABELS: Record<TimerMode, string> = {
  focus: 'Time to focus',
  short_break: 'Take a breather',
  long_break: 'Time for a deep rest',
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`
}

const TimerController = memo(function TimerController() {
  const isRunning = useTimerStore((state) => state.isRunning)
  const reset = useTimerStore((state) => state.reset)
  const tick = useTimerStore((state) => state.tick)
  const focusDuration = useSettingsStore((state) => state.focusDuration)
  const shortBreakDuration = useSettingsStore((state) => state.shortBreakDuration)
  const longBreakDuration = useSettingsStore((state) => state.longBreakDuration)

  useEffect(() => {
    if (!isRunning) return
    tick()
    const interval = window.setInterval(tick, 1_000)
    const syncVisibleTimer = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', syncVisibleTimer)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', syncVisibleTimer)
    }
  }, [isRunning, tick])

  useEffect(() => {
    if (!useTimerStore.getState().isRunning) reset()
  }, [focusDuration, shortBreakDuration, longBreakDuration, reset])

  return null
})

const ModeSwitcher = memo(function ModeSwitcher() {
  const mode = useTimerStore((state) => state.mode)
  const setMode = useTimerStore((state) => state.setMode)

  return (
    <div className="mode-switcher" aria-label="Timer mode">
      {(Object.keys(MODE_LABELS) as TimerMode[]).map((timerMode) => (
        <button className={mode === timerMode ? 'active' : ''} type="button" onClick={() => setMode(timerMode)} key={timerMode}>
          {MODE_LABELS[timerMode]}
        </button>
      ))}
    </div>
  )
})

const TimerDisplay = memo(function TimerDisplay() {
  const mode = useTimerStore((state) => state.mode)
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds)
  const isRunning = useTimerStore((state) => state.isRunning)
  const completedFocusSessions = useTimerStore((state) => state.completedFocusSessions)
  const longBreakInterval = useSettingsStore((state) => state.longBreakInterval)

  useEffect(() => {
    document.title = `${formatTime(remainingSeconds)} • ${MODE_LABELS[mode]} — Lofi Desk`
    return () => { document.title = 'Lofi Desk' }
  }, [mode, remainingSeconds])

  const progress = (remainingSeconds / getTimerDuration(mode)) * 100
  const timerStyle = { '--timer-progress': `${progress}%` } as CSSProperties
  const sessionNumber = (completedFocusSessions % longBreakInterval) + 1

  return <>
    <p className="timer-label">{TIMER_LABELS[mode]}</p>
    <div
      className={`timer-ring${isRunning ? ' running' : ''}`}
      style={timerStyle}
      role="timer"
      aria-live="polite"
      aria-label={`${formatTime(remainingSeconds)} remaining in ${MODE_LABELS[mode]} mode`}
    >
      <div>
        <strong>{formatTime(remainingSeconds)}</strong>
        <span>{mode === 'focus' ? `session ${sessionNumber} of ${longBreakInterval}` : MODE_LABELS[mode]}</span>
      </div>
    </div>
  </>
})

const CurrentTask = memo(function CurrentTask() {
  const activeTask = useTaskStore((state) => state.tasks.find((task) => task.id === state.activeTaskId))

  return (
    <div className="current-task">
      <span>Currently focusing on</span>
      <strong>{activeTask?.title ?? 'Choose a task from your focus list'}</strong>
    </div>
  )
})

const TimerControls = memo(function TimerControls() {
  const mode = useTimerStore((state) => state.mode)
  const isRunning = useTimerStore((state) => state.isRunning)
  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const reset = useTimerStore((state) => state.reset)
  const skip = useTimerStore((state) => state.skip)

  return (
    <div className="timer-controls">
      <button className="icon-button soft large" type="button" aria-label="Reset timer" onClick={reset}><RotateCcw /></button>
      <button className="primary-control" type="button" onClick={isRunning ? pause : start}>
        {isRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
        {isRunning ? 'Pause' : `Start ${mode === 'focus' ? 'focus' : 'break'}`}
      </button>
      <button className="icon-button soft large" type="button" aria-label="Skip session" onClick={skip}><SkipForward /></button>
    </div>
  )
})

export const TimerCard = memo(function TimerCard() {
  return (
    <div className="timer-card">
      <TimerController />
      <ModeSwitcher />
      <TimerDisplay />
      <CurrentTask />
      <TimerControls />
    </div>
  )
})
