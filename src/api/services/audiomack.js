const API_BASE = 'https://api.audiomack.com/v1'

// OAuth 1.0a credentials (get these from https://developer.audiomack.com/)
// You need to register an application at https://developer.audiomack.com/ to get:
// - CONSUMER_KEY
// - CONSUMER_SECRET
// - ACCESS_TOKEN (optional, for authenticated requests)
// - ACCESS_TOKEN_SECRET (optional)

const CONSUMER_KEY = import.meta.env.VITE_AUDIOMACK_CONSUMER_KEY || ''
const CONSUMER_SECRET = import.meta.env.VITE_AUDIOMACK_CONSUMER_SECRET || ''

// In-memory cache for access tokens
const cache = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

function getCacheKey(endpoint) {
  return `${CONSUMER_KEY}:${endpoint}`
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

// OAuth 1.0a helper - create signed request
function createOAuthHeader(url, method = 'GET', params = {}) {
  // OAuth 1.0a parameters
  const oauth = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_token: '',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_nonce: Math.random().toString(36).substring(2, 20),
    oauth_version: '1.0',
    ...params,
  }

  // Create base string
  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(API_BASE + url),
    encodeURIComponent(
      Object.keys(oauth)
        .sort()
        .map((key) => `${key}=${encodeURIComponent(oauth[key])}`)
        .join('&')
    ),
  ].join('&')

  // Create signing key
  const signingKey = `${encodeURIComponent(CONSUMER_SECRET)}&${encodeURIComponent('')}`

  // Create signature
  // Note: In a real app, use the oauth_token from the access token flow
  const oauthSignature = ''
  // TODO: Implement proper HMAC-SHA1 signing with node crypto or browser crypto

  return `OAuth ${Object.keys(oauth)
    .sort()
    .map((key) => `${key}="${oauth[key]}"`)
    .join(', ')}`
}

// Check if we have consumer key configured
function isConfigured() {
  return !!CONSUMER_KEY && !!CONSUMER_SECRET
}

// GET request with OAuth
async function apiRequest(endpoint, options = {}) {
  if (!isConfigured()) {
    console.warn('Audiomack API not configured - set VITE_AUDIOMACK_CONSUMER_KEY and VITE_AUDIOMACK_CONSUMER_SECRET')
    return null
  }

  const url = `${API_BASE}${endpoint}`
  const method = options.method || 'GET'

  try {
    const header = createOAuthHeader(endpoint, method)
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: header,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `API Error: ${response.status} - ${errorData.message || response.statusText}`
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Audiomack API error:', error)
    throw error
  }
}

// Public endpoints (no auth token required, just consumer key)

// Search songs, albums, artists
async function search(query, options = {}) {
  const { limit = 20, show = 'music', genre, sort } = options
  const params = new URLSearchParams({
    q: query,
    show,
    limit: limit.toString(),
    ...(genre && { genre }),
    ...(sort && { sort }),
  })
  return apiRequest(`/search?${params}`)
}

// Most recent music
async function getRecent(options = {}) {
  const { limit = 20, genre } = options
  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(genre && { genre }),
  })
  return apiRequest(`/music/recent?${params}`)
}

// Trending music
async function getTrending(options = {}) {
  const { limit = 20, genre } = options
  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(genre && { genre }),
  })
  return apiRequest(`/music/trending?${params}`)
}

// Genre-specific most recent
async function getGenreRecent(genre, options = {}) {
  const { limit = 20 } = options
  const params = new URLSearchParams({
    limit: limit.toString(),
  })
  return apiRequest(`/music/${genre}/recent?${params}`)
}

// Genre-specific trending
async function getGenreTrending(genre, options = {}) {
  const { limit = 20 } = options
  const params = new URLSearchParams({
    limit: limit.toString(),
  })
  return apiRequest(`/music/${genre}/trending?${params}`)
}

// Artist endpoints

// Artist information
async function getArtist(slug) {
  return apiRequest(`/artist/${slug}`)
}

// Artist uploads
async function getArtistUploads(slug, options = {}) {
  const { limit = 20, page = 1 } = options
  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(page > 1 && { 'page[]': page.toString() }),
  })
  return apiRequest(`/artist/${slug}/uploads?${params}`)
}

// Artist favorites
async function getArtistFavorites(slug, options = {}) {
  const { limit = 20, show = 'music', page } = options
  const params = new URLSearchParams({
    limit: limit.toString(),
    show,
    ...(page > 1 && { 'page[]': page.toString() }),
  })
  return apiRequest(`/artist/${slug}/favorites?${params}`)
}

// Play a track (requires proper OAuth access token)
// Note: The streaming URL is returned in the response, needs session parameter
async function playTrack(trackId, options = {}) {
  const { session, hq } = options
  const params = new URLSearchParams()
  if (session) params.append('session', session)
  if (hq) params.append('hq', '1')
  return apiRequest(`/music/${trackId}/play?${params}`)
}

// Playlist endpoints

// Create playlist (requires authenticated user)
async function createPlaylist(options = {}) {
  const { title, genre, private: isPrivate, music_id } = options
  const formData = new FormData()
  formData.append('title', title)
  if (genre) formData.append('genre', genre)
  if (isPrivate !== undefined) formData.append('private', isPrivate.toString())
  if (music_id) formData.append('music_id', music_id)

  return fetch(`${API_BASE}/playlist`, {
    method: 'POST',
    headers: {
      Authorization: createOAuthHeader('/playlist', 'POST'),
    },
    body: formData,
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new Error(data.message || 'Failed to create playlist')
      })
    }
    return res.json()
  })
}

// Add song to playlist
async function addSongToPlaylist(playlistId, musicIds) {
  const formData = new FormData()
  musicIds.forEach((id) => formData.append('music_id', id))

  return fetch(`${API_BASE}/playlist/${playlistId}/track`, {
    method: 'POST',
    headers: {
      Authorization: createOAuthHeader(`/playlist/${playlistId}/track`, 'POST'),
    },
    body: formData,
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new Error(data.message || 'Failed to add song to playlist')
      })
    }
    return res.json()
  })
}

// Get playlist info
async function getPlaylist(idOrSlug, options = {}) {
  const { artistSlug } = options
  const slug = artistSlug ? `${artistSlug}/${idOrSlug}` : idOrSlug
  const params = new URLSearchParams(options.fields || '')
  return apiRequest(`/playlist/${slug}?${params}`)
}

// User endpoints

// User details (requires auth)
async function getUser() {
  return apiRequest(`/user`)
}

// User playlists
async function getUserPlaylists() {
  return apiRequest(`/user/playlists`)
}

// User favorites
async function getUserFavorites() {
  return apiRequest(`/user/favorites`)
}

// Stats token (for listening analytics)
async function getStatsToken(deviceId, musicId) {
  const params = new URLSearchParams({
    device: deviceId || '',
    music_id: musicId || '',
  })
  return apiRequest(`/music/stats/token?${params}`)
}

// Genres available
async function getGenres() {
  // Audiomack has specific genres: rap, electronic, rock, pop, other
  return {
    results: [
      { id: 'rap', name: 'Hip-Hop/Rap' },
      { id: 'electronic', name: 'Electronic' },
      { id: 'rock', name: 'Rock' },
      { id: 'pop', name: 'Pop' },
      { id: 'other', name: 'Other' },
    ],
  }
}

// Export all services
export const audiomackService = {
  search,
  getRecent,
  getTrending,
  getGenreRecent,
  getGenreTrending,
  getArtist,
  getArtistUploads,
  getArtistFavorites,
  playTrack,
  createPlaylist,
  addSongToPlaylist,
  getPlaylist,
  getUser,
  getUserPlaylists,
  getUserFavorites,
  getStatsToken,
  getGenres,
  isConfigured,
}

// For debugging - check if configured
console.log('Audiomack API configured:', audiomackService.isConfigured())