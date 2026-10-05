import { cn } from '../../utils/helpers'

export function Tabs({ tabs, activeTab, onTabChange, className = '' }) {
  return (
    <div className={cn('tabs', className)}>
      <div className="tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn('tab', activeTab === tab.id && 'tab-active')}
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            {tab.label}
            {tab.badge && <span className="tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
