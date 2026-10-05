import { useState, useCallback } from 'react'
import { apiService } from './deezer'

export function useApiQuery(queryFn, query, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { retryCount = 3, onSuccess, onError } = options

  const execute = useCallback(
    async (_signal) => {
      if (!query) {
        setData(null)
        setError(null)
        return null
      }

      setLoading(true)
      setError(null)

      let attempts = 0
      while (attempts < retryCount) {
        try {
          const result = await queryFn(query)
          setData(result)
          onSuccess?.(result)
          setLoading(false)
          return result
        } catch (err) {
          attempts++
          if (attempts >= retryCount) {
            setError(err.message || 'An error occurred')
            onError?.(err)
            setLoading(false)
            throw err
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
        }
      }
    },
    [query, queryFn, retryCount, onSuccess, onError]
  )

  const refetch = useCallback(() => execute(), [execute])

  return { data, loading, error, refetch }
}

export function useSearchSongs(query, options) {
  return useApiQuery(apiService.searchSongs, query, options)
}

export function useSearchArtists(query, options) {
  return useApiQuery(apiService.searchArtists, query, options)
}

export function useSearchAlbums(query, options) {
  return useApiQuery(apiService.searchAlbums, query, options)
}

export function useTrackPreview(trackId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    if (!trackId) {
      setData(null)
      return null
    }
    setLoading(true)
    setError(null)
    try {
      const result = await apiService.getTrackPreview(trackId)
      setData(result)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message || 'Failed to load track')
      setLoading(false)
      throw err
    }
  }, [trackId])

  const refetch = useCallback(() => execute(), [execute])

  return { data, loading, error, refetch }
}

export function useArtist(artistId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    if (!artistId) {
      setData(null)
      return null
    }
    setLoading(true)
    setError(null)
    try {
      const result = await apiService.getArtist(artistId)
      setData(result)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message || 'Failed to load artist')
      setLoading(false)
      throw err
    }
  }, [artistId])

  const refetch = useCallback(() => execute(), [execute])

  return { data, loading, error, refetch }
}

export function useAlbum(albumId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    if (!albumId) {
      setData(null)
      return null
    }
    setLoading(true)
    setError(null)
    try {
      const result = await apiService.getAlbum(albumId)
      setData(result)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message || 'Failed to load album')
      setLoading(false)
      throw err
    }
  }, [albumId])

  const refetch = useCallback(() => execute(), [execute])

  return { data, loading, error, refetch }
}
