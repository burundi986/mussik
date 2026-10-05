export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Results come from several providers with different field names, so artwork
// and audio are resolved by shape rather than by a hardcoded CDN.
export function getArtwork(item) {
  if (!item) return null
  return (
    item.image ||
    item.artwork ||
    item.album?.cover_medium ||
    item.cover_medium ||
    item.picture_medium ||
    item.picture_big ||
    item.picture ||
    null
  )
}

export function getAudioSource(track) {
  if (!track) return null
  return track.streamUrl || track.preview || track.audioUrl || null
}

export function getArtistName(item) {
  if (!item) return 'Unknown Artist'
  if (typeof item.artist === 'string') return item.artist
  return item.artist?.name || item.artistName || 'Unknown Artist'
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
