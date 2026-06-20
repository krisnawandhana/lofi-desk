import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { deleteMusicFile, saveMusicFile } from '../lib/music-library'

export type MusicTrack = {
  id: string
  title: string
  artist: string
  source: 'builtin' | 'local' | 'url'
  src?: string
  storageKey?: string
  format?: 'mp3' | 'ogg' | 'wav'
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'nebulite-kyoto', title: 'Kyoto', artist: 'Nebulite', source: 'builtin', src: '/audio/music/Nebulite - Kyoto (freetouse.com).mp3', format: 'mp3' },
  { id: 'moavii-warm-cup', title: 'Warm Cup of Coffee', artist: 'Moavii', source: 'builtin', src: '/audio/music/Moavii - Warm Cup of Coffe (freetouse.com).mp3', format: 'mp3' },
  { id: 'massobeats-peach-prosecco', title: 'Peach Prosecco', artist: 'massobeats', source: 'builtin', src: '/audio/music/massobeats - peach prosecco (freetouse.com).mp3', format: 'mp3' },
  { id: 'lukrembo-rainy-day', title: 'Rainy Day', artist: 'Lukrembo', source: 'builtin', src: '/audio/music/Lukrembo - Rainy Day (freetouse.com).mp3', format: 'mp3' },
  { id: 'lukrembo-affogato', title: 'Affogato', artist: 'Lukrembo', source: 'builtin', src: '/audio/music/Lukrembo - Affogato (freetouse.com).mp3', format: 'mp3' },
  { id: 'hazelwood-coming-of-age', title: 'Coming of Age', artist: 'Hazelwood', source: 'builtin', src: '/audio/music/Hazelwood - Coming Of Age (freetouse.com).mp3', format: 'mp3' },
  { id: 'avanti-time', title: 'Time', artist: 'Avanti', source: 'builtin', src: '/audio/music/Avanti - Time (freetouse.com).mp3', format: 'mp3' },
]

type MusicState = {
  customTracks: MusicTrack[]
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
  addLocalFiles: (files: File[]) => Promise<void>
  addUrlTrack: (title: string, url: string) => void
  removeCustomTrack: (id: string) => Promise<void>
  stop: () => void
}

export const getAllMusicTracks = (customTracks: MusicTrack[] = useMusicStore.getState().customTracks) => [
  ...MUSIC_TRACKS,
  ...customTracks,
]

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      customTracks: [],
      trackIndex: 0,
      volume: 0.45,
      isMuted: false,
      isPlaying: false,
      setTrack: (trackIndex) => set({
        trackIndex: Math.max(0, Math.min(getAllMusicTracks(get().customTracks).length - 1, trackIndex)),
      }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      toggleMuted: () => set((state) => ({ isMuted: !state.isMuted })),
      togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
      nextTrack: () => set((state) => ({
        trackIndex: (state.trackIndex + 1) % getAllMusicTracks(state.customTracks).length,
      })),
      previousTrack: () => set((state) => ({
        trackIndex: (state.trackIndex - 1 + getAllMusicTracks(state.customTracks).length) % getAllMusicTracks(state.customTracks).length,
      })),
      addLocalFiles: async (files) => {
        const imported: MusicTrack[] = []
        for (const file of files) {
          const id = crypto.randomUUID()
          const storageKey = `track-${id}`
          await saveMusicFile(storageKey, file)
          imported.push({
            id,
            title: file.name.replace(/\.[^.]+$/, ''),
            artist: 'Local file',
            source: 'local',
            storageKey,
            format: file.type.includes('ogg') || file.name.toLowerCase().endsWith('.ogg')
              ? 'ogg'
              : file.type.includes('wav') || file.name.toLowerCase().endsWith('.wav')
                ? 'wav'
                : 'mp3',
          })
        }
        set((state) => ({ customTracks: [...state.customTracks, ...imported] }))
      },
      addUrlTrack: (title, src) => set((state) => ({
        customTracks: [...state.customTracks, {
          id: crypto.randomUUID(),
          title: title.trim() || 'Online track',
          artist: 'Audio URL',
          source: 'url',
          src,
          format: new URL(src).pathname.toLowerCase().endsWith('.ogg')
            ? 'ogg'
            : new URL(src).pathname.toLowerCase().endsWith('.wav')
              ? 'wav'
              : 'mp3',
        }],
      })),
      removeCustomTrack: async (id) => {
        const state = get()
        const currentTrack = getAllMusicTracks(state.customTracks)[state.trackIndex]
        const removedTrack = state.customTracks.find((track) => track.id === id)
        if (removedTrack?.storageKey) await deleteMusicFile(removedTrack.storageKey)
        const customTracks = state.customTracks.filter((track) => track.id !== id)
        const remainingTracks = getAllMusicTracks(customTracks)
        const nextIndex = currentTrack.id === id
          ? 0
          : Math.max(0, remainingTracks.findIndex((track) => track.id === currentTrack.id))
        set({ customTracks, trackIndex: nextIndex, isPlaying: currentTrack.id === id ? false : state.isPlaying })
      },
      stop: () => set({ isPlaying: false }),
    }),
    {
      name: 'lofi-desk-music',
      version: 2,
      partialize: ({ customTracks, trackIndex, volume, isMuted }) => ({ customTracks, trackIndex, volume, isMuted }),
    },
  ),
)
