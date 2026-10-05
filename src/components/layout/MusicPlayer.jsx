import { useRef, useEffect, useCallback, useState } from 'react'
import { useStore } from '../../store'
import { Icon } from '../ui/Icon'
import { cn } from '../../utils/helpers'
import { formatTime } from '../../utils/helpers'

export function MusicPlayer() {
  const audioRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    queue,
    queueIndex,
    shuffleEnabled,
    toggleShuffle,
    repeatMode,
    setRepeatMode,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    playTrack,
  } = useStore()

  useEffect(() => {
    if (!audioRef.current || !currentTrack?.preview) return
    audioRef.current.src = currentTrack.preview
    audioRef.current.load()
    setIsLoading(true)
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    }
  }, [currentTrack?.id, currentTrack?.preview])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      setIsLoading(false)
    }
    const onEnded = () => {
      setIsLoading(false)
      if (repeatMode === 'repeat-one') {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        nextTrack()
      }
    }
    const onError = () => {
      setIsLoading(false)
      nextTrack()
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [])

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return
    if (!isPlaying) {
      playTrack(currentTrack, queue, queueIndex)
    } else {
      togglePlay()
    }
  }, [currentTrack, isPlaying, queue, queueIndex, playTrack, togglePlay])

  const handlePrev = useCallback(() => {
    if (queue.length > 0 && queueIndex >= 0) {
      prevTrack()
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [queue, queueIndex, prevTrack])

  const handleNext = useCallback(() => {
    nextTrack()
  }, [nextTrack])

  const handleSeek = useCallback((e) => {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const time = pos * duration
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [duration])

  const handleVolumeChange = useCallback((e) => {
    if (!audioRef.current) return
    const vol = Number(e.target.value)
    audioRef.current.volume = vol
    setVolume(vol)
  }, [setVolume])

  const handleToggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      toggleMute()
    }
  }, [isMuted, toggleMute])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const currentVolume = isMuted ? 0 : volume

  if (!currentTrack) {
    return (
      <div className="music-player">
        <div className="music-player-left">
          <div className="player-placeholder">
            <span className="player-heart"><Icon name="heart" size={20} /></span>
            <span className="player-placeholder-text">No track selected</span>
          </div>
        </div>
        <div className="music-player-center">
          <div className="player-controls">
            <button className="player-btn" title="Shuffle">
              <Icon name="shuffle" size={18} />
            </button>
            <button className="player-btn player-btn-back" title="Previous">
              <Icon name="skipBack" size={18} />
            </button>
            <button className="player-btn player-btn-play" disabled>
              <Icon name="play" size={24} />
            </button>
            <button className="player-btn player-btn-forward" title="Next">
              <Icon name="skipForward" size={18} />
            </button>
            <button className="player-btn" title="Repeat">
              <Icon name="repeat" size={18} />
            </button>
          </div>
        </div>
        <div className="music-player-right">
          <div className="player-volume">
            <button className="player-btn" onClick={handleToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              <Icon name={isMuted ? 'volumeMute' : 'volume'} size={18} />
            </button>
          </div>
        </div>
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    )
  }

  return (
    <div className="music-player">
      <div className="music-player-left">
        <div className="player-art">
          {currentTrack.album?.cover_medium ? (
            <img src={currentTrack.album.cover_medium} alt={currentTrack.title} />
          ) : (
            <Icon name="music" size={24} />
          )}
        </div>
        <div className="player-info">
          <span className="player-title">{currentTrack.title}</span>
          <span className="player-artist">{currentTrack.artist?.name || 'Unknown'}</span>
        </div>
        <button className="player-like-btn" onClick={() => useStore.getState().addToPlaylist(currentTrack)} title="Like">
          <Icon name="heart" size={16} />
        </button>
      </div>

      <div className="music-player-center">
        <div className="player-controls">
          <button
            className={cn('player-btn', shuffleEnabled && 'player-btn-active')}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            <Icon name="shuffle" size={18} />
          </button>
          <button className="player-btn player-btn-back" onClick={handlePrev} title="Previous">
            <Icon name="skipBack" size={18} />
          </button>
          <button className="player-btn player-btn-play" onClick={handlePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Icon name="pause" size={24} /> : <Icon name="play" size={24} />}
          </button>
          <button className="player-btn player-btn-forward" onClick={handleNext} title="Next">
            <Icon name="skipForward" size={18} />
          </button>
          <button
            className={cn('player-btn', repeatMode !== 'none' && 'player-btn-active')}
            onClick={() => setRepeatMode(repeatMode === 'none' ? 'repeat-all' : 'repeat-one')}
            title="Repeat"
          >
            <Icon name="repeat" size={18} />
          </button>
        </div>

        <div className="player-progress">
          <span className="player-time">{formatTime(currentTime)}</span>
          <div className="progress-bar-container" onMouseDown={handleSeek}>
            <div className="progress-track">
              <div
                className="progress-fill progress-fill-primary"
                style={{ width: `${progress}%` }}
              >
                <div className="progress-knob" />
              </div>
            </div>
          </div>
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="music-player-right">
        <div className="player-volume">
          <button className="player-btn" onClick={handleToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            <Icon name={isMuted || volume === 0 ? 'volumeMute' : 'volume'} size={18} />
          </button>
          <div className="volume-slider">
            <input
              type="range"
              className="volume-input"
              min="0"
              max="1"
              step="0.01"
              value={currentVolume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>

      {isLoading && <div className="player-loading-overlay" />}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
