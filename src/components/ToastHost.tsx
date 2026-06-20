import { memo, useEffect, useRef } from 'react'
import { Bell, X } from 'lucide-react'
import { useSessionStore } from '../stores/session-store'
import { useToastStore } from '../stores/toast-store'

export const ToastHost = memo(function ToastHost() {
  const sessions = useSessionStore((state) => state.sessions)
  const toast = useToastStore((state) => state.toast)
  const showToast = useToastStore((state) => state.showToast)
  const dismissToast = useToastStore((state) => state.dismissToast)
  const previousSessionCount = useRef(sessions.length)

  useEffect(() => {
    if (sessions.length > previousSessionCount.current) {
      const newestSession = sessions[0]
      showToast({
        title: 'Session complete',
        message: newestSession.type === 'focus'
          ? 'Focus session complete — time to recharge.'
          : 'Break complete — ready when you are.',
      })
    }
    previousSessionCount.current = sessions.length
  }, [sessions, showToast])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(dismissToast, 4_500)
    return () => window.clearTimeout(timeout)
  }, [toast, dismissToast])

  if (!toast) return null

  return (
    <div className="session-toast" role="status">
      <span><Bell /></span>
      <div><strong>{toast.title}</strong><small>{toast.message}</small></div>
      <button type="button" aria-label="Dismiss notification" onClick={dismissToast}><X /></button>
    </div>
  )
})
