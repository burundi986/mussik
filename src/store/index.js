import { create } from 'zustand'

export const useStore = create((set) => ({
  sidebarOpen: true,
  currentTrack: null,
  isPlaying: false,
  playlist: [],
  searchQuery: '',
  queue: [],
  queueIndex: -1,
  shuffleEnabled: false,
  repeatMode: 'none',
  volume: 0.7,
  isMuted: false,
  audioElement: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addToPlaylist: (track) => set((state) => ({ playlist: [...state.playlist, track] })),
  setQueue: (queue) => set({ queue }),
  setQueueIndex: (index) => set({ queueIndex: index }),
  toggleShuffle: () => set((state) => ({ shuffleEnabled: !state.shuffleEnabled })),
  setRepeatMode: (mode) => set({ repeatMode: mode }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setAudioElement: (el) => set({ audioElement: el }),
  playTrack: (track, queue = [], index = 0) => set({
    currentTrack: track,
    queue,
    queueIndex: index,
    isPlaying: true,
  }),
  nextTrack: () => set((state) => {
    const { queue, queueIndex, shuffleEnabled } = state
    if (queue.length === 0) return { isPlaying: false }
    let nextIdx
    if (shuffleEnabled) {
      nextIdx = Math.floor(Math.random() * queue.length)
    } else {
      nextIdx = (queueIndex + 1) % queue.length
    }
    return { queueIndex: nextIdx, currentTrack: queue[nextIdx], isPlaying: true }
  }),
  prevTrack: () => set((state) => {
    const { queue, queueIndex } = state
    if (queue.length === 0) return { isPlaying: false }
    const prevIdx = queueIndex > 0 ? queueIndex - 1 : queue.length - 1
    return { queueIndex: prevIdx, currentTrack: queue[prevIdx], isPlaying: true }
  }),
  addToQueue: (track) => set((state) => ({
    queue: [...state.queue, track],
  })),
  removeFromQueue: (index) => set((state) => ({
    queue: state.queue.filter((_, i) => i !== index),
  })),
  clearQueue: () => set({ queue: [], queueIndex: -1, isPlaying: false }),
}))
