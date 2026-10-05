// Minimal CDP driver: launches headless Chrome, evaluates assertions in the page,
// and prints results. Uses the Node global WebSocket (Node 22+), no dependencies.
//
// Run: node test/browser-check.mjs
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_PATH
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173'
const PORT = 9222 + Math.floor(Math.random() * 400)

if (!CHROME) {
  console.error('Set CHROME_PATH to a Chrome/Edge executable')
  process.exit(1)
}

const profile = mkdtempSync(join(tmpdir(), 'cdp-'))
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--mute-audio',
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${PORT}`,
  'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Attach to a real page target. The browser-level endpoint only serves browser
// domains, so Page.* has to go through a target's own debugger URL.
async function getPageWsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const targets = await res.json()
      const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(250)
  }
  throw new Error('Chrome did not expose a page debugging endpoint')
}

class Session {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.events = []
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(msg.error.message))
        else resolve(msg.result)
      } else if (msg.method) {
        this.events.push(msg)
      }
    })
  }

  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id)
          reject(new Error(`${method} timed out`))
        }
      }, 30000)
    })
  }
}

async function connect(url) {
  const ws = new WebSocket(url)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', () => reject(new Error('ws failed')), { once: true })
  })
  return new Session(ws)
}

async function evaluate(s, expression) {
  const res = await s.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description || 'evaluate threw')
  }
  return res.result.value
}

async function goto(s, path) {
  await s.send('Page.navigate', { url: ORIGIN + path })
  // Wait for React to commit rather than a fixed sleep.
  for (let i = 0; i < 80; i++) {
    await sleep(150)
    const ready = await evaluate(
      s,
      `document.readyState === 'complete' && !!document.querySelector('#root')?.firstElementChild`,
    ).catch(() => false)
    if (ready) return
  }
  throw new Error(`${path} never finished rendering`)
}

let failures = 0
function expect(label, actual, predicate, description) {
  const ok = predicate(actual)
  if (ok) {
    console.log(`  ok  ${label}`)
  } else {
    failures++
    console.error(`FAIL  ${label}\n      ${description}\n      got: ${JSON.stringify(actual)}`)
  }
}

const PROBE = `(() => {
  const q = (s) => document.querySelector(s)
  const text = (s) => q(s)?.textContent?.trim() ?? null
  return {
    rootHtml: q('#root')?.firstElementChild?.className ?? null,
    title: text('.auth-title'),
    subtitle: text('.auth-subtitle'),
    formCount: document.querySelectorAll('.auth-form').length,
    inputNames: [...document.querySelectorAll('.auth-form input')].map((i) => i.name + ':' + i.type),
    labels: [...document.querySelectorAll('.auth-form label')].map((l) => l.textContent.trim()),
    submitText: text('.auth-form button[type="submit"]'),
    footer: text('.auth-footer'),
    alert: text('.auth-alert'),
    loginLink: !!q('.auth-footer a[href="/login"]'),
    signupLink: !!q('.auth-footer a[href="/signup"]'),
    forgotLink: !!q('a[href="/forgot-password"]'),
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }
})()`

try {
  const wsUrl = await getPageWsUrl()
  const s = await connect(wsUrl)

  await s.send('Page.enable')
  await s.send('Runtime.enable')
  await s.send('Log.enable')
  await s.send('Network.enable')

  const consoleErrors = []
  s.ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      consoleErrors.push(msg.params.entry.text)
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(
        msg.params.exceptionDetails.exception?.description || 'uncaught exception',
      )
    }
  })

  console.log('login page')
  await goto(s, '/login')
  const login = await evaluate(s, PROBE)
  expect('renders the auth shell', login.rootHtml, (v) => v === 'auth-page', 'root should be .auth-page')
  expect('shows the welcome title', login.title, (v) => v === 'Welcome back', 'expected "Welcome back"')
  expect('has one form', login.formCount, (v) => v === 1, 'expected exactly one form')
  expect('collects email and password', login.inputNames, (v) =>
    JSON.stringify(v) === JSON.stringify(['email:email', 'password:password']),
    'unexpected inputs: ' + JSON.stringify(login.inputNames))
  expect('labels both fields', login.labels, (v) => v.length >= 2, 'expected at least 2 labels')
  expect('submit button is labelled', login.submitText, (v) => v === 'Sign in', 'expected "Sign in"')
  expect('links to signup', login.signupLink, (v) => v === true, 'expected a /signup link')

  console.log('signup page')
  await goto(s, '/signup')
  const signup = await evaluate(s, PROBE)
  expect('renders the auth shell', signup.rootHtml, (v) => v === 'auth-page', 'root should be .auth-page')
  expect('shows the create title', signup.title, (v) => v === 'Create your account', 'expected "Create your account"')
  expect('collects name, email and both passwords', signup.inputNames, (v) =>
    v.filter((x) => x.startsWith('name')).length === 1 &&
    v.filter((x) => x.startsWith('email')).length === 1 &&
    v.filter((x) => x.startsWith('password')).length === 1 &&
    v.filter((x) => x.startsWith('confirmPassword')).length === 1,
    'unexpected inputs: ' + JSON.stringify(signup.inputNames))
  expect('submit button is labelled', signup.submitText, (v) => v === 'Create account', 'expected "Create account"')
  expect('links to login', signup.loginLink, (v) => v === true, 'expected a /login link')

  console.log('empty submit shows validation errors')
  await goto(s, '/signup')
  await evaluate(s, `document.querySelector('.auth-form button[type="submit"]').click()`)
  await sleep(400)
  const invalid = await evaluate(s, `(() => ({
    errors: [...document.querySelectorAll('.input-error-text, .auth-error-text')].map((e) => e.textContent.trim()),
    stillOnSignup: location.pathname === '/signup',
  }))()`)
  expect('blocks submit and shows errors', invalid.errors, (v) => v.length >= 3,
    'expected several validation messages, got ' + JSON.stringify(invalid.errors))
  expect('stays on /signup', invalid.stillOnSignup, (v) => v === true, 'navigation should not happen')

  console.log('signup -> session -> logout round trip')
  const email = `browser.${Date.now()}@example.com`
  await evaluate(s, `(() => {
    const set = (name, value) => {
      const el = document.querySelector('.auth-form input[name="' + name + '"]')
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(el, value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    set('name', 'Browser Tester')
    set('email', ${JSON.stringify(email)})
    set('password', 'browserpass123')
    set('confirmPassword', 'browserpass123')
    const box = document.querySelector('.auth-checkbox input[type="checkbox"]')
    box.click()
    return true
  })()`)
  await sleep(300)
  await evaluate(s, `document.querySelector('.auth-form button[type="submit"]').click()`)
  await sleep(1200)
  const afterSignup = await evaluate(s, `(() => ({
    path: location.pathname,
    session: JSON.parse(localStorage.getItem('musiiik_session') || 'null'),
    navUser: document.querySelector('.user-name')?.textContent?.trim() ?? null,
    accountsHaveHash: (localStorage.getItem('musiiik_accounts') || '').includes('browserpass123'),
  }))()`)
  expect('redirects into the app', afterSignup.path, (v) => v === '/', 'expected /')
  expect('stores a session without a password', afterSignup.session?.email, (v) => v === email,
    'session email mismatch: ' + JSON.stringify(afterSignup.session))
  expect('no plaintext password on disk', afterSignup.accountsHaveHash, (v) => v === false,
    'plaintext password found in localStorage')
  expect('top nav shows the signed-in user', afterSignup.navUser, (v) => v === 'Browser Tester',
    'expected the user name in the nav')

  console.log('login again in a fresh page load')
  await goto(s, '/login')
  await evaluate(s, `(() => {
    const set = (name, value) => {
      const el = document.querySelector('.auth-form input[name="' + name + '"]')
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(el, value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    set('email', ${JSON.stringify(email)})
    set('password', 'browserpass123')
    return true
  })()`)
  await sleep(300)
  await evaluate(s, `document.querySelector('.auth-form button[type="submit"]').click()`)
  await sleep(1200)
  const afterLogin = await evaluate(s, `(() => ({
    path: location.pathname,
    navUser: document.querySelector('.user-name')?.textContent?.trim() ?? null,
  }))()`)
  expect('logs in with stored credentials', afterLogin.path, (v) => v === '/', 'expected /')
  expect('nav shows the user', afterLogin.navUser, (v) => v === 'Browser Tester', 'nav mismatch')

  console.log('wrong password is rejected')
  await goto(s, '/login')
  await evaluate(s, `(() => {
    const set = (name, value) => {
      const el = document.querySelector('.auth-form input[name="' + name + '"]')
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(el, value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    set('email', ${JSON.stringify(email)})
    set('password', 'wrongpassword')
    return true
  })()`)
  await sleep(300)
  await evaluate(s, `document.querySelector('.auth-form button[type="submit"]').click()`)
  await sleep(900)
  const badLogin = await evaluate(s, `(() => ({
    alert: document.querySelector('.auth-alert')?.textContent?.trim() ?? null,
    path: location.pathname,
  }))()`)
  expect('shows an error and stays put', badLogin.alert, (v) => /incorrect email or password/i.test(v || ''),
    'expected an "Incorrect email or password" alert, got ' + JSON.stringify(badLogin.alert))
  expect('does not navigate', badLogin.path, (v) => v === '/login', 'expected to stay on /login')

  console.log('logout')
  // Sign-out lives in the app shell, so go back into the app first.
  await goto(s, '/')
  expect('signed-in nav is present before logout', await evaluate(s, `!!document.querySelector('.user-menu-signout')`),
    (v) => v === true, 'expected a sign-out control')
  await evaluate(s, `document.querySelector('.user-menu-signout').click()`)
  await sleep(600)
  const afterLogout = await evaluate(s, `(() => ({
    session: localStorage.getItem('musiiik_session'),
    signupLink: !!document.querySelector('.user-menu a[href="/signup"]'),
    navUser: document.querySelector('.user-name')?.textContent?.trim() ?? null,
  }))()`)
  expect('clears the session', afterLogout.session, (v) => v === null, 'session should be gone')
  expect('shows login/signup links again', afterLogout.signupLink, (v) => v === true, 'expected a /signup link')

  console.log('shell routes still work')
  for (const path of ['/', '/browse', '/library', '/settings', '/search']) {
    await goto(s, path)
    const info = await evaluate(s, `(() => ({
      path: location.pathname,
      hasSidebar: !!document.querySelector('.sidebar, .app-sidebar, aside'),
      child: document.querySelector('#root')?.firstElementChild?.className ?? null,
    }))()`)
    expect(`${path} renders`, info.path, (v) => v === path, `expected ${path}`)
  }

  console.log('search page merges Deezer and Audius')
  await goto(s, '/search')
  // The filters only render once a query exists, so type first.
  await evaluate(s, `(() => {
    const el = document.querySelector('.search-input-field')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, 'daft punk')
    el.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  })()`)
  await sleep(500)

  const filters = await evaluate(s, `(() => ({
    categories: [...document.querySelectorAll('.search-filters .search-filter-btn')].map((b) => b.textContent.trim()),
    sources: [...document.querySelectorAll('.search-sources .search-source-btn')].map((b) => b.textContent.trim()),
    activeSource: document.querySelector('.search-source-active')?.textContent?.trim() ?? null,
  }))()`)
  expect('shows the category filters', filters.categories, (v) =>
    JSON.stringify(v) === JSON.stringify(['All', 'Songs', 'Artists', 'Albums']), 'categories: ' + JSON.stringify(filters.categories))
  expect('lists Audius first as the primary source', filters.sources, (v) =>
    JSON.stringify(v) === JSON.stringify(['Audius', 'Every source', 'Deezer']), 'sources: ' + JSON.stringify(filters.sources))
  expect('defaults to Audius', filters.activeSource, (v) => v === 'Audius', 'active: ' + filters.activeSource)

  let searchState = null
  for (let i = 0; i < 120; i++) {
    await sleep(250)
    searchState = await evaluate(s, `(() => ({
      loading: !!document.querySelector('.search-loading'),
      count: document.querySelector('.search-results-count')?.textContent?.trim() ?? null,
      titles: [...document.querySelectorAll('.music-card-title')].map((e) => e.textContent.trim()).slice(0, 12),
      sources: [...document.querySelectorAll('.music-card-source')].map((e) => e.textContent.trim()),
      notice: document.querySelector('.search-notice')?.textContent?.trim() ?? null,
      error: document.querySelector('.error-state, .api-error')?.textContent?.trim() ?? null,
      empty: !!document.querySelector('.empty-state'),
    }))()`)
    if (!searchState.loading && (searchState.titles.length > 0 || searchState.error || searchState.empty)) break
  }
  expect('returns results for a query', searchState.titles.length, (v) => v > 0,
    'no track cards rendered. state: ' + JSON.stringify(searchState))
  expect('reports a result count', searchState.count, (v) => typeof v === 'string' && /result/i.test(v),
    'count text: ' + JSON.stringify(searchState.count))
  expect('badges each card with its source', searchState.sources.length, (v) => v > 0,
    'no source badges rendered')
  expect('defaults to Audius-only results', [...new Set(searchState.sources)], (v) =>
    v.length === 1 && v[0] === 'Audius', 'unexpected badges: ' + JSON.stringify([...new Set(searchState.sources)]))
  expect('reports no error', searchState.error, (v) => !v, 'error: ' + JSON.stringify(searchState.error))

  console.log('Every source merges Deezer and Audius')
  await evaluate(s, `(() => {
    const btn = [...document.querySelectorAll('.search-source-btn')].find((b) => b.textContent.trim() === 'Every source')
    btn.click()
    return true
  })()`)
  let mergedState = null
  for (let i = 0; i < 120; i++) {
    await sleep(250)
    mergedState = await evaluate(s, `(() => ({
      loading: !!document.querySelector('.search-loading'),
      sources: [...document.querySelectorAll('.music-card-source')].map((e) => e.textContent.trim()),
      active: document.querySelector('.search-source-active')?.textContent?.trim() ?? null,
      notice: document.querySelector('.search-notice')?.textContent?.trim() ?? null,
    }))()`)
    if (!mergedState.loading && new Set(mergedState.sources).size > 1) break
  }
  expect('activates the Every source filter', mergedState.active, (v) => v === 'Every source',
    'active: ' + mergedState.active)
  expect('merges both providers', [...new Set(mergedState.sources)].sort(), (v) =>
    v.length === 2, 'expected both Deezer and Audius, got ' + JSON.stringify([...new Set(mergedState.sources)]))

  console.log('Deezer filter narrows to Deezer')
  await evaluate(s, `(() => {
    const btn = [...document.querySelectorAll('.search-source-btn')].find((b) => b.textContent.trim() === 'Deezer')
    btn.click()
    return true
  })()`)
  let deezerState = null
  for (let i = 0; i < 120; i++) {
    await sleep(250)
    deezerState = await evaluate(s, `(() => ({
      loading: !!document.querySelector('.search-loading'),
      sources: [...document.querySelectorAll('.music-card-source')].map((e) => e.textContent.trim()),
      titles: document.querySelectorAll('.music-card-title').length,
      active: document.querySelector('.search-source-active')?.textContent?.trim() ?? null,
    }))()`)
    if (!deezerState.loading && deezerState.titles > 0) break
  }
  expect('activates the Deezer filter', deezerState.active, (v) => v === 'Deezer', 'active: ' + deezerState.active)
  expect('returns Deezer results', deezerState.titles, (v) => v > 0, 'no results for the Deezer filter')
  expect('shows only Deezer badges', [...new Set(deezerState.sources)], (v) =>
    v.length === 1 && v[0] === 'Deezer', 'unexpected badges: ' + JSON.stringify([...new Set(deezerState.sources)]))

  console.log('only track cards are playable')
  const playability = await evaluate(s, `(() => {
    const sectionOf = (name) => [...document.querySelectorAll('.carousel')]
      .find((s) => s.querySelector('.carousel-title')?.textContent.trim() === name)
    const songs = sectionOf('Songs')
    const artists = sectionOf('Artists')
    return {
      songCards: songs?.querySelectorAll('.music-card').length ?? 0,
      songPlayButtons: songs?.querySelectorAll('.music-card-action-btn').length ?? 0,
      artistCards: artists?.querySelectorAll('.music-card').length ?? 0,
      artistPlayButtons: artists?.querySelectorAll('.music-card-action-btn').length ?? 0,
    }
  })()`)
  expect('song cards offer a play button', playability.songPlayButtons, (v) => v > 0,
    'no play buttons in the Songs carousel')
  expect('artist cards offer no play button', playability.artistPlayButtons, (v) => v === 0,
    'artist cards should not be playable, found ' + playability.artistPlayButtons)
  expect('artist cards still render', playability.artistCards, (v) => v > 0, 'no artist cards')

  console.log('home page streams Audius trending music')
  await goto(s, '/')
  let homeState = null
  for (let i = 0; i < 120; i++) {
    await sleep(250)
    homeState = await evaluate(s, `(() => {
      const sectionOf = (name) => [...document.querySelectorAll('.carousel')]
        .find((s) => s.querySelector('.carousel-title')?.textContent.trim() === name)
      return {
        skeletons: !!document.querySelector('.carousel-skeleton-card'),
        error: document.querySelector('.error-state')?.textContent?.trim() ?? null,
        trackCards: sectionOf('Trending on Audius')?.querySelectorAll('.music-card').length ?? 0,
        playlistCards: sectionOf('Trending playlists')?.querySelectorAll('.music-card').length ?? 0,
        heroTitle: document.querySelector('.home-hero-title')?.textContent?.trim() ?? null,
        emptyMsg: document.querySelector('.carousel-empty')?.textContent?.trim() ?? null,
      }
    })()`)
    if (!homeState.skeletons && (homeState.trackCards > 0 || homeState.error)) break
  }
  expect('home renders a hero', homeState.heroTitle, (v) => typeof v === 'string' && v.length > 0,
    'no hero title')
  expect('home shows trending tracks', homeState.trackCards, (v) => v > 0,
    'no trending track cards. state: ' + JSON.stringify(homeState))
  expect('home shows trending playlists', homeState.playlistCards, (v) => v > 0,
    'no trending playlist cards. state: ' + JSON.stringify(homeState))
  expect('home reports no error', homeState.error, (v) => !v, 'error: ' + JSON.stringify(homeState.error))

  console.log('an Audius track actually plays')
  // A synthetic el.click() carries no user activation, so Chrome's autoplay
  // policy rejects audio.play(). Dispatch a real mouse event at the button's
  // coordinates so this exercises the same path a user's click does.
  const playPoint = await evaluate(s, `(() => {
    const section = [...document.querySelectorAll('.carousel')]
      .find((s) => s.querySelector('.carousel-title')?.textContent.trim() === 'Trending on Audius')
    const card = section?.querySelector('.music-card')
    if (!card) return null
    const title = card.querySelector('.music-card-title')?.textContent.trim()
    const btn = card.querySelector('.music-card-action-btn')
    btn.scrollIntoView({ block: 'center' })
    const r = btn.getBoundingClientRect()
    return { title, x: r.left + r.width / 2, y: r.top + r.height / 2 }
  })()`)
  expect('located a trending track play button', playPoint, (v) => v !== null, 'no play button found')
  const playedTitle = playPoint.title

  await s.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: playPoint.x, y: playPoint.y, button: 'left', clickCount: 1,
  })
  await s.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: playPoint.x, y: playPoint.y, button: 'left', clickCount: 1,
  })

  let playback = null
  for (let i = 0; i < 120; i++) {
    await sleep(500)
    playback = await evaluate(s, `(() => {
      const audio = document.querySelector('audio')
      if (!audio) return { hasAudio: false }
      return {
        hasAudio: true,
        src: (audio.src || '').slice(0, 60),
        currentTime: audio.currentTime,
        duration: audio.duration,
        readyState: audio.readyState,
        error: audio.error ? audio.error.code : null,
      }
    })()`)
    if (playback.currentTime > 0.2 || playback.error) break
  }
  expect('the player loads an Audius stream', playback.src, (v) =>
    /audius|monophonic/i.test(v || ''), 'audio src was ' + playback.src)
  expect('audio advances', playback.currentTime, (v) => v > 0.2, 'currentTime stayed at 0')
  expect('audio reports no error', playback.error, (v) => v === null, 'media error code ' + playback.error)
  expect('the player shows the track title', await evaluate(s,
    `document.querySelector('.player-title')?.textContent?.trim() ?? null`),
    (v) => v === playedTitle, `expected "${playedTitle}"`)

  console.log('next and previous walk the carousel queue')
  const srcBefore = await evaluate(s, `(document.querySelector('audio')?.src || '').slice(0, 90)`)
  const nextBtn = await evaluate(s, `(() => {
    const btn = [...document.querySelectorAll('.music-player button')]
      .find((b) => b.title === 'Next')
    if (!btn) return null
    btn.scrollIntoView({ block: 'center' })
    const r = btn.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }
  })()`)
  expect('found a next button', nextBtn, (v) => v !== null && v.w > 0 && v.h > 0,
    'no next control in the player: ' + JSON.stringify(nextBtn))
  await sleep(300)
  // Re-read after scrolling settles; the rect moves once the player is in view.
  const nextPt = await evaluate(s, `(() => {
    const btn = [...document.querySelectorAll('.music-player button')].find((b) => b.title === 'Next')
    const r = btn.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  })()`)
  await s.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: nextPt.x, y: nextPt.y, button: 'left', clickCount: 1,
  })
  await s.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: nextPt.x, y: nextPt.y, button: 'left', clickCount: 1,
  })
  let advanced = null
  // Wait for the queue to advance AND the new stream to actually start; an
  // Audius stream needs a moment to buffer after the src swaps.
  for (let i = 0; i < 90; i++) {
    await sleep(400)
    advanced = await evaluate(s, `(() => ({
      title: document.querySelector('.player-title')?.textContent?.trim() ?? null,
      src: (document.querySelector('audio')?.src || '').slice(0, 90),
      currentTime: document.querySelector('audio')?.currentTime ?? 0,
    }))()`)
    if (advanced.title && advanced.title !== playedTitle && advanced.src !== srcBefore && advanced.currentTime > 0) break
  }
  expect('next advances to another track', advanced.title, (v) =>
    typeof v === 'string' && v.length > 0 && v !== playedTitle,
    `title stayed "${advanced.title}" (src before: ${srcBefore})`)
  expect('the new track loads its own stream', advanced.src, (v) =>
    /audius|monophonic/i.test(v || ''), 'audio src was ' + advanced.src)
  expect('the stream actually changed', advanced.src !== srcBefore, (v) => v === true,
    `src unchanged: ${advanced.src}`)
  expect('the new track plays', advanced.currentTime, (v) => v > 0, 'currentTime stayed at 0')

  console.log('console errors')
  const noisy = consoleErrors.filter((t) =>
    !/favicon|Download the React DevTools|net::ERR_|Failed to load resource/i.test(t),
  )
  expect('no console errors', noisy, (v) => v.length === 0, 'console errors: ' + JSON.stringify(noisy))
} finally {
  chrome.kill()
  try { rmSync(profile, { recursive: true, force: true }) } catch {}
}

console.log(failures ? `\n${failures} browser checks failed` : '\nall browser checks passed')
process.exit(failures ? 1 : 0)