import { useState, useRef, useEffect } from 'react'
import { cn } from '../../utils/helpers'

export function Dropdown({ trigger, children, align = 'left', width = 'auto' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (isOpen && triggerRef.current && menuRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8,
        left: align === 'right' ? rect.right - menuRef.current.offsetWidth : rect.left,
      })
    }
  }, [isOpen, align])

  useEffect(() => {
    const handleClick = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target) &&
          menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} style={{ display: 'contents' }}>
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          className="dropdown-menu animate-slide-down"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            minWidth: width,
            zIndex: 1000,
          }}
        >
          <div className="dropdown-inner">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ children, onClick, icon, danger = false }) {
  return (
    <button
      className={cn('dropdown-item', danger && 'dropdown-item-danger')}
      onClick={(e) => { onClick?.(e) }}
    >
      {icon && <span className="dropdown-item-icon">{icon}</span>}
      <span className="dropdown-item-text">{children}</span>
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="dropdown-separator" />
}

export function DropdownLabel({ children }) {
  return <div className="dropdown-label">{children}</div>
}
