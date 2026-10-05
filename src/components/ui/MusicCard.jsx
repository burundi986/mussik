import { useState } from 'react'
import { useStore } from '../../store'
import { Icon } from './Icon'
import { cn } from '../../utils/helpers'

export function MusicCard({
  data,
  type = 'track',
  onPlay,
  size = 'md',
}) {
  const { playlist, addToPlaylist, togglePlay, currentTrack } = useStore()
  const [liked, setLiked] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const isPlaying = currentTrack?.id === data.id && useStore.getState().isPlaying

  const handlePlay = () => {
    if (onPlay) {
      onPlay(data)
    } else {
      useStore.getState().setCurrentTrack(data)
      useStore.getState().togglePlay()
    }
  }

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleAddToPlaylist = () => {
    addToPlaylist(data)
  }

  const artworkUrl = type === 'artist'
    ? `https://e-cdns-images.dzcdn.net/images/artist/${data.id}/250x250-000000-80-0-0.jpg`
    : data.album?.cover_medium || data.cover_medium

  const title = type === 'artist' ? data.name : type === 'album' ? data.title : data.title
  const subtitle = type === 'artist' ? 'Artist' : type === 'album' ? 'Album' : data.artist?.name

  return (
    <div
      className={cn('music-card', `music-card-${size}`, isPlaying && 'music-card-playing')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="music-card-artwork">
        {artworkUrl ? (
          <img src={artworkUrl} alt={title} className="music-card-image" />
        ) : (
          <div className="music-card-image-placeholder">
            <Icon name="music" size={size === 'lg' ? 32 : 20} />
          </div>
        )}
        <div className={cn('music-card-overlay', showActions && 'music-card-overlay-visible')}>
          <button
            className={cn('music-card-action-btn', isPlaying && 'music-card-action-btn-active')}
            onClick={handlePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <Icon name={isPlaying ? 'pause' : 'play'} size={20} />
          </button>
        </div>
        {isPlaying && <div className="music-card-playing-indicator" />}
      </div>
      <div className="music-card-info">
        <p className="music-card-title">{title}</p>
        <p className="music-card-subtitle">{subtitle}</p>
      </div>
      <div className={cn('music-card-actions', showActions && 'music-card-actions-visible')}>
        <button className="music-card-action" onClick={handlePlay} title="Play">
          <Icon name={isPlaying ? 'pause' : 'play'} size={16} />
        </button>
        <button className="music-card-action" onClick={handleLike} title="Like">
          <Icon name="heart" size={16} />
        </button>
        <button className="music-card-action" onClick={handleAddToPlaylist} title="Add to playlist">
          <Icon name="playlist" size={16} />
        </button>
        <button className="music-card-action" title="Share">
          <Icon name="more" size={16} />
        </button>
      </div>
      {liked && <div className="music-card-like-badge"><Icon name="heart" size={12} /></div>}
    </div>
  )
}
