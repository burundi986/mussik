import { useState } from 'react'
import { useStore } from '../../store'
import { Icon } from './Icon'
import { cn, getArtwork, getArtistName } from '../../utils/helpers'

export function MusicCard({
  data,
  type = 'track',
  onPlay,
  size = 'md',
}) {
  const { addToPlaylist, currentTrack } = useStore()
  const [liked, setLiked] = useState(false)
  const [showActions, setShowActions] = useState(false)

  // Only tracks carry a playable audio source. Artist and album cards have no
  // stream URL, so sending them to the player used to leave the player blank.
  const isPlayable = type === 'track'
  const isCurrent = isPlayable && currentTrack?.id === data.id
  const isPlaying = isCurrent && useStore.getState().isPlaying

  const handlePlay = () => {
    if (!isPlayable) return
    if (onPlay) {
      onPlay(data)
    } else {
      const store = useStore.getState()
      if (store.currentTrack?.id === data.id) {
        store.togglePlay()
      } else {
        store.playTrack(data, [data], 0)
      }
    }
  }

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleAddToPlaylist = () => {
    addToPlaylist(data)
  }

  const artworkUrl = getArtwork(data)
  const title = type === 'artist' ? data.name : data.title
  const subtitle =
    type === 'artist' ? 'Artist' : type === 'album' ? 'Album' : getArtistName(data)

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
        {isPlayable && (
          <div className={cn('music-card-overlay', showActions && 'music-card-overlay-visible')}>
            <button
              className={cn('music-card-action-btn', isPlaying && 'music-card-action-btn-active')}
              onClick={handlePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
            >
              <Icon name={isPlaying ? 'pause' : 'play'} size={20} />
            </button>
          </div>
        )}
        {isPlaying && <div className="music-card-playing-indicator" />}
      </div>
      <div className="music-card-info">
        <p className="music-card-title">{title}</p>
        <p className="music-card-subtitle">{subtitle}</p>
      </div>
      {data.source && <span className="music-card-source">{data.source}</span>}
      <div className={cn('music-card-actions', showActions && 'music-card-actions-visible')}>
        {isPlayable && (
          <button className="music-card-action" onClick={handlePlay} title={isPlaying ? 'Pause' : 'Play'}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={16} />
          </button>
        )}
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
