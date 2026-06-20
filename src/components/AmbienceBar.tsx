import { memo, useMemo } from 'react'
import { CloudRain, Music2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useAmbienceStore, type Ambience } from '../stores/ambience-store'
import { getAllMusicTracks, useMusicStore } from '../stores/music-store'

const AMBIENCE_LABELS: Record<Ambience, string> = {
  rain: 'Rainy night',
  lofi: 'Lofi beat',
  fireplace: 'Fireplace',
  cafe: 'Cozy cafe',
  ocean: 'Ocean waves',
  coffee: 'Coffee ritual',
  none: 'No ambience',
}

const SOUND_WAVE_BARS = Array.from({ length: 18 }, (_, index) => ({
  animationDelay: `${index * 0.08}s`,
}))

const NowPlaying = memo(function NowPlaying() {
  const customTracks = useMusicStore((state) => state.customTracks)
  const musicTrackIndex = useMusicStore((state) => state.trackIndex)
  const allMusicTracks = useMemo(() => getAllMusicTracks(customTracks), [customTracks])
  const currentTrack = allMusicTracks[musicTrackIndex] ?? allMusicTracks[0]

  return (
    <div className="now-playing">
      <span className="sound-icon"><Music2 /><i /><i /><i /></span>
      <span><small>Now playing</small><strong>{currentTrack.title}</strong><em>{currentTrack.artist}</em></span>
    </div>
  )
})

const MusicTransport = memo(function MusicTransport() {
  const isMusicPlaying = useMusicStore((state) => state.isPlaying)
  const toggleMusic = useMusicStore((state) => state.togglePlaying)
  const nextTrack = useMusicStore((state) => state.nextTrack)
  const previousTrack = useMusicStore((state) => state.previousTrack)

  return (
    <div className={`player-center${isMusicPlaying ? ' playing' : ''}`}>
      <button className="transport-button" type="button" aria-label="Previous track" onClick={previousTrack}><SkipBack fill="currentColor" /></button>
      <button className="round-play" type="button" aria-label={isMusicPlaying ? 'Pause music' : 'Play music'} onClick={toggleMusic}>
        {isMusicPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
      </button>
      <button className="transport-button" type="button" aria-label="Next track" onClick={nextTrack}><SkipForward fill="currentColor" /></button>
      <div className="sound-wave">
        {SOUND_WAVE_BARS.map((style, index) => <i key={index} style={style} />)}
      </div>
    </div>
  )
})

const MusicVolume = memo(function MusicVolume() {
  const musicVolume = useMusicStore((state) => state.volume)
  const isMusicMuted = useMusicStore((state) => state.isMuted)
  const setMusicVolume = useMusicStore((state) => state.setVolume)
  const toggleMusicMuted = useMusicStore((state) => state.toggleMuted)

  return (
    <div className="mixer-row">
      <small>Music</small>
      <button className="volume-button" type="button" aria-label={isMusicMuted ? 'Unmute music' : 'Mute music'} onClick={toggleMusicMuted}>
        {isMusicMuted ? <VolumeX /> : <Volume2 />}
      </button>
      <input className="volume-slider" type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={(event) => setMusicVolume(Number(event.target.value))} aria-label="Music volume" />
    </div>
  )
})

const AmbienceMixer = memo(function AmbienceMixer() {
  const ambience = useAmbienceStore((state) => state.ambience)
  const ambienceVolume = useAmbienceStore((state) => state.volume)
  const isAmbienceMuted = useAmbienceStore((state) => state.isMuted)
  const isAmbiencePlaying = useAmbienceStore((state) => state.isPlaying)
  const setAmbience = useAmbienceStore((state) => state.setAmbience)
  const setVolume = useAmbienceStore((state) => state.setVolume)
  const toggleMuted = useAmbienceStore((state) => state.toggleMuted)
  const toggleAmbience = useAmbienceStore((state) => state.togglePlaying)

  return (
    <div className="mixer-row">
      <small>Ambience</small>
      <button className={`ambience-toggle${isAmbiencePlaying ? ' active' : ''}`} type="button" aria-label={isAmbiencePlaying ? 'Pause ambience' : 'Play ambience'} onClick={toggleAmbience} disabled={ambience === 'none'}><CloudRain /></button>
      <button className="volume-button" type="button" aria-label={isAmbienceMuted ? 'Unmute ambience' : 'Mute ambience'} onClick={toggleMuted}>{isAmbienceMuted ? <VolumeX /> : <Volume2 />}</button>
      <input className="volume-slider compact" type="range" min="0" max="1" step="0.01" value={ambienceVolume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Ambience volume" />
      <label className="ambience-select">
        <select value={ambience} onChange={(event) => setAmbience(event.target.value as Ambience)} aria-label="Choose ambience">
          {(Object.keys(AMBIENCE_LABELS) as Ambience[]).map((option) => <option value={option} key={option}>{AMBIENCE_LABELS[option]}</option>)}
        </select>
      </label>
    </div>
  )
})

export const AmbienceBar = memo(function AmbienceBar() {
  return (
    <footer className="ambience-bar">
      <NowPlaying />
      <MusicTransport />
      <div className="volume-control mixer-control">
        <MusicVolume />
        <AmbienceMixer />
      </div>
    </footer>
  )
})
