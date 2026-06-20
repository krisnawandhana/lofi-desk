import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const registerServiceWorker = async () => {
  const { registerSW } = await import('virtual:pwa-register')
  registerSW({ immediate: true })
}

const scheduleServiceWorker = () => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => void registerServiceWorker(), { timeout: 4_000 })
    return
  }
  setTimeout(() => void registerServiceWorker(), 1_500)
}

if (document.readyState === 'complete') scheduleServiceWorker()
else window.addEventListener('load', scheduleServiceWorker, { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
