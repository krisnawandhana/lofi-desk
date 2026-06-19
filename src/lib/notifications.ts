import { useSettingsStore } from '../stores/settings-store'
import type { TimerMode } from '../stores/timer-store'

const nextModeMessages: Record<TimerMode, string> = {
  focus: 'Your break is over. Ready for another calm focus session?',
  short_break: 'Focus session complete. Take a short, refreshing break.',
  long_break: 'Focus cycle complete. You earned a longer rest.',
}

export const sendSessionNotification = (nextMode: TimerMode) => {
  if (!useSettingsStore.getState().notificationsEnabled) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  new Notification('Lofi Desk', {
    body: nextModeMessages[nextMode],
    icon: '/favicon.svg',
    tag: 'lofi-desk-session',
  })
}
