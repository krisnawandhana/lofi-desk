import { useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { AMBIENCE_TRACKS, useAmbienceStore } from '../stores/ambience-store'

export const useAmbienceAudio = () => {
  const soundRef = useRef<Howl | null>(null)
  const { ambience, volume, isMuted, isPlaying, stop } = useAmbienceStore()

  useEffect(() => {
    soundRef.current?.unload()
    soundRef.current = null

    if (ambience === 'none') return

    const currentState = useAmbienceStore.getState()
    const track = AMBIENCE_TRACKS[ambience]

    const sound = new Howl({
      src: [track.src],
      format: ['mp3'],
      loop: track.loop,
      volume: currentState.volume,
      onloaderror: stop,
      onend: track.loop ? undefined : stop,
    })
    sound.mute(currentState.isMuted)
    soundRef.current = sound
    if (currentState.isPlaying) sound.play()

    return () => {
      sound.unload()
      soundRef.current = null
    }
  }, [ambience, stop])

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
}
