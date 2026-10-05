import { useState } from 'react'
import { useStore } from '../../store'
import { Icon } from '../ui/Icon'

export function TopNavigation() {
  const { searchQuery, setSearchQuery } = useStore()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <button className="top-nav-btn">
          <Icon name="menu" size={22} />
        </button>
        <div className={`top-nav-search ${searchFocused ? 'search-focused' : ''}`}>
          <span className="search-icon"><Icon name="search" size={18} /></span>
          <input
            type="search"
            className="search-input"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <Icon name="close" size={14} />
            </button>
          )}
          <kbd className="search-kbd">Ctrl K</kbd>
        </div>
      </div>
      <div className="top-nav-right">
        <button className="top-nav-btn" title="Shuffle">
          <Icon name="shuffle" size={20} />
        </button>
        <button className="top-nav-btn" title="Previous">
          <Icon name="repeat" size={20} />
        </button>
        <button className="top-nav-btn" title="Notifications">
          <Icon name="more" size={20} />
        </button>
        <div className="user-menu">
          <div className="user-avatar">
            <span>U</span>
          </div>
          <div className="user-dropdown">
            <button className="user-menu-btn">
              <span className="user-name">User</span>
              <span className="user-chevron"><Icon name="chevronDown" size={14} /></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
