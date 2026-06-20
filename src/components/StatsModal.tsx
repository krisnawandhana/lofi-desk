import { useMemo, useRef } from 'react'
import { X } from 'lucide-react'
import { useSessionStore } from '../stores/session-store'
import type { TimerMode } from '../stores/timer-store'
import { useDialogFocus } from '../hooks/use-dialog-focus'

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  short_break: 'Short break',
  long_break: 'Long break',
}

const getLocalDateKey = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

type StatsModalProps = {
  onClose: () => void
}

export function StatsModal({ onClose }: StatsModalProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const sessions = useSessionStore((state) => state.sessions)
  const clearHistory = useSessionStore((state) => state.clearHistory)
  useDialogFocus(dialogRef, onClose)

  const { totalFocusMinutes, todayFocusSessions, todayFocusMinutes, lastSevenDays, maxDailyMinutes } = useMemo(() => {
    const todayKey = getLocalDateKey(new Date())
    const minutesByDay = new Map<string, number>()
    let totalMinutes = 0
    let sessionsToday = 0

    sessions.forEach((session) => {
      if (session.type !== 'focus') return
      const minutes = session.duration / 60
      const dateKey = getLocalDateKey(session.endedAt)
      totalMinutes += minutes
      minutesByDay.set(dateKey, (minutesByDay.get(dateKey) ?? 0) + minutes)
      if (dateKey === todayKey) sessionsToday += 1
    })

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (6 - index))
      const key = getLocalDateKey(date)
      return {
        key,
        label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
        minutes: minutesByDay.get(key) ?? 0,
      }
    })

    return {
      totalFocusMinutes: totalMinutes,
      todayFocusSessions: sessionsToday,
      todayFocusMinutes: minutesByDay.get(todayKey) ?? 0,
      lastSevenDays: days,
      maxDailyMinutes: Math.max(25, ...days.map((day) => day.minutes)),
    }
  }, [sessions])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className="settings-modal stats-modal" role="dialog" aria-modal="true" aria-labelledby="stats-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="settings-heading">
          <div>
            <p className="eyebrow">Your rhythm</p>
            <h2 id="stats-title">Focus history</h2>
          </div>
          <button className="icon-button soft" type="button" aria-label="Close statistics" onClick={onClose}><X /></button>
        </div>

        <div className="stats-summary">
          <article><strong>{todayFocusSessions}</strong><span>sessions today</span></article>
          <article><strong>{Math.round(todayFocusMinutes)}</strong><span>minutes today</span></article>
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
              <span><strong>{session.taskTitle ?? MODE_LABELS[session.type]}</strong><small>{new Date(session.endedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small></span>
              <b>{Math.round(session.duration / 60)} min</b>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
