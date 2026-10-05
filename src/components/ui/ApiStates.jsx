import { cn } from '../../utils/helpers'

export function SearchLoadingSkeleton() {
  return (
    <div className="search-loading">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="search-skeleton-item">
          <div className="skeleton skeleton-icon" />
          <div className="search-skeleton-content">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h3 className="error-title">Something went wrong</h3>
      <p className="error-message">{message || 'Unable to fetch results. Please try again.'}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ type = 'search', query }) {
  const icons = {
    search: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M8 11h6" />
      </svg>
    ),
    noResults: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15s1.5-2 4-2 4 2 4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    library: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  }

  const messages = {
    search: { title: 'Start searching', message: 'Search for songs, artists, or albums to get started' },
    noResults: { title: `No results for "${query}"`, message: 'Try a different search term or check your spelling' },
    library: { title: 'Your library is empty', message: 'Add songs, artists, or albums to see them here' },
  }

  const content = messages[type] || messages.search

  return (
    <div className="empty-state">
      <div className="empty-icon">{icons[type] || icons.search}</div>
      <h3 className="empty-title">{content.title}</h3>
      <p className="empty-message">{content.message}</p>
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }) {
  return (
    <div className={cn('loading-spinner', `loading-spinner-${size}`)}>
      <div className="spinner-ring" />
    </div>
  )
}
