// Node smoke test for src/api/services/auth.js against a localStorage shim.
// Run: node test/auth-service.test.mjs
import assert from 'node:assert/strict'

const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}

const svc = await import('../src/api/services/auth.js')

let passed = 0
function check(name, fn) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e) {
    console.error(`FAIL  ${name}\n      ${e.message}`)
    process.exitCode = 1
  }
}

async function rejects(name, promise, pattern) {
  try {
    await promise
    console.error(`FAIL  ${name}\n      expected a rejection`)
    process.exitCode = 1
  } catch (e) {
    if (pattern.test(e.message)) {
      passed++
      console.log(`  ok  ${name}`)
    } else {
      console.error(`FAIL  ${name}\n      wrong message: ${e.message}`)
      process.exitCode = 1
    }
  }
}

async function resolves(name, promise) {
  try {
    const value = await promise
    passed++
    console.log(`  ok  ${name}`)
    return value
  } catch (e) {
    console.error(`FAIL  ${name}\n      ${e.message}`)
    process.exitCode = 1
  }
}

console.log('validation')
check('rejects empty email', () => assert.ok(svc.validateEmail('')))
check('rejects malformed email', () => assert.ok(svc.validateEmail('nope')))
check('accepts a valid email', () => assert.equal(svc.validateEmail('a@b.co'), null))
check('rejects empty password', () => assert.ok(svc.validatePassword('')))
check('rejects a short password', () => assert.ok(svc.validatePassword('short')))
check('accepts an 8+ character password', () => assert.equal(svc.validatePassword('longenough'), null))

console.log('register')
await resolves(
  'registers an account',
  svc.register({ name: 'Ada Lovelace', email: 'Ada@Example.COM', password: 'analytical1' }),
)
check('session is created', () => {
  const s = svc.getSession()
  assert.equal(s.email, 'ada@example.com')
  assert.equal(s.name, 'Ada Lovelace')
})
check('session does not carry the hash', () =>
  assert.ok(!store.get('musiiik_session').includes('passwordHash')),
)
check('stored accounts hold no plaintext password', () =>
  assert.ok(!store.get('musiiik_accounts').includes('analytical1')),
)
await rejects(
  'duplicate email is rejected',
  svc.register({ name: 'Dup', email: 'ada@example.com', password: 'another123' }),
  /already exists/,
)

console.log('login')
await rejects(
  'wrong password is rejected',
  svc.login({ email: 'ada@example.com', password: 'wrongpassword' }),
  /Incorrect email or password/,
)
await rejects(
  'unknown email gives the same message',
  svc.login({ email: 'nobody@example.com', password: 'analytical1' }),
  /Incorrect email or password/,
)
await resolves(
  'correct credentials are accepted case- and space-insensitively',
  svc.login({ email: '  ADA@example.com ', password: 'analytical1' }),
)

console.log('logout')
check('logout clears the session', () => {
  svc.logout()
  assert.equal(svc.getSession(), null)
})

console.log(`\n${passed} checks passed`)
if (process.exitCode) process.exit(process.exitCode)