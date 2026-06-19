import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Ambience = 'rain' | 'lofi' | 'fireplace' | 'cafe' | 'ocean' | 'coffee' | 'none'

export const AMBIENCE_TRACKS: Record<Exclude<Ambience, 'none'>, { src: string; loop: boolean }> = {
  rain: { src: '/audio/ambience/rainy.mp3', loop: true },
  lofi: { src: '/audio/ambience/lofi-beat.mp3', loop: true },
  fireplace: { src: '/audio/ambience/fireplace.mp3', loop: true },
  cafe: { src: '/audio/ambience/cafe-ambient.mp3', loop: true },
  ocean: { src: '/audio/ambience/ocean-waves.mp3', loop: true },
  coffee: { src: '/audio/ambience/coffee-pouring.mp3', loop: false },
}

type AmbienceState = {
  ambience: Ambience
  volume: number
  isMuted: boolean
  isPlaying: boolean
  setAmbience: (ambience: Ambience) => void
  setVolume: (volume: number) => void
  toggleMuted: () => void
  togglePlaying: () => void
  stop: () => void
}

export const useAmbienceStore = create<AmbienceState>()(
  persist(
    (set) => ({
      ambience: 'rain',
      volume: 0.55,
      isMuted: false,
      isPlaying: false,
      setAmbience: (ambience) => set((state) => ({
        ambience,
        isPlaying: ambience === 'none' ? false : state.isPlaying,
      })),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      toggleMuted: () => set((state) => ({ isMuted: !state.isMuted })),
      togglePlaying: () => set((state) => ({
        isPlaying: state.ambience === 'none' ? false : !state.isPlaying,
      })),
      stop: () => set({ isPlaying: false }),
    }),
    {
      name: 'lofi-desk-ambience',
      version: 1,
      partialize: ({ ambience, volume, isMuted }) => ({ ambience, volume, isMuted }),
    },
  ),
)
