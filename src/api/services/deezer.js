const API_BASE = 'https://api.deezer.com'

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(method, url) {
  return `${method}:${url}`
}

function getFromCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Clean old cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
}, CACHE_TTL)

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const method = options.method || 'GET'
  const cacheKey = getCacheKey(method, url)

  // Check cache for GET requests
  if (method === 'GET') {
    const cached = getFromCache(cacheKey)
    if (cached) return cached
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - wait and retry
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return request(endpoint, options)
      }
      if (response.status >= 500) {
        throw new Error(`Server error (${response.status})`)
      }
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()

    // Cache successful GET responses
    if (method === 'GET') {
      setCache(cacheKey, data)
    }

    return data
  } catch (error) {
    clearTimeout(timeout)
    if (error.name === 'AbortError') {
      throw new Error('Request timed out')
    }
    throw error
  }
}

export const apiService = {
  // Search
  async searchSongs(query, limit = 10) {
    const data = await request(`/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    return {
      results: data.data || [],
      total: data.total || 0,
    }
  },

  async searchArtists(query, limit = 10) {
    const data = await request(`/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`)
    return {
      results: data.data || [],
      total: data.total || 0,
    }
  },

  async searchAlbums(query, limit = 10) {
    const data = await request(`/search/album?q=${encodeURIComponent(query)}&limit=${limit}`)
    return {
      results: data.data || [],
      total: data.total || 0,
    }
  },

  // Track
  async getTrack(trackId) {
    return request(`/track/${trackId}`)
  },

  async getTrackPreview(trackId) {
    const track = await request(`/track/${trackId}`)
    return {
      title: track.title,
      artist: track.artist?.name || 'Unknown',
      preview: track.preview,
      duration: track.duration,
      album: track.album?.title,
      artwork: track.album?.cover_medium,
    }
  },

  // Artist
  async getArtist(artistId) {
    return request(`/artist/${artistId}`)
  },

  async getArtistTopTracks(artistId) {
    return request(`/artist/${artistId}/top`)
  },

  async getArtistAlbums(artistId) {
    return request(`/artist/${artistId}/albums`)
  },

  // Album
  async getAlbum(albumId) {
    return request(`/album/${albumId}`)
  },

  async getAlbumTracks(albumId) {
    return request(`/album/${albumId}/tracks`)
  },

  // Artwork
  getArtworkUrl(coverId, size = 'medium') {
    const sizes = {
      small: '18x18',
      medium: '250x250',
      large: '500x500',
      xl: '1000x1000',
    }
    const s = sizes[size] || sizes.medium
    return `https://e-cdns-images.dzcdn.net/images/cover/${coverId}/${s}.jpg`
  },

  // Chart
  async getChart(limit = 10) {
    return request(`/chart/title?limit=${limit}`)
  },

  // Genre
  async getGenres() {
    return request('/genre')
  },

  // Radio
  async getGenreRadio(genreId) {
    return request(`/genre/${genreId}/tracks`)
  },

  // Clear cache
  clearCache() {
    cache.clear()
  },
}
