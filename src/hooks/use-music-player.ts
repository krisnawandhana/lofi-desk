import { useEffect, useRef, useState } from 'react'
import type { Howl as HowlInstance } from 'howler'
import { getMusicFile } from '../lib/music-library'
import { getAllMusicTracks, useMusicStore } from '../stores/music-store'

const CROSSFADE_DURATION = 1_200

export const useMusicPlayer = () => {
  const soundRef = useRef<HowlInstance | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const loadedTrackIdRef = useRef<string | undefined>(undefined)
  const requestedTrackIdRef = useRef<string | undefined>(undefined)
  const [loadRequest, setLoadRequest] = useState(0)
  const { customTracks, trackIndex, volume, isMuted, isPlaying, stop } = useMusicStore()
  const trackId = getAllMusicTracks(customTracks)[trackIndex]?.id

  useEffect(() => {
    let cancelled = false

    const loadTrack = async () => {
      const currentState = useMusicStore.getState()
      const requestedTrackId = requestedTrackIdRef.current
      if (!currentState.isPlaying || !requestedTrackId) return
      if (loadedTrackIdRef.current === requestedTrackId && soundRef.current) {
        soundRef.current.play()
        return
      }

      const track = getAllMusicTracks(currentState.customTracks).find((item) => item.id === requestedTrackId)
      if (!track) {
        stop()
        return
      }

      let source = track.src
      let objectUrl: string | null = null
      let format = track.format
      if (track.source === 'local' && track.storageKey) {
        const blob = await getMusicFile(track.storageKey)
        if (!blob) {
          stop()
          return
        }
        objectUrl = URL.createObjectURL(blob)
        source = objectUrl
        format = blob.type.includes('ogg')
          ? 'ogg'
          : blob.type.includes('wav')
            ? 'wav'
            : 'mp3'
      }

      if (!source || cancelled) {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        return
      }

      const { Howl } = await import('howler')
      const latestState = useMusicStore.getState()
      if (cancelled || !latestState.isPlaying || requestedTrackIdRef.current !== requestedTrackId) {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        return
      }

      const previousSound = soundRef.current
      const previousObjectUrl = objectUrlRef.current
      const sound = new Howl({
        src: [source],
        format: [format ?? 'mp3'],
        volume: latestState.isMuted ? latestState.volume : 0,
        onend: () => useMusicStore.getState().nextTrack(),
        onloaderror: stop,
      })

      sound.mute(latestState.isMuted)
      soundRef.current = sound
      objectUrlRef.current = objectUrl
      loadedTrackIdRef.current = requestedTrackId

      sound.play()
      if (!latestState.isMuted) sound.fade(0, latestState.volume, CROSSFADE_DURATION)

      if (previousSound) {
        if (!latestState.isMuted) {
          previousSound.fade(latestState.volume, 0, CROSSFADE_DURATION)
          window.setTimeout(() => {
            previousSound.stop()
            previousSound.unload()
            if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl)
          }, CROSSFADE_DURATION)
        } else {
          previousSound.stop()
          previousSound.unload()
          if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl)
        }
      }
    }

    void loadTrack()
    return () => { cancelled = true }
  }, [loadRequest, stop])

  useEffect(() => {
    const sound = soundRef.current
    if (!sound) return
    sound.volume(volume)
    sound.mute(isMuted)
  }, [volume, isMuted])

  useEffect(() => {
    const sound = soundRef.current
    if (!isPlaying) {
      sound?.pause()
      return
    }

    if (sound && loadedTrackIdRef.current === trackId) {
      sound.play()
      return
    }

    requestedTrackIdRef.current = trackId
    setLoadRequest((request) => request + 1)
  }, [isPlaying, trackId])

  useEffect(() => () => {
    soundRef.current?.unload()
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    loadedTrackIdRef.current = undefined
  }, [])
}
