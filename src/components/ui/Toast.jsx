import { useState, useEffect, createContext, useContext } from 'react'
import { cn } from '../../utils/helpers'

// eslint-disable-next-line react/only-export-components
export const ToastContext = createContext(null)
let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const newId = ++toastId
    setToasts((prev) => [...prev, { ...toast, id: newId }])
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newId))
      }, toast.duration || 4000)
    }
    return newId
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn('toast', `toast-${toast.type}`, 'animate-slide-right')}
          >
            <span className="toast-icon">{toast.icon || getToastIcon(toast.type)}</span>
            <div className="toast-content">
              {toast.title && <strong className="toast-title">{toast.title}</strong>}
              {toast.message && <p className="toast-message">{toast.message}</p>}
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function getToastIcon(type) {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'warning': return '⚠'
    case 'info': return 'ℹ'
    default: return '•'
  }
}

export function Toast({ message, title, type = 'info', duration = 4000, icon }) {
  const { addToast } = useContext(ToastContext)

  useEffect(() => {
    addToast({ message, title, type, duration, icon })
  }, [message, title, type, duration, icon, addToast])

  return null
}

// eslint-disable-next-line react/only-export-components
export function useToast() {
  const { addToast } = useContext(ToastContext)
  return {
    success: (message, title) => addToast({ message, title, type: 'success' }),
    error: (message, title) => addToast({ message, title, type: 'error', duration: 6000 }),
    warning: (message, title) => addToast({ message, title, type: 'warning' }),
    info: (message, title) => addToast({ message, title, type: 'info' }),
  }
}
