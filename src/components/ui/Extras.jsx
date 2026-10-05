import { cn } from '../../utils/helpers'

export function ToggleGroup({ options, value, onChange, className = '' }) {
  return (
    <div className={cn('toggle-group', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          className={cn('toggle-option', value === option.value && 'toggle-option-active')}
          onClick={() => onChange?.(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Slider({ value = 50, min = 0, max = 100, onChange, className = '' }) {
  return (
    <div className={cn('slider', className)}>
      <input
        type="range"
        className="slider-input"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
      />
      <div className="slider-track">
        <div className="slider-fill" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
      </div>
      <div className="slider-value">{value}</div>
    </div>
  )
}

export function ProgressBar({ value = 0, max = 100, className = '', showLabel = false, color = 'primary' }) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className={cn('progress-bar', className)}>
      <div className="progress-track">
        <div className={cn('progress-fill', `progress-fill-${color}`)} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <span className="progress-label">{percentage}%</span>}
    </div>
  )
}

export function Avatar({ src, alt = '', size = 'md', fallback }) {
  const [error, setError] = useState(false)
  return (
    <div className={cn('avatar', `avatar-${size}`)}>
      {src && !error ? (
        <img src={src} alt={alt} onError={() => setError(true)} className="avatar-img" />
      ) : (
        <div className="avatar-fallback">{fallback || alt?.charAt(0)?.toUpperCase() || '?'}</div>
      )}
    </div>
  )
}

export function Stat({ label, value, change, changeType = 'up', icon }) {
  return (
    <div className="stat">
      {icon && <span className="stat-icon">{icon}</span>}
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
      {change && (
        <span className={cn('stat-change', `stat-change-${changeType}`)}>
          {changeType === 'up' ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
  )
}
