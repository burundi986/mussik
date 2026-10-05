import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store'
import { useAuthStore } from '../../store/auth'
import { Icon } from '../ui/Icon'

export function TopNavigation() {
  const { searchQuery, setSearchQuery } = useStore()
  const { user, logout } = useAuthStore()
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
          {user ? (
            <>
              <div className="user-avatar">
                <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
              </div>
              <div className="user-dropdown">
                <button className="user-menu-btn">
                  <span className="user-name">{user.name || user.email}</span>
                  <span className="user-chevron"><Icon name="chevronDown" size={14} /></span>
                </button>
                <button className="user-menu-btn user-menu-signout" onClick={logout}>
                  <Icon name="logOut" size={14} />
                  <span className="user-name">Sign out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="user-menu-btn">Log in</Link>
              <Link to="/signup" className="user-menu-btn user-menu-cta">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
