import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MusicTrack = {
  title: string
  artist: string
  src: string
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { title: 'Kyoto', artist: 'Nebulite', src: '/audio/music/Nebulite - Kyoto (freetouse.com).mp3' },
  { title: 'Warm Cup of Coffee', artist: 'Moavii', src: '/audio/music/Moavii - Warm Cup of Coffe (freetouse.com).mp3' },
  { title: 'Peach Prosecco', artist: 'massobeats', src: '/audio/music/massobeats - peach prosecco (freetouse.com).mp3' },
  { title: 'Rainy Day', artist: 'Lukrembo', src: '/audio/music/Lukrembo - Rainy Day (freetouse.com).mp3' },
  { title: 'Affogato', artist: 'Lukrembo', src: '/audio/music/Lukrembo - Affogato (freetouse.com).mp3' },
  { title: 'Coming of Age', artist: 'Hazelwood', src: '/audio/music/Hazelwood - Coming Of Age (freetouse.com).mp3' },
  { title: 'Time', artist: 'Avanti', src: '/audio/music/Avanti - Time (freetouse.com).mp3' },
]

type MusicState = {
  trackIndex: number
  volume: number
  isMuted: boolean
  isPlaying: boolean
  setTrack: (index: number) => void
  setVolume: (volume: number) => void
  toggleMuted: () => void
  togglePlaying: () => void
  nextTrack: () => void
  previousTrack: () => void
  stop: () => void
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      trackIndex: 0,
      volume: 0.45,
      isMuted: false,
      isPlaying: false,
      setTrack: (trackIndex) => set({
        trackIndex: Math.max(0, Math.min(MUSIC_TRACKS.length - 1, trackIndex)),
      }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      toggleMuted: () => set((state) => ({ isMuted: !state.isMuted })),
      togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
      nextTrack: () => set((state) => ({
        trackIndex: (state.trackIndex + 1) % MUSIC_TRACKS.length,
      })),
      previousTrack: () => set((state) => ({
        trackIndex: (state.trackIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length,
      })),
      stop: () => set({ isPlaying: false }),
    }),
    {
      name: 'lofi-desk-music',
      version: 1,
      partialize: ({ trackIndex, volume, isMuted }) => ({ trackIndex, volume, isMuted }),
    },
  ),
)
