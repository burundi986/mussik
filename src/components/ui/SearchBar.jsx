import { cn } from '../../utils/helpers'

export function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search...',
  icon = '🔍',
  className = '',
  ...props
}) {
  return (
    <div className={cn('search-bar', className)}>
      <span className="search-bar-icon">{icon}</span>
      <input
        type="search"
        className="search-bar-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {value && (
        <button className="search-bar-clear" onClick={() => onChange?.('')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
