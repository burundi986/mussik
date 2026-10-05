// Local account emulation for the login/signup UI.
//
// This is NOT authentication. There is no auth backend in this repository, so
// accounts and sessions live in localStorage and can be edited by anyone with
// devtools. It exists so the screens are wired end to end; swap the bodies for
// real `fetch` calls to your auth API before this is used for anything real.
//
// Passwords are stored as a SHA-256 digest rather than plaintext so a casual
// look at localStorage does not reveal them. That is obfuscation, not
// protection: a digest of a weak password is still trivially reversible.

const ACCOUNTS_KEY = 'musiiik_accounts'
const SESSION_KEY = 'musiiik_session'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode, quota); the session simply
    // will not persist across reloads.
  }
}

async function hashPassword(password) {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return `plain:${password}`
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(password))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return 'Enter a valid email address'
  return null
}

export function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  return null
}

export async function register({ name, email, password }) {
  const accounts = readJson(ACCOUNTS_KEY, [])
  const normalizedEmail = email.trim().toLowerCase()

  if (accounts.some((a) => a.email === normalizedEmail)) {
    throw new Error('An account with that email already exists')
  }

  const account = {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  }

  writeJson(ACCOUNTS_KEY, [...accounts, account])

  const { passwordHash: _hash, ...session } = account
  writeJson(SESSION_KEY, session)
  return session
}

export async function login({ email, password }) {
  const accounts = readJson(ACCOUNTS_KEY, [])
  const normalizedEmail = email.trim().toLowerCase()
  const account = accounts.find((a) => a.email === normalizedEmail)

  // Deliberately vague so this cannot be used to enumerate which emails exist.
  if (!account) {
    throw new Error('Incorrect email or password')
  }
  if (account.passwordHash !== (await hashPassword(password))) {
    throw new Error('Incorrect email or password')
  }

  const { passwordHash: _hash, ...session } = account
  writeJson(SESSION_KEY, session)
  return session
}

export function getSession() {
  return readJson(SESSION_KEY, null)
}

export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {}
}