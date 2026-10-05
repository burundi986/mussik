import { cn } from '../../utils/helpers'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  ...props
}) {
  const baseStyles = 'btn'
  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    accent: 'btn-accent',
  }[variant]
  const sizeStyles = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }[size]

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variantStyles,
        sizeStyles,
        fullWidth && 'btn-full',
        disabled && 'btn-disabled',
        loading && 'btn-loading',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {!loading && icon && <span className="btn-icon btn-icon-left">{icon}</span>}
      <span className="btn-text">{children}</span>
      {!loading && iconRight && <span className="btn-icon btn-icon-right">{iconRight}</span>}
    </button>
  )
}
