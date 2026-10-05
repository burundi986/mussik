import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../../store'
import { apiService } from '../../api/services/deezer'
import { Icon } from '../ui/Icon'
import { cn } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'
import { SearchSuggestions } from '../ui/SearchSuggestions'
import { SearchHistory } from '../ui/SearchHistory'
import { SearchFilters } from '../ui/SearchFilters'
import { HorizontalCarousel } from '../ui/HorizontalCarousel'
import { EmptyState, ErrorState } from '../ui/ApiStates'

const MAX_HISTORY = 20

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ tracks: [], artists: [], albums: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchHistory, setSearchHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const debouncedQuery = useDebounce(query, 350)
  const searchRef = useRef(null)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('musiiik_search_history') || '[]')
      setSearchHistory(stored)
    } catch {}
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ tracks: [], artists: [], albums: [] })
      setLoading(false)
      setError(null)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const search = async () => {
      setLoading(true)
      setError(null)
      try {
        const [trackData, artistData, albumData] = await Promise.all([
          apiService.searchSongs(debouncedQuery, 10),
          apiService.searchArtists(debouncedQuery, 5),
          apiService.searchAlbums(debouncedQuery, 5),
        ])
        setResults({
          tracks: trackData.results,
          artists: artistData.results,
          albums: albumData.results,
        })
      } catch (err) {
        setError(err.message || 'Search failed')
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [debouncedQuery])

  const handleSearch = useCallback((searchQuery) => {
    setQuery(searchQuery)
    setShowSuggestions(false)
    setShowHistory(false)
    if (searchQuery.trim()) {
      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item !== searchQuery.trim())
        const updated = [searchQuery.trim(), ...filtered].slice(0, MAX_HISTORY)
        try {
          localStorage.setItem('musiiik_search_history', JSON.stringify(updated))
        } catch {}
        return updated
      })
    }
  }, [])

  const clearHistory = () => {
    setSearchHistory([])
    try {
      localStorage.removeItem('musiiik_search_history')
    } catch {}
  }

  const handleSuggestionClick = (text) => {
    handleSearch(text)
  }

  const filtered = activeCategory === 'all'
    ? results
    : {
        tracks: activeCategory === 'tracks' ? results.tracks : [],
        artists: activeCategory === 'artists' ? results.artists : [],
        albums: activeCategory === 'albums' ? results.albums : [],
      }

  const hasResults = filtered.tracks.length > 0 || filtered.artists.length > 0 || filtered.albums.length > 0
  const totalResults = filtered.tracks.length + filtered.artists.length + filtered.albums.length

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1 className="search-page-title">Search</h1>
        <div className="search-page-search" ref={searchRef}>
          <div className="search-input-wrapper">
            <span className="search-input-icon">
              <Icon name="search" size={20} />
            </span>
            <input
              type="search"
              className="search-input-field"
              placeholder="Search songs, artists, albums..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestions(true)
                setShowHistory(false)
              }}
              onFocus={() => {
                if (query) {
                  setShowSuggestions(true)
                } else {
                  setShowHistory(true)
                  setShowSuggestions(false)
                }
              }}
            />
            {query && (
              <button
                className="search-input-clear"
                onClick={() => {
                  setQuery('')
                  setResults({ tracks: [], artists: [], albums: [] })
                }}
              >
                <Icon name="close" size={16} />
              </button>
            )}
            {loading && <div className="search-input-spinner" />}
          </div>

          {showSuggestions && query.trim() && (
            <SearchSuggestions
              query={query}
              onSelect={handleSuggestionClick}
              onClose={() => setShowSuggestions(false)}
            />
          )}

          {showHistory && !query && (
            <SearchHistory
              history={searchHistory}
              onSelect={handleSuggestionClick}
              onClear={clearHistory}
              onClose={() => setShowHistory(false)}
            />
          )}
        </div>
      </div>

      {query.trim() && (
        <div className="search-page-body">
          <SearchFilters active={activeCategory} onChange={setActiveCategory} />

          {hasResults && (
            <p className="search-results-count">
              {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>
          )}

          {loading && (
            <div className="search-loading">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="search-skeleton-item">
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 8 }} />
                  <div className="search-skeleton-content">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-subtitle" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <ErrorState message={error} onRetry={() => handleSearch(query)} />
          )}

          {!loading && !error && query.trim() && !hasResults && (
            <EmptyState type="noResults" query={query} />
          )}

          {!loading && !error && filtered.artists.length > 0 && (
            <HorizontalCarousel
              title="Artists"
              items={filtered.artists}
              type="artist"
            />
          )}

          {!loading && !error && filtered.albums.length > 0 && (
            <HorizontalCarousel
              title="Albums"
              items={filtered.albums}
              type="album"
            />
          )}

          {!loading && !error && filtered.tracks.length > 0 && (
            <HorizontalCarousel
              title="Songs"
              items={filtered.tracks}
              type="track"
            />
          )}
        </div>
      )}

      {!query.trim() && (
        <div className="search-page-body">
          <h2 className="search-section-title">Recent Searches</h2>
          {searchHistory.length > 0 ? (
            <div className="search-history-recent">
              {searchHistory.slice(0, 10).map((item, i) => (
                <button
                  key={i}
                  className="search-history-item"
                  onClick={() => handleSearch(item)}
                >
                  <Icon name="search" size={16} />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState type="search" />
          )}
        </div>
      )}
    </div>
  )
}
