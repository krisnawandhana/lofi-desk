import { lazy, Suspense, useEffect, useState } from 'react'
import {
  BarChart3,
  Coffee,
  Settings,
} from 'lucide-react'
import { useTimerStore } from './stores/timer-store'
import { LofiRoomScene } from './components/LofiRoomScene'
import { TaskPanel } from './components/TaskPanel'
import { TimerCard } from './components/TimerCard'
import { AmbienceBar } from './components/AmbienceBar'
import { AudioController } from './components/AudioController'
import { ToastHost } from './components/ToastHost'

const loadStatsModal = () => import('./components/StatsModal')
const loadSettingsModal = () => import('./components/SettingsModal')
const StatsModal = lazy(() => loadStatsModal().then((module) => ({ default: module.StatsModal })))
const SettingsModal = lazy(() => loadSettingsModal().then((module) => ({ default: module.SettingsModal })))

function ModalLoading() {
  return (
    <div className="modal-backdrop">
      <div className="settings-modal modal-loading" role="status" aria-live="polite">
        <span />
        <strong>Loading…</strong>
      </div>
    </div>
  )
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [timeTheme, setTimeTheme] = useState<TimeTheme>(getTimeTheme)
  const mode = useTimerStore((state) => state.mode)

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
    const syncPageVisibility = () => {
      document.documentElement.dataset.pageVisibility = document.hidden ? 'hidden' : 'visible'
    }
    syncPageVisibility()
    document.addEventListener('visibilitychange', syncPageVisibility)
    return () => {
      document.removeEventListener('visibilitychange', syncPageVisibility)
      delete document.documentElement.dataset.pageVisibility
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false)
        setIsStatsOpen(false)
        return
      }

      const target = event.target as HTMLElement
      const isFormField = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target.tagName)
      if (event.code !== 'Space' || isFormField || isSettingsOpen || isStatsOpen) return
      event.preventDefault()
      const { isRunning, pause, start } = useTimerStore.getState()
      if (isRunning) pause()
      else start()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSettingsOpen, isStatsOpen])

  return (
    <main className="app-shell" data-time={timeTheme} data-modal-open={isSettingsOpen || isStatsOpen}>
      <AudioController />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Lofi Desk home">
          <span className="brand-mark"><Coffee size={18} /></span>
          <span>Lofi Desk</span>
        </a>

        <div className="topbar-actions">
          <span className="offline-status"><span /> Saved offline</span>
          <button className="icon-button" type="button" aria-label="Open statistics" onPointerEnter={() => void loadStatsModal()} onFocus={() => void loadStatsModal()} onClick={() => setIsStatsOpen(true)}><BarChart3 /></button>
          <button className="icon-button" type="button" aria-label="Open settings" onPointerEnter={() => void loadSettingsModal()} onFocus={() => void loadSettingsModal()} onClick={() => setIsSettingsOpen(true)}><Settings /></button>
          <button className="avatar" type="button" aria-label="Open profile">WA</button>
        </div>
      </header>

      <div className="workspace">
        <TaskPanel />

        <section className="focus-area" data-mode={mode} data-time={timeTheme}>
          <LofiRoomScene isPaused={isSettingsOpen || isStatsOpen} />

          <TimerCard />
        </section>
      </div>

      {isSettingsOpen && (
        <Suspense fallback={<ModalLoading />}>
          <SettingsModal onClose={() => setIsSettingsOpen(false)} />
        </Suspense>
      )}

      {isStatsOpen && (
        <Suspense fallback={<ModalLoading />}>
          <StatsModal onClose={() => setIsStatsOpen(false)} />
        </Suspense>
      )}

      <AmbienceBar />
      <ToastHost />
    </main>
  )
}

export default App
