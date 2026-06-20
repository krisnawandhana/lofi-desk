import { memo } from 'react'
import { useAmbienceAudio } from '../hooks/use-ambience-audio'
import { useMusicPlayer } from '../hooks/use-music-player'

const AmbienceAudioController = memo(function AmbienceAudioController() {
  useAmbienceAudio()
  return null
})

const MusicAudioController = memo(function MusicAudioController() {
  useMusicPlayer()
  return null
})

export const AudioController = memo(function AudioController() {
  return <><AmbienceAudioController /><MusicAudioController /></>
})
