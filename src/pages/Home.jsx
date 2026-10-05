import { useCallback, useEffect, useState } from 'react'
import { useStore } from '../store'
import { audiusService } from '../api/services/audius'
import { HorizontalCarousel } from '../components/ui/HorizontalCarousel'
import { ErrorState } from '../components/ui/ApiStates'
import { Icon } from '../components/ui/Icon'

export default function Home() {
  const { playTrack } = useStore()
  const [tracks, setTracks] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [trendingTracks, trendingPlaylists] = await Promise.all([
        audiusService.getTrendingTracks({ limit: 20 }),
        audiusService.getTrendingPlaylists({ limit: 10 }),
      ])
      setTracks(trendingTracks)
      setPlaylists(trendingPlaylists)
    } catch (err) {
      setError(err.message || 'Could not load music from Audius')
      setTracks([])
      setPlaylists([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handlePlay = (track, queue, index) => playTrack(track, queue, index)

  return (
    <div className="page page-home">
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="home-hero-eyebrow">Powered by Audius</p>
          <h1 className="home-hero-title">Stream full tracks, not 30-second previews</h1>
          <p className="home-hero-subtitle">
            Every track below is a complete Audius stream. Hit play and the queue
            keeps going.
          </p>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <Icon name="music" size={44} color="#aa3bff" />
        </div>
      </section>

      {error && !loading && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <>
          <HorizontalCarousel
            title="Trending on Audius"
            items={tracks}
            type="track"
            loading={loading}
            onPlay={handlePlay}
            emptyMessage="No trending tracks right now."
          />

          <HorizontalCarousel
            title="Trending playlists"
            items={playlists}
            type="album"
            loading={loading}
            emptyMessage="No trending playlists right now."
          />
        </>
      )}
    </div>
  )
}