import { useEffect, useRef } from 'react'
import type { Howl as HowlInstance } from 'howler'
import { AMBIENCE_TRACKS, useAmbienceStore } from '../stores/ambience-store'

export const useAmbienceAudio = () => {
  const soundRef = useRef<HowlInstance | null>(null)
  const { ambience, volume, isMuted, isPlaying, stop } = useAmbienceStore()

  useEffect(() => {
    soundRef.current?.unload()
    soundRef.current = null
    let cancelled = false
    let sound: HowlInstance | null = null

    const loadAmbience = async () => {
      if (ambience === 'none' || !isPlaying) return

      const { Howl } = await import('howler')
      const currentState = useAmbienceStore.getState()
      if (cancelled || !currentState.isPlaying || currentState.ambience !== ambience) return
      const track = AMBIENCE_TRACKS[ambience]

      sound = new Howl({
        src: [track.src],
        format: ['mp3'],
        loop: track.loop,
        volume: currentState.volume,
        onloaderror: stop,
        onend: track.loop ? undefined : stop,
      })
      sound.mute(currentState.isMuted)
      soundRef.current = sound
      sound.play()
    }

    void loadAmbience()

    return () => {
      cancelled = true
      sound?.unload()
      if (soundRef.current === sound) soundRef.current = null
    }
  }, [ambience, isPlaying, stop])

  useEffect(() => {
    const sound = soundRef.current
    if (!sound) return
    sound.volume(volume)
    sound.mute(isMuted)
  }, [volume, isMuted])

}
