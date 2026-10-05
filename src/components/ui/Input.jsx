import { cn } from '../../utils/helpers'

export function Input({
  label,
  placeholder = '',
  type = 'text',
  value = '',
  onChange,
  error = '',
  hint = '',
  disabled = false,
  className = '',
  icon,
  iconRight,
  ...props
}) {
  return (
    <div className={cn('input-wrapper', className)}>
      {label && (
        <label className="input-label">
          {label}
          {props.required && <span className="input-required">*</span>}
        </label>
      )}
      <div className={cn('input-container', error && 'input-error')}>
        {icon && <span className="input-icon input-icon-left">{icon}</span>}
        <input
          type={type}
          className="input-field"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        {iconRight && <span className="input-icon input-icon-right">{iconRight}</span>}
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  )
}
