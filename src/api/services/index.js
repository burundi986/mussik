import { apiService } from './deezer'
import { audiomackService } from './audiomack'
import { audiusService, getStreamUrl as getAudiusStreamUrl } from './audius'

export { apiService, audiomackService, audiusService }

export function useApi() {
  return {
    // Deezer API functions
    searchSongs: (query, limit) => apiService.searchSongs(query, limit),
    searchArtists: (query, limit) => apiService.searchArtists(query, limit),
    searchAlbums: (query, limit) => apiService.searchAlbums(query, limit),
    getTrackPreview: (id) => apiService.getTrackPreview(id),
    getArtist: (id) => apiService.getArtist(id),
    getArtistTopTracks: (id) => apiService.getArtistTopTracks(id),
    getArtistAlbums: (id) => apiService.getArtistAlbums(id),
    getAlbum: (id) => apiService.getAlbum(id),
    getAlbumTracks: (id) => apiService.getAlbumTracks(id),
    getArtworkUrl: (id, size) => apiService.getArtworkUrl(id, size),
    getChart: (limit) => apiService.getChart(limit),
    getGenres: () => apiService.getGenres(),
    getGenreRadio: (id) => apiService.getGenreRadio(id),

    // Audiomack API functions
    searchAudiomack: (query, options) => audiomackService.search(query, options),
    getRecent: (options) => audiomackService.getRecent(options),
    getTrending: (options) => audiomackService.getTrending(options),
    getGenreRecent: (genre, options) => audiomackService.getGenreRecent(genre, options),
    getGenreTrending: (genre, options) => audiomackService.getGenreTrending(genre, options),
    getArtistUploads: (slug, options) => audiomackService.getArtistUploads(slug, options),
    getArtistFavorites: (slug, options) => audiomackService.getArtistFavorites(slug, options),
    playTrack: (trackId, options) => audiomackService.playTrack(trackId, options),
    createPlaylist: (options) => audiomackService.createPlaylist(options),
    addSongToPlaylist: (playlistId, musicIds) => audiomackService.addSongToPlaylist(playlistId, musicIds),
    getUser: () => audiomackService.getUser(),
    getUserPlaylists: () => audiomackService.getUserPlaylists(),
    getUserFavorites: () => audiomackService.getUserFavorites(),
    getStatsToken: (deviceId, musicId) => audiomackService.getStatsToken(deviceId, musicId),
    isAudiomackConfigured: () => audiomackService.isConfigured(),

    // Audius API functions
    searchAudius: (query, options) => audiusService.searchAll(query, options),
    searchAudiusTracks: (query, options) => audiusService.searchTracks(query, options),
    searchAudiusUsers: (query, options) => audiusService.searchUsers(query, options),
    searchAudiusPlaylists: (query, options) => audiusService.searchPlaylists(query, options),
    getAudiusTrack: (id) => audiusService.getTrack(id),
    getAudiusTrendingTracks: (options) => audiusService.getTrendingTracks(options),
    getAudiusTrendingPlaylists: (options) => audiusService.getTrendingPlaylists(options),
    getAudiusUser: (handle) => audiusService.getUserByHandle(handle),
    getAudiusUserTracks: (handle, options) => audiusService.getUserTracks(handle, options),
    getAudiusPlaylist: (id) => audiusService.getPlaylist(id),
    getAudiusStreamUrl: (id) => getAudiusStreamUrl(id),
    isAudiusConfigured: () => audiusService.isConfigured(),

    // Audiomack endpoints that share a name with a Deezer one are exposed
    // explicitly rather than silently overwriting it.
    getAudiomackArtist: (slug) => audiomackService.getArtist(slug),
    getAudiomackGenres: () => audiomackService.getGenres(),
    getAudiomackPlaylist: (idOrSlug, options) => audiomackService.getPlaylist(idOrSlug, options),
  }
}