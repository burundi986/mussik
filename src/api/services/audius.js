const API_BASE = 'https://api.audius.co/v1'

// Credentials from https://api.audius.co/plans or audius.co/settings
// - API_KEY is sent as `Authorization: Bearer <key>` and only raises rate limits
// - VITE_AUDIUS_API_SECRET signs write requests (upload/favorite/repost). No write
//   endpoint is wired up here because signing would require shipping the secret to
//   the renderer, so this service is read-only by design.
const API_KEY = import.meta.env.VITE_AUDIUS_API_KEY || ''

// Audius asks every production client to identify itself on each request
const APP_NAME = import.meta.env.VITE_AUDIUS_APP_NAME || 'musiik'

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_RATE_LIMIT_RETRIES = 2

function getCacheKey(url) {
  return url
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

function buildUrl(endpoint, params = {}) {
  const search = new URLSearchParams({ app_name: APP_NAME })
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  return `${API_BASE}${endpoint}?${search.toString()}`
}

async function readApiError(response) {
  try {
    const body = await response.json()
    return typeof body?.error === 'string' ? body.error : null
  } catch {
    return null
  }
}

async function request(endpoint, options = {}) {
  const { params = {}, timeout = 10000, retries = 0 } = options
  const url = buildUrl(endpoint, params)
  const cached = getFromCache(getCacheKey(url))
  if (cached) return cached

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const headers = { Accept: 'application/json' }
    if (API_KEY) {
      headers.Authorization = `Bearer ${API_KEY}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (response.status === 429 && retries < MAX_RATE_LIMIT_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return request(endpoint, { ...options, retries: retries + 1 })
    }

    if (!response.ok) {
      // Unknown ids come back as 400 {"error":"invalid trackId"} rather than 404
      const apiError = await readApiError(response)
      if (response.status === 404 || /invalid \w*id/i.test(apiError || '')) {
        throw new Error('Not found')
      }
      if (response.status >= 500) {
        throw new Error(`Server error (${response.status})`)
      }
      throw new Error(apiError ? `API Error: ${apiError}` : `API Error: ${response.status}`)
    }

    const payload = await response.json()
    const data = payload.data
    setCache(getCacheKey(url), data)
    return data
  } catch (error) {
    clearTimeout(timer)
    if (error.name === 'AbortError') {
      throw new Error('Request timed out')
    }
    throw error
  }
}

const ARTWORK_SIZES = ['1000x1000', '480x480', '150x150']

function pickArtwork(node) {
  if (!node) return null
  for (const size of ARTWORK_SIZES) {
    if (node[size]) return node[size]
  }
  return null
}

export function getStreamUrl(trackId) {
  return buildUrl(`/tracks/${trackId}/stream`)
}

function getPreviewUrl(trackId) {
  return buildUrl(`/tracks/${trackId}/preview`)
}

function normalizeTrack(track) {
  if (!track) return null
  return {
    id: track.id,
    title: track.title,
    artist: track.user?.name || 'Unknown Artist',
    artistHandle: track.user?.handle,
    artwork: pickArtwork(track.artwork),
    duration: track.duration,
    genre: track.genre,
    playCount: track.play_count || 0,
    favoriteCount: track.favorite_count || 0,
    repostCount: track.repost_count || 0,
    streamUrl: track.is_streamable === false ? null : getStreamUrl(track.id),
    previewUrl: track.preview_cid ? getPreviewUrl(track.id) : null,
    permalink: track.permalink,
  }
}

function normalizeUser(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    artwork: pickArtwork(user.profile_picture),
    followers: user.follower_count || 0,
    trackCount: user.track_count || 0,
    isVerified: !!user.is_verified,
    permalink: user.handle ? `https://audius.co/${user.handle}` : null,
  }
}

function normalizePlaylist(playlist) {
  if (!playlist) return null
  return {
    id: playlist.id,
    // Audius names this field playlist_name, not title
    title: playlist.playlist_name || 'Untitled playlist',
    description: playlist.description,
    artwork: pickArtwork(playlist.artwork),
    artist: playlist.user?.name || 'Unknown Artist',
    artistHandle: playlist.user?.handle,
    trackCount: playlist.track_count ?? playlist.tracks?.length ?? 0,
    playCount: playlist.total_play_count || 0,
    isAlbum: !!playlist.is_album,
    permalink: playlist.permalink,
  }
}

function normalizeTrackList(tracks) {
  return (tracks || []).map(normalizeTrack).filter(Boolean)
}

export const audiusService = {
  isConfigured() {
    return !!API_KEY
  },

  async searchTracks(query, options = {}) {
    const data = await request('/tracks/search', {
      params: { query, limit: options.limit ?? 20, genre: options.genre },
    })
    return { results: normalizeTrackList(data), total: data.length }
  },

  async searchUsers(query, options = {}) {
    const data = await request('/users/search', {
      params: { query, limit: options.limit ?? 10 },
    })
    return { results: (data || []).map(normalizeUser).filter(Boolean), total: data?.length || 0 }
  },

  async searchPlaylists(query, options = {}) {
    const data = await request('/playlists/search', {
      params: { query, limit: options.limit ?? 10 },
    })
    return { results: (data || []).map(normalizePlaylist).filter(Boolean), total: data?.length || 0 }
  },

  async searchAll(query, options = {}) {
    const [tracks, users, playlists] = await Promise.all([
      this.searchTracks(query, { limit: options.trackLimit ?? 10 }),
      this.searchUsers(query, { limit: options.limit ?? 5 }),
      this.searchPlaylists(query, { limit: options.limit ?? 5 }),
    ])
    return {
      tracks: tracks.results,
      users: users.results,
      playlists: playlists.results,
    }
  },

  async getTrack(trackId) {
    return normalizeTrack(await request(`/tracks/${trackId}`))
  },

  async getTrendingTracks(options = {}) {
    // There is no /tracks/trending/genre route in the current API - that path
    // falls through to the /tracks/{id} route and fails with "invalid trackId".
    // Genre filtering is a query param on /tracks/trending.
    const data = await request('/tracks/trending', {
      params: { genre: options.genre, limit: options.limit ?? 20, time: options.time },
    })
    return normalizeTrackList(data)
  },

  async getTrendingPlaylists(options = {}) {
    const data = await request('/playlists/trending', {
      params: { limit: options.limit ?? 10 },
    })
    return (data || []).map(normalizePlaylist).filter(Boolean)
  },

  async getUserByHandle(handle) {
    return normalizeUser(await request(`/users/handle/${handle}`))
  },

  async getUserTracks(handle, options = {}) {
    const data = await request(`/users/handle/${handle}/tracks`, {
      params: { limit: options.limit ?? 20 },
    })
    return normalizeTrackList(data)
  },

  async getPlaylist(playlistId) {
    return normalizePlaylist(await request(`/playlists/${playlistId}`))
  },

  clearCache() {
    cache.clear()
  },
}