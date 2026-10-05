import { Icon } from '../ui/Icon'
import { cn } from '../../utils/helpers'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'tracks', label: 'Songs' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums' },
]

const sources = [
  { id: 'all', label: 'Every source', icon: 'search' },
  { id: 'deezer', label: 'Deezer', icon: 'music' },
  { id: 'audius', label: 'Audius', icon: 'music' },
]

export function SearchFilters({ active, onChange, activeSource = 'all', onSourceChange }) {
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
              <Icon name={src.icon} size={16} />
              <span>{src.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}