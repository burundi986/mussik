import { Link } from 'react-router-dom'
import { useStore } from '../../store'
import { navSections, librarySections } from '../../config/nav'
import { Icon } from '../ui/Icon'

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore()
  const activePaths = ['/', '/search', '/trending']

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="logo-icon">
            <Icon name="music" size={22} color="#aa3bff" />
          </div>
          {sidebarOpen && <span className="logo-text">Musiiik</span>}
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <div className="sidebar-content">
        {sidebarOpen ? (
          <nav className="sidebar-nav">
            {navSections.map((section) => (
              <div key={section.title} className="sidebar-section">
                <h3 className="sidebar-section-title">{section.title}</h3>
                <ul className="sidebar-section-list">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        className={`nav-link ${activePaths.includes(item.path) ? 'active' : ''}`}
                      >
                        <span className="nav-icon">
                          <Icon name={item.icon} size={20} />
                        </span>
                        <span className="nav-label">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="sidebar-section">
              <h3 className="sidebar-section-title">LIBRARY</h3>
              <ul className="sidebar-section-list">
                {librarySections.map((item) => (
                  <li key={item.id}>
                    <Link to={item.path} className="nav-link">
                      <span className="nav-icon">
                        <Icon name={item.icon} size={20} />
                      </span>
                      <span className="nav-label">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        ) : (
          <nav className="sidebar-nav sidebar-nav-collapsed">
            {navSections.map((section) => (
              <div key={section.title} className="sidebar-section">
                <ul className="sidebar-section-list">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        className={`nav-link nav-link-collapsed ${activePaths.includes(item.path) ? 'active' : ''}`}
                        title={item.label}
                      >
                        <span className="nav-icon">
                          <Icon name={item.icon} size={20} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="sidebar-section">
              <ul className="sidebar-section-list">
                {librarySections.map((item) => (
                  <li key={item.id}>
                    <Link to={item.path} className="nav-link nav-link-collapsed" title={item.label}>
                      <span className="nav-icon">
                        <Icon name={item.icon} size={20} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </aside>
  )
}
