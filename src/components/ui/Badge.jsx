import { useState, useEffect, useRef } from 'react'
import { cn } from '../../utils/helpers'

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  return (
    <span className={cn('badge', `badge-${variant}`, `badge-${size}`, className)}>
      {children}
    </span>
  )
}

export function Switch({ checked = false, onChange, disabled = false, size = 'md' }) {
  return (
    <button
      className={cn('switch', `switch-${size}`, checked && 'switch-checked', disabled && 'switch-disabled')}
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
    >
      <span className="switch-thumb" />
    </button>
  )
}

export function Tooltip({ children, content, position = 'top' }) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const positions = {
        top: { top: rect.top - tooltipRect.height - 8, left: rect.left + rect.width / 2 - tooltipRect.width / 2 },
        bottom: { top: rect.bottom + 8, left: rect.left + rect.width / 2 - tooltipRect.width / 2 },
        left: { top: rect.top + rect.height / 2 - tooltipRect.height / 2, left: rect.left - tooltipRect.width - 8 },
        right: { top: rect.top + rect.height / 2 - tooltipRect.height / 2, left: rect.right + 8 },
      }
      setCoords(positions[position] || positions.top)
    }
  }, [visible, position])

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          className="tooltip-content animate-fade-in"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 2000,
          }}
        >
          {content}
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  )
}
