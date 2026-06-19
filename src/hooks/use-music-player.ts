import { useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { MUSIC_TRACKS, useMusicStore } from '../stores/music-store'

const CROSSFADE_DURATION = 1_200

export const useMusicPlayer = () => {
  const soundRef = useRef<Howl | null>(null)
  const { trackIndex, volume, isMuted, isPlaying, stop } = useMusicStore()

  useEffect(() => {
    const previousSound = soundRef.current
    const currentState = useMusicStore.getState()
    const track = MUSIC_TRACKS[trackIndex]
    const sound = new Howl({
      src: [track.src],
      format: ['mp3'],
      volume: currentState.isPlaying && !currentState.isMuted ? 0 : currentState.volume,
      onend: () => useMusicStore.getState().nextTrack(),
      onloaderror: stop,
    })

    sound.mute(currentState.isMuted)
    soundRef.current = sound

    if (currentState.isPlaying) {
      sound.play()
      if (!currentState.isMuted) sound.fade(0, currentState.volume, CROSSFADE_DURATION)
    }

    if (previousSound) {
      if (currentState.isPlaying && !currentState.isMuted) {
        previousSound.fade(currentState.volume, 0, CROSSFADE_DURATION)
        window.setTimeout(() => {
          previousSound.stop()
          previousSound.unload()
        }, CROSSFADE_DURATION)
      } else {
        previousSound.stop()
        previousSound.unload()
      }
    }
  }, [trackIndex, stop])

  useEffect(() => {
    const sound = soundRef.current
    if (!sound) return
    sound.volume(volume)
    sound.mute(isMuted)
  }, [volume, isMuted])

  useEffect(() => {
    const sound = soundRef.current
    if (!sound) return
    if (isPlaying) sound.play()
    else sound.pause()
  }, [isPlaying])

  useEffect(() => () => soundRef.current?.unload(), [])
}
