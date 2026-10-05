# Musiiik — React Music Streaming Application

A modern music streaming web application built with React, Vite, and Tailwind CSS. Musiiik connects to the Deezer, Audiomack, and Audius APIs for music discovery and streaming.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Features

- **Search**: Live search across songs, artists, and albums with debounced results
- **Multi-source**: Search Deezer and Audius together, or filter down to one provider; every card is badged with its source
- **Login / Signup**: Auth screens with validation and a persistent session
- **Music Player**: Full-featured audio player with seek, volume, shuffle, repeat, queue
- **Browse**: Browse trending, popular artists, albums, and playlists
- **Library**: Your personal library with liked songs and playlists
- **Responsive Design**: Works from mobile to desktop (1024px+)

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Zustand 5
- **Routing**: React Router DOM 7
- **Audio**: HTML5 Audio API
- **Icons**: Custom SVG icons with dangerouslySetInnerHTML
- **Build**: Vite production build, deployable to any static host
- **Styling**: Tailwind CSS with custom CSS variables

## 📁 Project Structure

```
musiiik/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Individual UI components (buttons, inputs, modals, etc.)
│   │   └── pages/          # Page components (Home, Search, Browse, etc.)
│   ├── store/              # Zustand state management
│   ├── api/                # API services (Deezer, Audiomack, Audius integration)
│   ├── config/             # Application configuration
│   ├── hooks/              # Custom React hooks
│   └── layout/             # Layout components (AppLayout, Sidebar, MusicPlayer, TopNavigation)
│   └── main.jsx            # Entry point
├── test/                   # Node + headless-Chrome checks
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
├── index.css               # Global Tailwind + custom styles
└── .env*                 # Environment variables
```

## ⚙️ Environment Variables

Copy `.env.example` and modify as needed:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_TITLE` | No | App title, defaults to "Musiiik" |
| `VITE_API_BASE_URL` | Yes | Backend API base URL |
| `VITE_APP_VERSION` | No | App version, defaults to "0.0.0" |
| `NODE_ENV` | No | Environment, "development" or "production" |
| `VITE_AUDIOMACK_CONSUMER_KEY` | No | Audiomack consumer key from https://developer.audiomack.com/ |
| `VITE_AUDIOMACK_CONSUMER_SECRET` | No | Audiomack consumer secret |
| `VITE_AUDIUS_APP_NAME` | No | App name Audius attaches to each request, defaults to "musiik" |
| `VITE_AUDIUS_API_KEY` | No | Audius API key from https://api.audius.co/plans — only raises rate limits |
| `VITE_AUDIUS_API_SECRET` | No | Audius key secret for signed write requests; unused by the read-only service |
| `VITE_DEEZER_BASE` | Yes in production | Base URL for Deezer calls; must be a CORS-enabled proxy. Defaults to `/deezer-api`, which only exists in `npm run dev` |

> **Warning**
> Anything prefixed with `VITE_` is inlined into the client bundle at build time
> and is readable by every visitor. Never put a secret in a `VITE_` variable on a
> publicly deployed site — proxy privileged calls through a serverless function
> instead. The Audius read endpoints work without any credentials, so
> `VITE_AUDIUS_API_KEY` is optional and only affects rate limits.

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server at http://localhost:3000 |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Oxlint code linting |
| `npm run test:auth` | Node test for the auth service (no browser needed) |
| `npm run test:browser` | End-to-end checks against a running dev server |

`test:browser` drives headless Chrome over the DevTools protocol and needs three
things: the dev server already running, `CHROME_PATH` pointing at a Chrome or
Edge executable, and `ORIGIN` (defaults to `http://localhost:5173`) matching it.

```bash
CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe" \
  npm run test:browser
```

## 📱 Deployment

Musiiik is a static single-page app. Build it and serve the `dist/` directory
from any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages):

```bash
npm run build
```

Because routing uses `BrowserRouter`, the host must rewrite unknown paths to
`index.html` so deep links like `/search` resolve to the app.

### Deezer needs a proxy

Deezer sends no `Access-Control-Allow-Origin` header, so browsers block direct
requests to `api.deezer.com`. In development, `vite.config.js` proxies
`/deezer-api` through to Deezer and `src/api/services/deezer.js` calls that
path. A static deploy has no such proxy, so set `VITE_DEEZER_BASE` to a
same-origin or CORS-enabled endpoint that fronts `api.deezer.com`; without one,
Deeper-backed features will fail in production. Audius needs no proxy.

## 🔐 Authentication

`/login` and `/signup` are fully wired screens: validation, error states,
loading states, and a session that survives reloads. They route outside
`AppLayout` so they render without the sidebar or player, and the top-right nav
switches between Log in / Sign up links and the signed-in user with a sign-out
control.

> **Warning**
> There is no auth backend in this repository. `src/api/services/auth.js` keeps
> accounts and sessions in `localStorage` so the screens work end to end, and
> hashes passwords with SHA-256 so they are not sitting in cleartext. That is
> obfuscation, not security: anyone with devtools can read or edit the store, and
> a weak password is still easy to recover from its digest. Treat this as a UI
> demo until you replace the function bodies with real `fetch` calls to your own
> API.

## 🔧 Development

- Components are organized under `src/components/ui/` and `src/components/pages/`
- State is managed with Zustand in `src/store/index.js`, plus `src/store/auth.js` for the session
- API calls go through `src/api/services/` (`deezer.js`, `audius.js`, `audiomack.js`, `auth.js`)
- Result items are tagged with `source`, and artwork/audio are resolved by shape via `getArtwork` / `getAudioSource` in `src/utils/helpers.js`
- Global styles in `src/index.css`
- Icons in `src/components/ui/Icon.jsx`

## 📄 License

MITc