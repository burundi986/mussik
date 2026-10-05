import { Icon } from '../ui/Icon'
import { cn } from '../../utils/helpers'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'tracks', label: 'Songs' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums' },
]

export function SearchFilters({ active, onChange }) {
  return (
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
  )
}
