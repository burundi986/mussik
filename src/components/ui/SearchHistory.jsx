import { Icon } from './Icon'
import { cn } from '../../utils/helpers'

export function SearchHistory({ history, onSelect, onClear, onClose }) {
  return (
    <div className="search-history">
      <div className="search-history-header">
        <h4 className="search-history-title">
          <Icon name="clock" size={16} />
          Recent searches
        </h4>
        {history.length > 0 && (
          <button className="search-history-clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      {history.length > 0 ? (
        <ul className="search-history-list">
          {history.map((item, index) => (
            <li
              key={index}
              className="search-history-item"
              onClick={() => onSelect(item)}
            >
              <Icon name="search" size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="search-history-empty">No recent searches</p>
      )}
    </div>
  )
}
