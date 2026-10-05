import { useState, useEffect } from 'react'
import { apiService } from '../../api/services/deezer'
import { Icon } from './Icon'
import { cn } from '../../utils/helpers'

export function SearchSuggestions({ query, onSelect, onClose }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [trackData, artistData] = await Promise.all([
          apiService.searchSongs(query, 4),
          apiService.searchArtists(query, 4),
        ])
        const items = [
          ...trackData.results.map((t) => ({ type: 'track', ...t })),
          ...artistData.results.map((a) => ({ type: 'artist', ...a })),
        ]
        setSuggestions(items.slice(0, 8))
      } catch {}
      finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  if (loading) {
    return (
      <div className="search-suggestions">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="search-suggestion-item">
            <div className="skeleton" style={{ width: 20, height: 20 }} />
            <div className="skeleton" style={{ width: '60%', height: 14 }} />
          </div>
        ))}
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <div className="search-suggestions">
      {suggestions.map((item, index) => (
        <button
          key={`${item.type}-${item.id}-${index}`}
          className="search-suggestion-item"
          onClick={() => onSelect(item.title || item.name)}
        >
          <span className="search-suggestion-icon">
            {item.type === 'artist' ? (
              <Icon name="user" size={16} />
            ) : (
              <Icon name="music" size={16} />
            )}
          </span>
          <span className="search-suggestion-text">
            {item.title || item.name}
            <span className="search-suggestion-type">
              {item.type === 'artist' ? 'Artist' : 'Song'}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
