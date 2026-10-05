import { cn } from '../../utils/helpers'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'tracks', label: 'Songs' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums' },
]

// Audius is the primary source: it is listed first and selected by default.
const sources = [
  { id: 'audius', label: 'Audius' },
  { id: 'all', label: 'Every source' },
  { id: 'deezer', label: 'Deezer' },
]

export function SearchFilters({ active, onChange, activeSource = 'audius', onSourceChange }) {
  return (
    <>
      <div className="search-filters">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={cn('search-filter-btn', active === cat.id && 'search-filter-active')}
            onClick={() => onChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {onSourceChange && (
        <div className="search-sources">
          <span className="search-sources-label">Source</span>
          {sources.map((src) => (
            <button
              key={src.id}
              className={cn('search-source-btn', activeSource === src.id && 'search-source-active')}
              onClick={() => onSourceChange(src.id)}
              title={`Search ${src.label}`}
            >
              <span>{src.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}