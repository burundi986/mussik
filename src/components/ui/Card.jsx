import { cn } from '../../utils/helpers'

export function Card({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  variant = 'default',
  padding = 'md',
  hover = false,
  ...props
}) {
  const paddingStyles = {
    none: 'card-padding-none',
    sm: 'card-padding-sm',
    md: 'card-padding-md',
    lg: 'card-padding-lg',
  }[padding]

  return (
    <div
      className={cn(
        'card',
        `card-variant-${variant}`,
        paddingStyles,
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {(title || headerAction) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  )
}
