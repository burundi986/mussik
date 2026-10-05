import { useRef } from 'react'
import { Icon } from './Icon'
import { MusicCard } from './MusicCard'
import { cn } from '../../utils/helpers'

export function HorizontalCarousel({ title, items, type, onPlay, loading, error, emptyMessage }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (loading) {
    return (
      <section className="carousel">
        <div className="carousel-header">
          <div className="skeleton skeleton-title" style={{ width: 200, height: 24 }} />
        </div>
        <div className="carousel-track">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="carousel-skeleton-card">
              <div className="skeleton" style={{ width: 160, height: 160, borderRadius: 8 }} />
              <div className="skeleton" style={{ width: '80%', height: 14, marginTop: 8 }} />
              <div className="skeleton" style={{ width: '60%', height: 12, marginTop: 4 }} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="carousel">
        <div className="carousel-header">
          <h3 className="carousel-title">{title}</h3>
        </div>
        <div className="carousel-empty">
          <p>{error}</p>
        </div>
      </section>
    )
  }

  if (!items || items.length === 0) {
    return (
      <section className="carousel">
        <div className="carousel-header">
          <h3 className="carousel-title">{title}</h3>
        </div>
        <div className="carousel-empty">
          <p>{emptyMessage || 'No items found'}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="carousel">
      <div className="carousel-header">
        <h3 className="carousel-title">{title}</h3>
        <div className="carousel-nav">
          <button className="carousel-btn carousel-btn-left" onClick={() => scroll('left')}>
            <Icon name="chevronRight" size={20} />
          </button>
          <button className="carousel-btn carousel-btn-right" onClick={() => scroll('right')}>
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      </div>
      <div className="carousel-track" ref={scrollRef}>
        {items.map((item, index) => (
          <div key={`${type}-${item.id}-${index}`} className="carousel-item">
            {type === 'track' && (
              <MusicCard data={item} type="track" size="md" onPlay={onPlay} />
            )}
            {type === 'artist' && (
              <MusicCard data={item} type="artist" size="md" onPlay={onPlay} />
            )}
            {type === 'album' && (
              <MusicCard data={item} type="album" size="md" onPlay={onPlay} />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
