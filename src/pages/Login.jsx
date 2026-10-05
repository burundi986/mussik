import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Icon } from '../components/ui/Icon'
import { validateEmail } from '../api/services/auth'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [field]: null }))
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nextErrors = {
      email: validateEmail(form.email),
      password: form.password ? null : 'Password is required',
    }
    setFieldErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    const result = await login(form)
    if (result.ok) navigate('/', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo"><Icon name="music" size={26} color="#aa3bff" /></span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to pick up where you left off</p>
        </div>

        {error && (
          <div className="auth-alert" role="alert">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={update('password')}
            error={fieldErrors.password}
            icon={<Icon name="lock" size={16} />}
            required
          />

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="auth-footer">
          New to Musiiik? <Link to="/signup" className="auth-link">Create an account</Link>
        </p>
      </div>
    </div>
  )
}