import { useState, useEffect, useRef } from 'react'
import { cn } from '../../utils/helpers'

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeStyles = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
    full: 'modal-full',
  }[size]

  return (
    <div
      ref={overlayRef}
      className={cn('modal-overlay', isOpen ? 'modal-overlay-visible' : 'modal-overlay-hidden')}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className={cn('modal-content', sizeStyles, 'animate-scale-in')}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// eslint-disable-next-line react/only-export-components
export function useModal() {
  const [isOpen, setIsOpen] = useState(false)
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    props: { isOpen, onClose: () => setIsOpen(false) },
  }
}
