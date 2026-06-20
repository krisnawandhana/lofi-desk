import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Bell, BellOff, Database, Download, FileMusic, Link2, Music2, Settings, Trash2, Upload, X } from 'lucide-react'
import { downloadBackup, importBackup } from '../lib/backup'
import { useSettingsStore } from '../stores/settings-store'
import { getAllMusicTracks, useMusicStore } from '../stores/music-store'
import { useToastStore } from '../stores/toast-store'
import { useDialogFocus } from '../hooks/use-dialog-focus'

type SettingsModalProps = {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [settingsTab, setSettingsTab] = useState<'timer' | 'music'>('timer')
  const [musicUrl, setMusicUrl] = useState('')
  const [musicTitle, setMusicTitle] = useState('')
  const [isMusicImporting, setIsMusicImporting] = useState(false)
  const backupInputRef = useRef<HTMLInputElement>(null)
  const musicInputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const showToast = useToastStore((state) => state.showToast)
  useDialogFocus(dialogRef, onClose)

  const focusDuration = useSettingsStore((state) => state.focusDuration)
  const shortBreakDuration = useSettingsStore((state) => state.shortBreakDuration)
  const longBreakDuration = useSettingsStore((state) => state.longBreakDuration)
  const longBreakInterval = useSettingsStore((state) => state.longBreakInterval)
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled)
  const setFocusDuration = useSettingsStore((state) => state.setFocusDuration)
  const setShortBreakDuration = useSettingsStore((state) => state.setShortBreakDuration)
  const setLongBreakDuration = useSettingsStore((state) => state.setLongBreakDuration)
  const setLongBreakInterval = useSettingsStore((state) => state.setLongBreakInterval)
  const setNotificationsEnabled = useSettingsStore((state) => state.setNotificationsEnabled)
  const resetSettings = useSettingsStore((state) => state.resetSettings)

  const customTracks = useMusicStore((state) => state.customTracks)
  const musicTrackIndex = useMusicStore((state) => state.trackIndex)
  const isMusicPlaying = useMusicStore((state) => state.isPlaying)
  const toggleMusic = useMusicStore((state) => state.togglePlaying)
  const setTrack = useMusicStore((state) => state.setTrack)
  const addLocalFiles = useMusicStore((state) => state.addLocalFiles)
  const addUrlTrack = useMusicStore((state) => state.addUrlTrack)
  const removeCustomTrack = useMusicStore((state) => state.removeCustomTrack)
  const allMusicTracks = useMemo(() => getAllMusicTracks(customTracks), [customTracks])

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
    showToast({ title: 'Backup exported', message: 'Your Lofi Desk data was saved as a JSON file.' })
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await importBackup(file)
      showToast({ title: 'Backup restored', message: 'Tasks, history, and preferences were imported.' })
    } catch (error) {
      showToast({
        title: 'Import failed',
        message: error instanceof Error ? error.message : 'The selected backup could not be imported.',
      })
    } finally {
      event.target.value = ''
    }
  }

  const handleMusicUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('audio/'))
    if (files.length === 0) return
    setIsMusicImporting(true)
    try {
      await addLocalFiles(files)
      await navigator.storage?.persist?.()
      showToast({ title: 'Music imported', message: `${files.length} track${files.length === 1 ? '' : 's'} saved for offline playback.` })
    } catch {
      showToast({ title: 'Import failed', message: 'The audio files could not be saved to this device.' })
    } finally {
      setIsMusicImporting(false)
      event.target.value = ''
    }
  }

  const handleAddMusicUrl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const url = new URL(musicUrl)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
      addUrlTrack(musicTitle, url.toString())
      setMusicTitle('')
      setMusicUrl('')
      showToast({ title: 'Audio URL added', message: 'The track was added. Playback depends on the host’s CORS policy.' })
    } catch {
      showToast({ title: 'Invalid URL', message: 'Use a direct HTTP or HTTPS link to an audio file.' })
    }
  }

  const handleMusicTrackSelect = (index: number) => {
    if (index === musicTrackIndex) {
      toggleMusic()
      return
    }
    setTrack(index)
    if (!isMusicPlaying) toggleMusic()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className={`settings-modal${settingsTab === 'music' ? ' music-library-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="settings-heading">
          <div>
            <p className="eyebrow">Preferences</p>
            <h2 id="settings-title">{settingsTab === 'timer' ? 'Timer settings' : 'Music library'}</h2>
          </div>
          <button className="icon-button soft" type="button" aria-label="Close settings" onClick={onClose}><X /></button>
        </div>

        <div className="settings-tabs" role="tablist" aria-label="Settings sections">
          <button className={settingsTab === 'timer' ? 'active' : ''} type="button" role="tab" aria-selected={settingsTab === 'timer'} onClick={() => setSettingsTab('timer')}><Settings /> Timer</button>
          <button className={settingsTab === 'music' ? 'active' : ''} type="button" role="tab" aria-selected={settingsTab === 'music'} onClick={() => setSettingsTab('music')}><Music2 /> Music Library</button>
        </div>

        {settingsTab === 'timer' && <>
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
              <button className={notificationsEnabled ? 'enabled' : ''} type="button" onClick={handleNotifications} disabled={!('Notification' in window)} aria-pressed={notificationsEnabled}>
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
            <button className="primary-control" type="button" onClick={onClose}>Save settings</button>
          </div>
        </>}

        {settingsTab === 'music' && <>
          <div className="music-import-grid">
            <button className="music-upload-card" type="button" onClick={() => musicInputRef.current?.click()} disabled={isMusicImporting}>
              <span><FileMusic /></span>
              <strong>{isMusicImporting ? 'Importing…' : 'Upload music'}</strong>
              <small>MP3, OGG, or WAV from this device</small>
            </button>
            <input ref={musicInputRef} type="file" accept="audio/mpeg,audio/ogg,audio/wav,audio/*" multiple onChange={handleMusicUpload} hidden />

            <form className="music-url-form" onSubmit={handleAddMusicUrl}>
              <div className="music-url-heading"><Link2 /><span><strong>Direct audio URL</strong><small>Requires an audio host with CORS enabled</small></span></div>
              <input value={musicTitle} onChange={(event) => setMusicTitle(event.target.value)} placeholder="Track title (optional)" aria-label="Online track title" />
              <div><input required type="url" value={musicUrl} onChange={(event) => setMusicUrl(event.target.value)} placeholder="https://example.com/song.mp3" aria-label="Direct audio URL" /><button type="submit">Add</button></div>
            </form>
          </div>

          <div className="music-library-heading"><strong>Tracks</strong><small>{allMusicTracks.length} total · {customTracks.length} imported</small></div>
          <div className="music-library-list">
            {allMusicTracks.map((track, index) => (
              <article className={index === musicTrackIndex ? 'active' : ''} key={track.id}>
                <button className="music-track-main" type="button" onClick={() => handleMusicTrackSelect(index)}>
                  <span><Music2 /></span>
                  <span><strong>{track.title}</strong><small>{track.artist}</small></span>
                </button>
                <em>{track.source === 'builtin' ? 'Built-in' : track.source === 'local' ? 'Offline' : 'URL'}</em>
                {track.source !== 'builtin' && <button className="remove-music" type="button" aria-label={`Remove ${track.title}`} onClick={() => void removeCustomTrack(track.id)}><Trash2 /></button>}
              </article>
            ))}
          </div>

          <div className="settings-actions music-actions">
            <small>Uploaded files are stored only on this device.</small>
            <button className="primary-control" type="button" onClick={onClose}>Done</button>
          </div>
        </>}
      </section>
    </div>
  )
}
