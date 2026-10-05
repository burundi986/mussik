import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Icon } from '../components/ui/Icon'
import { validateEmail, validatePassword } from '../api/services/auth'

export default function Signup() {
  const navigate = useNavigate()
  const { signup, loading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [agreed, setAgreed] = useState(false)

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [field]: null }))
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nextErrors = {
      name: form.name.trim().length >= 2 ? null : 'Enter your name',
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword:
        form.confirmPassword === form.password ? null : 'Passwords do not match',
      terms: agreed ? null : 'You must accept the terms to continue',
    }
    setFieldErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const result = await signup({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    if (result.ok) navigate('/', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo"><Icon name="music" size={26} color="#aa3bff" /></span>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start listening in a couple of seconds</p>
        </div>

        {error && (
          <div className="auth-alert" role="alert">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={update('name')}
            error={fieldErrors.name}
            icon={<Icon name="user" size={16} />}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            error={fieldErrors.email}
            icon={<Icon name="mail" size={16} />}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={update('password')}
            error={fieldErrors.password}
            hint={!fieldErrors.password ? 'Use 8 characters or more' : ''}
            icon={<Icon name="lock" size={16} />}
            required
          />

          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            error={fieldErrors.confirmPassword}
            icon={<Icon name="lock" size={16} />}
            required
          />

          <div className="auth-terms">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked)
                  setFieldErrors((prev) => ({ ...prev, terms: null }))
                }}
              />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>
            {fieldErrors.terms && <span className="auth-error-text">{fieldErrors.terms}</span>}
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Create account
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}